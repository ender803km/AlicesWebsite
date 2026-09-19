// Per-server configuration, read and written against the SAME documents the
// bot reads: trh_bot.guildConfig, one document per guild.
//
// The shape of that document is not defined here and must never be. Every
// field this file will read or write comes from the manifest the bot
// publishes, which is generated from each module's own configSchema. If a
// field isn't in the manifest, this API refuses to write it — so the bot,
// not the website, decides what is configurable.
//
// Two separate axes live in the same document and are handled by the two
// halves of this file, because conflating them is exactly what went wrong
// before:
//
//   featuresDisabled  — an opt-OUT array of feature keys. Empty means
//                       everything is on. Changed only through
//                       setFeatureEnabled() below.
//   everything else   — individual settings (channels, roles, numbers,
//                       booleans), changed through applySettings().
//
// Note that some of those settings are themselves booleans that read like
// on/off switches (llmModEnabled, giftingEnabled, alliancesEnabled). They
// are NOT the same thing as the feature toggle: they mean "has this guild
// configured this yet", default to false, and the bot's core/features.js is
// explicit that the two must not be merged.

import { getBotDb, getSiteDb, hasSiteDb } from '../services/mongo.js';
import { getManifest, getFeature, writableFields, hardDependentsOf } from './featureManifest.js';

const COLLECTION = 'guildConfig';
const AUDIT_COLLECTION = 'configAudit';

const SNOWFLAKE = /^\d{17,20}$/;
const MAX_MULTI_CHANNEL = 50;

// ─── Reading ─────────────────────────────────────────────────────────────────

function rawDoc(guildId) {
  return getBotDb().collection(COLLECTION).findOne({ guildId });
}

// The dashboard's whole view of one server: every feature the bot registered,
// whether it's on here, and the current value of each of its settings.
//
// Composed server-side on purpose. The frontend should not have to know that
// "enabled" means "absent from featuresDisabled", or which document field
// backs which control.
export async function getGuildView(guildId) {
  const [manifest, doc] = await Promise.all([getManifest(), rawDoc(guildId)]);
  const config = doc || {};
  const disabled = new Set(config.featuresDisabled || []);

  const features = manifest.features.map((feature) => ({
    key: feature.key,
    label: feature.label,
    description: feature.description,
    alwaysOn: feature.alwaysOn,
    requires: feature.requires || [],
    softRequires: feature.softRequires || [],
    enabled: feature.alwaysOn || !disabled.has(feature.key),
    settings: (feature.settings || []).map((setting) => ({
      key: setting.key,
      label: setting.label,
      type: setting.type,
      description: setting.description,
      fields: setting.fields,
      // Keyed by field rather than a single `value` so a setting that writes
      // more than one field needs no special case at either end.
      values: Object.fromEntries(
        (setting.fields || []).map((field) => [field, config[field] ?? null]),
      ),
    })),
  }));

  return {
    guildId,
    // Distinguishes "no document yet" from "a document with nothing set",
    // the same way the bot's guildConfigExists() does.
    configured: Boolean(doc),
    manifestPublishedAt: manifest.publishedAt || null,
    features,
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(type, value) {
  switch (type) {
    case 'boolean':
      return typeof value === 'boolean' ? { ok: true, value } : { ok: false, expected: 'true or false' };

    case 'numeric':
      return Number.isSafeInteger(value) ? { ok: true, value } : { ok: false, expected: 'a whole number' };

    case 'channel':
    case 'role':
      if (value === null || value === '') return { ok: true, value: null };
      return typeof value === 'string' && SNOWFLAKE.test(value)
        ? { ok: true, value }
        : { ok: false, expected: 'a Discord ID, or null to clear it' };

    case 'multiChannel': {
      if (!Array.isArray(value)) return { ok: false, expected: 'a list of Discord IDs' };
      if (value.length > MAX_MULTI_CHANNEL) {
        return { ok: false, expected: `at most ${MAX_MULTI_CHANNEL} channels` };
      }
      const clean = [...new Set(value)];
      return clean.every((id) => typeof id === 'string' && SNOWFLAKE.test(id))
        ? { ok: true, value: clean }
        : { ok: false, expected: 'a list of Discord IDs' };
    }

    default:
      // An unrecognised type means the bot published a control this API
      // doesn't know how to check. Refusing is the only safe answer —
      // guessing would write an unvalidated value into the bot's database.
      return { ok: false, expected: `a value this API knows how to validate (unsupported type "${type}")` };
  }
}

function badRequest(message, details) {
  const err = new Error(message);
  err.status = 400;
  err.publicMessage = message;
  if (details) err.details = details;
  return err;
}

// ─── Writing settings ────────────────────────────────────────────────────────

export async function applySettings(guildId, fields, actorId) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    throw badRequest('Expected a "fields" object of setting values.');
  }

  const allowed = await writableFields();
  const patch = {};
  const rejected = [];

  for (const [field, value] of Object.entries(fields)) {
    // featuresDisabled is a field on the same document, but it is not a
    // setting and has its own endpoint with its own dependency rules.
    // Letting it through here would be a way to bypass them entirely.
    if (field === 'featuresDisabled') {
      rejected.push({ field, reason: 'Use the feature enable/disable endpoint for this.' });
      continue;
    }

    const entry = allowed.get(field);
    if (!entry) {
      rejected.push({ field, reason: 'Not a configurable field on this bot.' });
      continue;
    }

    const result = validate(entry.setting.type, value);
    if (!result.ok) {
      rejected.push({ field, reason: `Expected ${result.expected}.` });
      continue;
    }

    patch[field] = result.value;
  }

  if (rejected.length) {
    throw badRequest('Some settings could not be saved.', rejected);
  }
  if (!Object.keys(patch).length) {
    throw badRequest('No settings to save.');
  }

  const before = await rawDoc(guildId);

  await getBotDb()
    .collection(COLLECTION)
    .updateOne({ guildId }, { $set: { guildId, ...patch } }, { upsert: true });

  await audit(guildId, actorId, {
    kind: 'settings',
    fields: Object.keys(patch),
    after: patch,
    before: Object.fromEntries(Object.keys(patch).map((f) => [f, before?.[f] ?? null])),
  });

  return getGuildView(guildId);
}

