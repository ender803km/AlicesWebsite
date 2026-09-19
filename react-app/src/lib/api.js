// Thin client for the alice-api service. Sessions are a bearer JWT kept in
// localStorage, the simplest thing that works across the frontend/API
// domain split, with no cross-site cookie config to fight with.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TOKEN_KEY = 'alice_session_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function loginUrl() {
  return `${API_BASE_URL}/auth/discord/login`;
}

async function authedRequest(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Not logged in');

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    // Field-level rejections from a config save, so the form can mark the
    // control that was refused instead of showing one generic message.
    if (body?.details) err.details = body.details;
    throw err;
  }
  return res.json();
}

function authedGet(path) {
  return authedRequest(path);
}

function authedPatch(path, data) {
  return authedRequest(path, { method: 'PATCH', body: JSON.stringify(data) });
}

function authedPost(path, data) {
  return authedRequest(path, { method: 'POST', body: JSON.stringify(data) });
}

export function fetchMe() {
  return authedGet('/api/me');
}

export function fetchGuilds() {
  return authedGet('/api/guilds');
}

// --- per-server config ---
//
// The shape of what comes back is decided by the bot, not by this file: the
// API composes its response from the feature manifest the bot publishes at
// boot. Nothing here should ever hardcode a feature or a setting name.

export function fetchGuildConfig(guildId) {
  return authedGet(`/api/guilds/${guildId}/config`);
}

// Partial save — only the fields the user actually changed.
// `fields` is flat: { starboardChannelId: '123', starThreshold: 5 }.
export function saveGuildSettings(guildId, fields) {
  return authedPatch(`/api/guilds/${guildId}/config`, { fields });
}

// Turning a module on or off is its own request rather than part of a save:
// it can be refused (an unmet requirement) or have consequences beyond the
// switch that was clicked (disabling cascades to dependent modules), and the
// response says which.
export function setGuildFeature(guildId, key, enabled) {
  return authedPost(`/api/guilds/${guildId}/features/${encodeURIComponent(key)}`, { enabled });
}

export function fetchGuildChannels(guildId) {
  return authedGet(`/api/guilds/${guildId}/channels`);
}

export function fetchGuildRoles(guildId) {
  return authedGet(`/api/guilds/${guildId}/roles`);
}

// --- Phase 3: devs dashboard ---

export function fetchDevOverview() {
  return authedGet('/api/dev/overview');
}

export function fetchDevLogs(type) {
  return authedGet(`/api/dev/logs?type=${encodeURIComponent(type)}`);
}

// --- public, unauthenticated ---

// Used by the homepage proof band. Never throws for the caller's benefit:
// a page that cannot reach the API still renders its product facts.
export async function fetchPublicStats() {
  const res = await fetch(`${API_BASE_URL}/api/public/stats`)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}
