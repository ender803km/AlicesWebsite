import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Everything below reads straight from the signed session — no DB lookups
// yet. That's deliberate for this first pass: guild membership and perms
// only change on the next login (sessions last 7 days), which is a fine
// trade-off until Phase 3 adds real per-server config storage.

router.get('/me', requireAuth, (req, res) => {
  const { sub, username, avatar, isDev } = req.session;
  res.json({ id: sub, username, avatar, isDev });
});

router.get('/guilds', requireAuth, (req, res) => {
  res.json({ guilds: req.session.guilds || [] });
});

export default router;
