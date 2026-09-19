// Two databases, deliberately.
//
// The split is by who OWNS the data, not by which service writes it:
//
//   botDb  (trh_bot)        — the bot's own runtime state. `guildConfig` is
//                             read by the bot on essentially every message
//                             and written by /setup; `featureManifest` is
//                             published by the bot at boot. This API is a
//                             second EDITOR of that data, not its owner, so
//                             it writes the same documents the bot reads
//                             rather than keeping a copy. A copy is what the
//                             first version of this file did, and nothing a
//                             server manager saved ever reached the bot.
//
//   siteDb (alice_website)  — this service's own data: the config audit
//                             trail, and whatever sessions/analytics come
//                             later. The bot never connects to it, and if it
//                             disappeared the bot would not notice.
//
// Credentials: BOT_MONGODB_URI should NOT be the bot's own connection string.
// It should be a dedicated Atlas user whose custom role grants readWrite on
// guildConfig and read on featureManifest, and nothing else. Handing this
// service the bot's full-privilege URI would mean a bug in a config route is
// one step away from economyAccounts.

import { MongoClient } from 'mongodb';

const connections = {
  bot: { client: null, db: null },
  site: { client: null, db: null },
};

async function connect(key, { uriVar, dbVar, defaultDb, label }) {
  const uri = process.env[uriVar];
  if (!uri) {
    console.warn(`⚠️  ${uriVar} not set — ${label} is unavailable until it is configured.`);
    return null;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env[dbVar] || defaultDb);

  connections[key] = { client, db };
  console.log(`✅ Connected to MongoDB (${label}: ${db.databaseName})`);
  return db;
}

// Both are optional at boot and neither failing takes the API down: OAuth
// login and the public endpoints work without any database at all, and a
// route that needs one returns 503 rather than the whole service refusing to
// start over a feature that isn't configured yet.
export async function connectMongo() {
  const results = await Promise.allSettled([
    connect('bot', {
      uriVar: 'BOT_MONGODB_URI',
      dbVar: 'BOT_MONGODB_DB_NAME',
      defaultDb: 'trh_bot',
      label: 'bot config',
    }),
    connect('site', {
      uriVar: 'MONGODB_URI',
      dbVar: 'MONGODB_DB_NAME',
      defaultDb: 'alice_website',
      label: 'website data',
    }),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('❌ MongoDB connection failed:', result.reason?.message || result.reason);
    }
  }
}

function require_(key, message) {
  const db = connections[key].db;
  if (!db) {
    const err = new Error('Database not connected');
    err.status = 503;
    err.publicMessage = message;
    throw err;
  }
  return db;
}

// The bot's database. Everything guild configuration touches lives here.
export function getBotDb() {
  return require_('bot', 'Server configuration is unavailable right now (BOT_MONGODB_URI is not set).');
}

// This service's own database. Audit trail and anything else the website
// owns outright.
export function getSiteDb() {
  return require_('site', 'Website storage is unavailable right now (MONGODB_URI is not set).');
}

// True when the site database is up. The audit trail is best-effort — a
// config change must not fail because the audit write can't happen — so
// callers check rather than catching a thrown 503.
export function hasSiteDb() {
  return Boolean(connections.site.db);
}

export async function closeMongo() {
  await Promise.allSettled(
    Object.values(connections).map(({ client }) => (client ? client.close() : null)),
  );
}
