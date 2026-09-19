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

// ─── Live permission checks ──────────────────────────────────────────────────
//
// userCanManage() below reads the permissions Discord bakes into the OAuth
// guild list at login. That is fine for building a menu, but it is a snapshot:
// sessions last 7 days, so someone demoted from Manage Server an hour after
// logging in keeps that stale "yes" for the rest of the week.
//
// These check the live state instead, using the BOT's token rather than the
// user's. That matters — it means nothing here depends on storing a user's
// OAuth token anywhere, which a stateless JWT held in the browser is a bad
// place for. The bot can already see the guild's roles and its members, which
// is everything the check needs.

// MANAGE_GUILD is already declared at the top of this file, for the OAuth
// permission bitfield userCanManage() reads.
const ADMINISTRATOR = 0x8n;

// Roles and ownership change rarely; membership changes more often. Both are
// cached, mostly so a page that fires several requests at once costs one
// round trip rather than several, and so a denied client retrying in a loop
// cannot turn into a rate limit.
const guildCache = new Map(); // guildId -> { at, guild }
const memberCache = new Map(); // `${guildId}:${userId}` -> { at, member }
const GUILD_TTL_MS = 5 * 60_000;
const MEMBER_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 1_000;

function cacheGet(cache, key, ttl) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  return undefined;
}

function cacheSet(cache, key, value) {
  // Bounded rather than clever: at this scale an occasional full clear costs
  // one extra round trip and cannot leak.
  if (cache.size >= MAX_CACHE_ENTRIES) cache.clear();
  cache.set(key, { at: Date.now(), value });
}

async function botGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bot ${requiredEnv('DISCORD_BOT_TOKEN')}` },
  });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Discord request failed (${res.status}): ${path}`);
  return res.json();
}

// Null when the bot is not in the guild.
async function fetchGuild(guildId) {
  const cached = cacheGet(guildCache, guildId, GUILD_TTL_MS);
  if (cached !== undefined) return cached;

  const guild = await botGet(`/guilds/${guildId}`);
  cacheSet(guildCache, guildId, guild);
  return guild;
}

// Null when the user is not a member of the guild.
async function fetchGuildMember(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const cached = cacheGet(memberCache, key, MEMBER_TTL_MS);
  if (cached !== undefined) return cached;

  const member = await botGet(`/guilds/${guildId}/members/${userId}`);
  cacheSet(memberCache, key, member);
  return member;
}

// Does this user, right now, have the authority to configure this server?
//
// Returns a reason rather than a bare boolean so the caller can tell a user
// who was demoted apart from one who left, and from a server the bot is no
// longer in — three very different messages.
export async function checkGuildAuthority(guildId, userId) {
  const guild = await fetchGuild(guildId);
  if (!guild) return { ok: false, reason: 'bot_not_in_guild' };

  if (guild.owner_id === userId) return { ok: true, reason: 'owner' };

  const member = await fetchGuildMember(guildId, userId);
  if (!member) return { ok: false, reason: 'not_a_member' };

  const rolePermissions = new Map(
    (guild.roles || []).map((role) => [role.id, role.permissions]),
  );

  for (const roleId of member.roles || []) {
    const raw = rolePermissions.get(roleId);
    if (!raw) continue;
    let bits;
    try {
      bits = BigInt(raw);
    } catch {
      continue;
    }
    // Administrator implies everything, which is how Discord itself treats it.
    if ((bits & ADMINISTRATOR) === ADMINISTRATOR) return { ok: true, reason: 'administrator' };
    if ((bits & MANAGE_GUILD) === MANAGE_GUILD) return { ok: true, reason: 'manage_guild' };
  }

  return { ok: false, reason: 'insufficient_permissions' };
}

// Called after a write that changes who can do what, so the next request sees
// the new state instead of waiting out the TTL.
export function invalidateGuildAuthority(guildId) {
  guildCache.delete(guildId);
  for (const key of memberCache.keys()) {
    if (key.startsWith(`${guildId}:`)) memberCache.delete(key);
  }
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
