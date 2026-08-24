import jwt from 'jsonwebtoken';

const TOKEN_TTL = '7d';

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('Missing required env var: JWT_SECRET');
  return value;
}

export function signSession(payload) {
  return jwt.sign(payload, secret(), { expiresIn: TOKEN_TTL });
}

export function verifySession(token) {
  return jwt.verify(token, secret());
}

// Comma-separated list of Discord user IDs allowed into the devs-only
// monitoring dashboard (Phase 3). Empty by default — nobody has dev access
// until this is set in Railway.
export function isDevUser(discordUserId) {
  const list = (process.env.DEV_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return list.includes(discordUserId);
}
