import { Router } from 'express';
import { fetchBotGuildList } from '../services/discord.js';

const router = Router();

// Public, unauthenticated, and deliberately narrow: a count and nothing
// else. The homepage reads this to show how many servers the bot is in.
// Guild names and ids stay behind the authenticated dev routes.
//
// No cache layer here on purpose. fetchBotGuilds() already caches, and
// this route does not pass bypassCache, so repeated homepage loads share
// that one cached result rather than each hitting Discord.
router.get('/stats', async (req, res) => {
  try {
    const guilds = await fetchBotGuildList();
    res.json({ guildCount: guilds.length });
  } catch (err) {
    // A missing bot token or a Discord hiccup must not surface as an
    // error on the marketing page. The homepage treats a null count as
    // "no count available" and falls back to the product facts.
    console.warn('public stats unavailable:', err.message);
    res.json({ guildCount: null });
  }
});

export default router;
