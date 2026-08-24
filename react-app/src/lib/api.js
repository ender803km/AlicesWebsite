// Thin client for the alice-api service. Sessions are a bearer JWT kept in
// localStorage — simplest thing that works across the frontend/API domain
// split, no cross-site cookie config to fight with.

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
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function authedGet(path) {
  return authedRequest(path);
}

function authedPut(path, data) {
  return authedRequest(path, { method: 'PUT', body: JSON.stringify(data) });
}

export function fetchMe() {
  return authedGet('/api/me');
}

export function fetchGuilds() {
  return authedGet('/api/guilds');
}

// --- Phase 3: per-server config ---

export function fetchGuildConfig(guildId) {
  return authedGet(`/api/guilds/${guildId}/config`);
}

export function saveGuildConfig(guildId, config) {
  return authedPut(`/api/guilds/${guildId}/config`, config);
}

export function fetchGuildChannels(guildId) {
  return authedGet(`/api/guilds/${guildId}/channels`);
}

// --- Phase 3: devs dashboard ---

export function fetchDevOverview() {
  return authedGet('/api/dev/overview');
}

export function fetchDevLogs(type) {
  return authedGet(`/api/dev/logs?type=${encodeURIComponent(type)}`);
}
