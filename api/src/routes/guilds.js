import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireGuildAccess } from '../middleware/requireGuildAccess.js';
import { getGuildConfig, saveGuildConfig, MODULE_KEYS } from '../models/guildConfig.js';
import { fetchGuildChannels } from '../services/discord.js';

const router = Router();

router.use('/:guildId', requireAuth, requireGuildAccess);

router.get('/:guildId/config', async (req, res, next) => {
  try {
    const config = await getGuildConfig(req.params.guildId);
    res.json({ config, moduleKeys: MODULE_KEYS });
  } catch (err) {
    next(err);
  }
});

router.put('/:guildId/config', async (req, res, next) => {
  try {
    const config = await saveGuildConfig(req.params.guildId, req.body, req.session.sub);
    res.json({ config });
  } catch (err) {
    next(err);
  }
});

// Powers the channel-picker dropdowns (mod log, welcome, leave). Only
// meaningful once the bot is actually in the server.
router.get('/:guildId/channels', async (req, res, next) => {
  if (!req.guild.botInstalled) {
    return res.json({ channels: [] });
  }
  try {
    const channels = await fetchGuildChannels(req.params.guildId);
    res.json({ channels });
  } catch (err) {
    next(err);
  }
});

export default router;
