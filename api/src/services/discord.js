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
// Single cache shared by both accessors below so a dashboard page load
// (which wants full guild objects) and a login callback (which only wants
// the id set) don't double the Discord API calls.
let botGuildsCache = { at: 0, guilds: [] };
const BOT_GUILDS_TTL_MS = 60_000;

async function fetchBotGuilds({ bypassCache = false } = {}) {
  const fresh = Date.now() - botGuildsCache.at < BOT_GUILDS_TTL_MS;
  if (fresh && !bypassCache) return botGuildsCache.guilds;

  const res = await fetch(`${API_BASE}/users/@me/guilds?limit=200`, {
    headers: { Authorization: `Bot ${requiredEnv('DISCORD_BOT_TOKEN')}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch bot's guilds (${res.status})`);
  const guilds = await res.json(); // [{ id, name, icon, ... }, ...]
  botGuildsCache = { at: Date.now(), guilds };
  return guilds;
}

export async function fetchBotGuildIds(opts) {
  const guilds = await fetchBotGuilds(opts);
  return new Set(guilds.map((g) => g.id));
}

// Full guild objects (id, name, icon) the bot currently belongs to — used
// by the devs dashboard to show "which servers is A.L.I.C.E actually in".
export async function fetchBotGuildList(opts) {
  const guilds = await fetchBotGuilds(opts);
  return guilds.map((g) => ({ id: g.id, name: g.name, icon: guildIconUrl(g) }));
}

// Text channels for a given guild, for populating channel-picker dropdowns
// (mod log channel, welcome/leave channel) in the config screen. Requires
// the bot to actually be in the guild — callers should check that first.
export async function fetchGuildChannels(guildId) {
  const res = await fetch(`${API_BASE}/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${requiredEnv('DISCORD_BOT_TOKEN')}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch guild channels (${res.status})`);
  const channels = await res.json();
  const GUILD_TEXT = 0;
  const GUILD_ANNOUNCEMENT = 5;
  return channels
    .filter((c) => c.type === GUILD_TEXT || c.type === GUILD_ANNOUNCEMENT)
    .map((c) => ({ id: c.id, name: c.name, position: c.position }))
    .sort((a, b) => a.position - b.position);
}

// Roles for a given guild, for the pickers behind `role` settings (the
// giveaway host role, the Weekly Rotation winner role, the jailed role).
// @everyone is filtered out — it is a role in the API's eyes but never a
// meaningful answer to "which role should this be", and managed roles are
// dropped because Discord won't let the bot assign them anyway.
export async function fetchGuildRoles(guildId) {
  const res = await fetch(`${API_BASE}/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${requiredEnv('DISCORD_BOT_TOKEN')}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch guild roles (${res.status})`);
  const roles = await res.json();
  return roles
    .filter((r) => r.id !== guildId && !r.managed)
    .map((r) => ({ id: r.id, name: r.name, color: r.color, position: r.position }))
    .sort((a, b) => b.position - a.position);
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
