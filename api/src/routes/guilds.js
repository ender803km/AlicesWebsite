import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireGuildAccess } from '../middleware/requireGuildAccess.js';
import { getGuildView, applySettings, setFeatureEnabled } from '../models/guildConfig.js';
import { fetchGuildChannels, fetchGuildRoles } from '../services/discord.js';

const router = Router();

router.use('/:guildId', requireAuth, requireGuildAccess);

// The full dashboard view for one server: every feature the bot registered,
// whether it's on here, and the current value of each of its settings.
router.get('/:guildId/config', async (req, res, next) => {
  try {
    res.json(await getGuildView(req.params.guildId));
  } catch (err) {
    next(err);
  }
});

// Partial update. Body: { fields: { starboardChannelId: "123", starThreshold: 5 } }
// Only fields the bot declared in its manifest are accepted; anything else
// comes back as a 400 naming the offending field.
router.patch('/:guildId/config', async (req, res, next) => {
  try {
    res.json(await applySettings(req.params.guildId, req.body?.fields, req.session.sub));
  } catch (err) {
    next(err);
  }
});

// Body: { enabled: true | false }. Enabling is blocked when a hard
// requirement is off (409); disabling cascades to everything that hard-
// requires this one, and the response names what else went off so the UI can
// say so rather than silently changing three toggles.
router.post('/:guildId/features/:key', async (req, res, next) => {
  if (typeof req.body?.enabled !== 'boolean') {
    return res.status(400).json({ error: 'Expected { enabled: true | false }' });
  }

  try {
    const { feature, cascaded } = await setFeatureEnabled(
      req.params.guildId,
      req.params.key,
      req.body.enabled,
      req.session.sub,
    );
    res.json({
      feature: feature.key,
      enabled: req.body.enabled,
      cascaded: cascaded.map((f) => ({ key: f.key, label: f.label })),
      config: await getGuildView(req.params.guildId),
    });
  } catch (err) {
    next(err);
  }
});

// Both of these populate the pickers behind `channel`, `multiChannel` and
// `role` settings, and both need the bot to actually be in the server.
router.get('/:guildId/channels', async (req, res, next) => {
  if (!req.guild.botInstalled) return res.json({ channels: [] });
  try {
    res.json({ channels: await fetchGuildChannels(req.params.guildId) });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/roles', async (req, res, next) => {
  if (!req.guild.botInstalled) return res.json({ roles: [] });
  try {
    res.json({ roles: await fetchGuildRoles(req.params.guildId) });
  } catch (err) {
    next(err);
  }
});

export default router;
