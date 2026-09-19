import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getManifest } from '../models/featureManifest.js';

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

// What the bot says it can do, as published at its last boot. The per-guild
// config endpoint already folds this into its response, so the dashboard
// doesn't need to call this — it's here for checking what the bot is
// currently advertising without picking a server first.
router.get('/manifest', requireAuth, async (req, res, next) => {
  try {
    res.json(await getManifest());
  } catch (err) {
    next(err);
  }
});

export default router;
