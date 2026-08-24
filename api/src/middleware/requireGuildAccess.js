// Must run after requireAuth. Confirms the logged-in user actually manages
// the :guildId in the route — the session's guild list was computed at
// login time from the user's real Discord permissions (MANAGE_GUILD or
// ownership), so this is just a lookup, not a fresh permission check.
// Sessions last 7 days, so a permission revoked mid-session stays valid
// here until the next login — the same trade-off already made for /me and
// /guilds.
export function requireGuildAccess(req, res, next) {
  const { guildId } = req.params;
  const guild = (req.session.guilds || []).find((g) => g.id === guildId);

  if (!guild) {
    return res.status(403).json({ error: 'You do not manage this server' });
  }

  req.guild = guild;
  return next();
}
