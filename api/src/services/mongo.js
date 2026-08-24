// Single shared MongoDB connection for the whole process. Phase 3 data
// (per-guild dashboard config) lives here — deliberately its own database,
// separate from whatever the bot's own MONGODB_URI points at, so nothing
// here can collide with the bot's existing collections.

import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      '⚠️  MONGODB_URI not set — guild config endpoints will return 503 until it is configured.',
    );
    return null;
  }

  client = new MongoClient(uri);
  await client.connect();
  // Database name comes from the connection string's path when present;
  // fall back to a fixed name so a bare cluster URI still works.
  db = client.db(process.env.MONGODB_DB_NAME || 'alice_website');
  console.log('✅ Connected to MongoDB');
  return db;
}

export function getDb() {
  if (!db) {
    const err = new Error('Database not connected');
    err.status = 503;
    err.publicMessage = 'Guild config storage isn’t set up yet (MONGODB_URI missing).';
    throw err;
  }
  return db;
}

export async function closeMongo() {
  if (client) await client.close();
}
