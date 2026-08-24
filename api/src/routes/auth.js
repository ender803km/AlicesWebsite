import { Router } from 'express';
import crypto from 'node:crypto';
import {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  fetchDiscordUser,
  fetchUserGuilds,
  fetchBotGuildIds,
  userCanManage,
  avatarUrl,
  guildIconUrl,
} from '../services/discord.js';
import { signSession, isDevUser } from '../services/session.js';

const router = Router();

// In-memory `state` store, just to guard against CSRF on the callback.
// A short TTL is plenty since the whole round trip takes seconds.
const pendingStates = new Map();
const STATE_TTL_MS = 5 * 60_000;

function frontendUrl(path = '') {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${base.replace(/\/$/, '')}${path}`;
}

router.get('/discord/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.set(state, Date.now());
  for (const [key, ts] of pendingStates) {
    if (Date.now() - ts > STATE_TTL_MS) pendingStates.delete(key);
  }
  res.redirect(buildAuthorizeUrl(state));
});

router.get('/discord/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(frontendUrl(`/login?error=${encodeURIComponent(String(error))}`));
  }
  if (!code || !state || !pendingStates.has(String(state))) {
    return res.redirect(frontendUrl('/login?error=invalid_state'));
  }
  pendingStates.delete(String(state));

  try {
    const tokenResponse = await exchangeCodeForToken(String(code));
    const [discordUser, userGuilds, botGuildIds] = await Promise.all([
      fetchDiscordUser(tokenResponse.access_token),
      fetchUserGuilds(tokenResponse.access_token),
      fetchBotGuildIds(),
    ]);

    const manageableGuilds = userGuilds
      .filter((guild) => userCanManage(guild))
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guildIconUrl(guild),
        botInstalled: botGuildIds.has(guild.id),
      }));

    const session = signSession({
      sub: discordUser.id,
      username: discordUser.username,
      avatar: avatarUrl(discordUser),
      isDev: isDevUser(discordUser.id),
      guilds: manageableGuilds,
    });

    // Fragment, not a query param — it never reaches server logs or gets
    // resent on subsequent navigations.
    res.redirect(frontendUrl(`/auth/callback#token=${session}`));
  } catch (err) {
    console.error('OAuth callback failed:', err);
    res.redirect(frontendUrl('/login?error=oauth_failed'));
  }
});

export default router;
