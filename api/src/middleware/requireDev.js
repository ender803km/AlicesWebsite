// Must run after requireAuth. Gates the devs-only monitoring dashboard to
// whoever's Discord ID is in DEV_USER_IDS (see services/session.js).
export function requireDev(req, res, next) {
  if (!req.session.isDev) {
    return res.status(403).json({ error: 'Dev access required' });
  }
  return next();
}
