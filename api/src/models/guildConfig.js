// Per-server dashboard configuration. This is intentionally decoupled from
// the bot's own runtime for now (Phase 3a): the dashboard reads/writes this
// collection, and a later pass will update the bot itself to read from it
// before falling back to its current hardcoded behavior.

import { getDb } from '../services/mongo.js';

const COLLECTION = 'guildConfigs';

// One entry per command module shown on the public Commands page. Keeping
// this list in one place means the frontend toggle list and the backend
// validation can't drift apart.
export const MODULE_KEYS = [
  'statBot',
  'achievements',
  'moderation',
  'starboard',
  'serverSetup',
  'giveaway',
  'counting',
  'economy',
  'rpgGame',
  'interactions',
  'emojiTools',
  'chatExport',
];

function defaultConfig(guildId) {
  return {
    guildId,
    prefix: '!',
    modules: Object.fromEntries(MODULE_KEYS.map((key) => [key, true])),
    moderation: {
      logChannelId: null,
      autoModEnabled: false,
      llmModEnabled: false,
      llmModSensitivity: 'medium', // 'low' | 'medium' | 'high'
    },
    welcome: {
      enabled: false,
      channelId: null,
      message: 'Welcome to {server}, {user}!',
    },
    leave: {
      enabled: false,
      channelId: null,
      message: '{user} has left {server}.',
    },
    economy: {
      enabled: true,
      levelingEnabled: true,
      currencyName: 'coins',
    },
    updatedAt: null,
    updatedBy: null,
  };
}

export async function getGuildConfig(guildId) {
  const existing = await getDb().collection(COLLECTION).findOne({ guildId });
  if (!existing) return defaultConfig(guildId);
  // Merge over defaults so a config saved before a new field existed still
  // comes back with sane values for that field, rather than `undefined`.
  const base = defaultConfig(guildId);
  return {
    ...base,
    ...existing,
    modules: { ...base.modules, ...existing.modules },
    moderation: { ...base.moderation, ...existing.moderation },
    welcome: { ...base.welcome, ...existing.welcome },
    leave: { ...base.leave, ...existing.leave },
    economy: { ...base.economy, ...existing.economy },
  };
}

const SENSITIVITIES = new Set(['low', 'medium', 'high']);

function clampString(value, max) {
  return typeof value === 'string' ? value.slice(0, max) : undefined;
}

// Whitelist + coerce incoming fields rather than trusting the request body
// wholesale — this is a public-ish API surface (any server manager can hit
// it for their own guild), so shape it defensively.
function sanitizeUpdate(input = {}) {
  const update = {};

  if (typeof input.prefix === 'string' && input.prefix.trim()) {
    update.prefix = input.prefix.trim().slice(0, 5);
  }

  if (input.modules && typeof input.modules === 'object') {
    update.modules = {};
    for (const key of MODULE_KEYS) {
      if (typeof input.modules[key] === 'boolean') update.modules[key] = input.modules[key];
    }
  }

  if (input.moderation && typeof input.moderation === 'object') {
    const m = input.moderation;
    update.moderation = {};
    if (m.logChannelId === null || typeof m.logChannelId === 'string') {
      update.moderation.logChannelId = m.logChannelId || null;
    }
    if (typeof m.autoModEnabled === 'boolean') update.moderation.autoModEnabled = m.autoModEnabled;
    if (typeof m.llmModEnabled === 'boolean') update.moderation.llmModEnabled = m.llmModEnabled;
    if (SENSITIVITIES.has(m.llmModSensitivity)) update.moderation.llmModSensitivity = m.llmModSensitivity;
  }

  for (const section of ['welcome', 'leave']) {
    const s = input[section];
    if (s && typeof s === 'object') {
      update[section] = {};
      if (typeof s.enabled === 'boolean') update[section].enabled = s.enabled;
      if (s.channelId === null || typeof s.channelId === 'string') {
        update[section].channelId = s.channelId || null;
      }
      const message = clampString(s.message, 500);
      if (message !== undefined) update[section].message = message;
    }
  }

  if (input.economy && typeof input.economy === 'object') {
    const e = input.economy;
    update.economy = {};
    if (typeof e.enabled === 'boolean') update.economy.enabled = e.enabled;
    if (typeof e.levelingEnabled === 'boolean') update.economy.levelingEnabled = e.levelingEnabled;
    const currencyName = clampString(e.currencyName, 30);
    if (currencyName) update.economy.currencyName = currencyName;
  }

  return update;
}

export async function saveGuildConfig(guildId, rawUpdate, updatedByUserId) {
  const current = await getGuildConfig(guildId);
  const update = sanitizeUpdate(rawUpdate);

  const merged = {
    ...current,
    ...update,
    modules: { ...current.modules, ...update.modules },
    moderation: { ...current.moderation, ...update.moderation },
    welcome: { ...current.welcome, ...update.welcome },
    leave: { ...current.leave, ...update.leave },
    economy: { ...current.economy, ...update.economy },
    guildId,
    updatedAt: new Date(),
    updatedBy: updatedByUserId,
  };

  await getDb()
    .collection(COLLECTION)
    .updateOne({ guildId }, { $set: merged }, { upsert: true });

  return merged;
}
