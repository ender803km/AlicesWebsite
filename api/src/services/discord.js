// Thin wrapper around the bits of Discord's HTTP API this service needs.
// No SDK dependency — it's a handful of calls, plain fetch is clearer.

const API_BASE = 'https://discord.com/api/v10';
const MANAGE_GUILD = 0x20n;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function buildAuthorizeUrl(state) {
  const clientId = requiredEnv('DISCORD_CLIENT_ID');
  const redirectUri = requiredEnv('OAUTH_REDIRECT_URI');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds',
    prompt: 'consent',
  });
  if (state) params.set('state', state);
  return `${API_BASE}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: requiredEnv('DISCORD_CLIENT_ID'),
    client_secret: requiredEnv('DISCORD_CLIENT_SECRET'),
    grant_type: 'authorization_code',
    code,
    redirect_uri: requiredEnv('OAUTH_REDIRECT_URI'),
  });

  const res = await fetch(`${API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Discord token exchange failed (${res.status}): ${text}`);
  }
  return res.json(); // { access_token, token_type, expires_in, refresh_token, scope }
}

export async function fetchDiscordUser(accessToken) {
  const res = await fetch(`${API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch Discord user (${res.status})`);
  return res.json(); // { id, username, avatar, ... }
}

export async function fetchUserGuilds(accessToken) {
  const res = await fetch(`${API_BASE}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user's guilds (${res.status})`);
  return res.json(); // [{ id, name, icon, owner, permissions, features }, ...]
}

// Guilds the bot itself is a member of. Uses the bot token, not the user's.
// NOTE: only fetches the first page (up to 200 guilds) — fine for now, add
// `after` cursor pagination here if the bot ever grows past that.
let botGuildsCache = { at: 0, guilds: [] };
const BOT_GUILDS_TTL_MS = 60_000;

export async function fetchBotGuildIds({ bypassCache = false } = {}) {
  const fresh = Date.now() - botGuildsCache.at < BOT_GUILDS_TTL_MS;
  if (fresh && !bypassCache) return botGuildsCache.guilds;

  const res = await fetch(`${API_BASE}/users/@me/guilds?limit=200`, {
    headers: { Authorization: `Bot ${requiredEnv('DISCORD_BOT_TOKEN')}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch bot's guilds (${res.status})`);
  const guilds = await res.json();
  const ids = new Set(guilds.map((g) => g.id));
  botGuildsCache = { at: Date.now(), guilds: ids };
  return ids;
}

export function userCanManage(guild) {
  if (guild.owner) return true;
  try {
    return (BigInt(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

export function avatarUrl(user) {
  if (!user.avatar) {
    // Default avatar, based on the modern (id >> 22) % 6 formula.
    const index = Number((BigInt(user.id) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;
}

export function guildIconUrl(guild) {
  if (!guild.icon) return null;
  const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}`;
}
