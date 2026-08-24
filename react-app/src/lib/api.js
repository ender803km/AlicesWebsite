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

async function authedGet(path) {
  const token = getToken();
  if (!token) throw new Error('Not logged in');

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearToken();
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export function fetchMe() {
  return authedGet('/api/me');
}

export function fetchGuilds() {
  return authedGet('/api/guilds');
}
