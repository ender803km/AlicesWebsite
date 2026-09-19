// The bot's own description of what it can do, read from the document it
// publishes at boot (see the bot repo's core/manifest.js).
//
// This is what keeps the dashboard from needing a hardcoded module list. The
// previous version of this API had one — twelve camelCase keys that matched
// nothing in the bot — and that list was the whole reason the dashboard and
// the bot drifted apart. Nothing in this service should ever name a feature
// or a config field again; it all comes from here.

import { getBotDb } from '../services/mongo.js';

const COLLECTION = 'featureManifest';
const DOC_ID = 'current';

// The manifest only changes when the bot redeploys, so a short cache saves a
// query on every dashboard page load without ever being meaningfully stale.
const CACHE_TTL_MS = 60_000;
let cache = { at: 0, manifest: null };

export async function getManifest({ bypassCache = false } = {}) {
  if (!bypassCache && cache.manifest && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.manifest;
  }

  const doc = await getBotDb().collection(COLLECTION).findOne({ _id: DOC_ID });

  if (!doc || !Array.isArray(doc.features)) {
    const err = new Error('Feature manifest missing');
    err.status = 503;
    err.publicMessage =
      'The bot has not published its feature list yet. It publishes one every time it starts, so this clears itself once the bot has restarted.';
    throw err;
  }

  cache = { at: Date.now(), manifest: doc };
  return doc;
}

export async function getFeature(key) {
  const manifest = await getManifest();
  return manifest.features.find((f) => f.key === key) || null;
}

// Every config field the bot has declared as writable, mapped to the setting
// that owns it. A field that isn't in here cannot be written through this
// API — which is the point. The bot decides what is configurable by
// exporting a configSchema; this service just enforces that decision.
export async function writableFields() {
  const manifest = await getManifest();
  const map = new Map(); // fieldName -> { feature, setting }

  for (const feature of manifest.features) {
    for (const setting of feature.settings || []) {
      for (const field of setting.fields || []) {
        if (!map.has(field)) map.set(field, { feature, setting });
      }
    }
  }
  return map;
}

// Feature keys that name `key` as a HARD requirement. Mirrors
// core/features.js's dependentsOf(), minus softRequires — those degrade
// rather than break, so they never cascade.
export async function hardDependentsOf(key) {
  const manifest = await getManifest();
  return manifest.features.filter((f) => (f.requires || []).includes(key));
}