// ─── Enabling and disabling features ─────────────────────────────────────────

// Mirrors core/features.js's checkRequirements() + disableWithCascade(),
// against manifest data instead of the live registry. The bot enforces these
// rules for /setup; they have to hold here too, or the dashboard becomes a
// way around them.
export async function setFeatureEnabled(guildId, key, enabled, actorId) {
  const feature = await getFeature(key);

  if (!feature) {
    const err = new Error('Unknown feature');
    err.status = 404;
    err.publicMessage = `This bot has no feature called "${key}".`;
    throw err;
  }

  if (feature.alwaysOn) {
    throw badRequest(`${feature.label} is part of the bot's core and can't be turned off.`);
  }

  const doc = await rawDoc(guildId);
  const disabled = new Set(doc?.featuresDisabled || []);
  const collection = getBotDb().collection(COLLECTION);

  if (enabled) {
    // Every hard requirement must already be on. Reported all at once rather
    // than one at a time, so the UI can name everything still needed.
    const missing = (feature.requires || []).filter((req) => disabled.has(req));
    if (missing.length) {
      const manifest = await getManifest();
      const labels = missing.map(
        (req) => manifest.features.find((f) => f.key === req)?.label || req,
      );
      const err = new Error('Unmet requirements');
      err.status = 409;
      err.publicMessage = `${feature.label} needs ${labels.join(' and ')} turned on first.`;
      err.details = { missing };
      throw err;
    }

    // $pull rather than writing the whole array back: the bot writes this
    // same field, and a read-modify-write would silently undo a change made
    // in Discord between the read above and this write.
    await collection.updateOne({ guildId }, { $pull: { featuresDisabled: key } }, { upsert: true });

    await audit(guildId, actorId, { kind: 'feature', feature: key, enabled: true });
    return { feature, cascaded: [] };
  }

  // Disabling: everything that hard-requires this, transitively, goes too.
  // softRequires deliberately doesn't cascade — those modules degrade rather
  // than break, which is the distinction core/features.js draws.
  const toDisable = [key];
  const seen = new Set([key]);
  const queue = [key];

  while (queue.length) {
    const current = queue.shift();
    for (const dependent of await hardDependentsOf(current)) {
      if (seen.has(dependent.key)) continue;
      if (dependent.alwaysOn) continue;
      if (disabled.has(dependent.key)) continue; // already off
      seen.add(dependent.key);
      toDisable.push(dependent.key);
      queue.push(dependent.key);
    }
  }

  await collection.updateOne(
    { guildId },
    { $addToSet: { featuresDisabled: { $each: toDisable } } },
    { upsert: true },
  );

  const manifest = await getManifest();
  const cascaded = toDisable
    .filter((k) => k !== key)
    .map((k) => manifest.features.find((f) => f.key === k) || { key: k, label: k });

  await audit(guildId, actorId, {
    kind: 'feature',
    feature: key,
    enabled: false,
    cascaded: cascaded.map((f) => f.key),
  });

  return { feature, cascaded };
}

// ─── Audit trail ─────────────────────────────────────────────────────────────

// Lives in the WEBSITE's database, not the bot's: it records what happened on
// this dashboard, which is this service's own data and none of the bot's
// business. Best-effort by design — a change the user made successfully must
// not be reported as failed because the audit write didn't land.
async function audit(guildId, actorId, entry) {
  if (!hasSiteDb()) return;
  try {
    await getSiteDb().collection(AUDIT_COLLECTION).insertOne({
      guildId,
      actorId: actorId || null,
      at: new Date(),
      ...entry,
    });
  } catch (err) {
    console.error('⚠️  Failed to write config audit entry:', err.message);
  }
}
