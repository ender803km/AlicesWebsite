import { verifySession } from '../services/session.js';

// Express middleware: requires a valid `Authorization: Bearer <token>` header.
// On success, attaches the decoded session (profile + guilds + isDev) to
// req.session for downstream route handlers.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    req.session = verifySession(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
