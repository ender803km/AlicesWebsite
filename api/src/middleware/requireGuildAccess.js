// Must run after requireAuth. Decides whether the logged-in user may read or
// change this server's configuration.
//
// This used to be a lookup against the guild list baked into the session at
// login. That was honest enough when a save went nowhere, but these routes now
// write the bot's live configuration, and a session lasts 7 days — so someone
// demoted from Manage Server on Monday could still be turning modules off on
// Friday. The session now proves only who you are; what you may do is asked of
// Discord at the moment you ask to do it.
//
// The check runs on reads as well as writes, deliberately: a server's
// moderation channels and thresholds are not something a former admin should
// keep being able to read either.

import { checkGuildAuthority } from '../services/discord.js';

// One message per reason. A former admin, someone who left, and a server the
// bot was removed from are three different situations, and telling them apart
// saves a confused message in the support server.
const DENIALS = {
  bot_not_in_guild: "A.L.I.C.E isn't in that server any more.",
  not_a_member: "You're not a member of that server any more.",
  insufficient_permissions:
    'You no longer have Manage Server permission in that server. Ask an admin if you think that is wrong.',
};

export async function requireGuildAccess(req, res, next) {
  const { guildId } = req.params;

  if (!/^\d{17,20}$/.test(guildId || '')) {
    return res.status(400).json({ error: 'That is not a valid server ID.' });
  }

  let result;
  try {
    result = await checkGuildAuthority(guildId, req.session.sub);
  } catch (err) {
    // Fails CLOSED. A permission check that waves people through when it
    // cannot reach Discord is not a permission check. Successful results are
    // cached for a minute, so a brief Discord blip does not lock out someone
    // already working.
    console.error(`Permission check failed for guild ${guildId}:`, err.message);
    return res.status(503).json({
      error: "Couldn't confirm your permissions with Discord just now. Try again in a moment.",
    });
  }

  if (!result.ok) {
    return res.status(403).json({ error: DENIALS[result.reason] || 'You do not manage this server.' });
  }

  // The session copy still carries the guild's name and icon, which are only
  // ever used for display. Authorization above no longer depends on it, and
  // the route works without it — botInstalled is implied, since the check
  // above could not have passed if the bot were gone.
  const known = (req.session.guilds || []).find((g) => g.id === guildId);
  // Spread first, then overwrite: the session copy can carry a stale
  // botInstalled: false, and letting that win would make the channel and role
  // pickers come back empty on a server the bot is demonstrably in.
  req.guild = { ...(known || {}), id: guildId, botInstalled: true };
  req.guildAuthority = result.reason;

  return next();
}
