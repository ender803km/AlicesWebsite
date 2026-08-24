import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDev } from '../middleware/requireDev.js';
import { fetchBotGuildList } from '../services/discord.js';
import { getLatestDeployment, getDeploymentLogs } from '../services/railway.js';

const router = Router();

router.use(requireAuth, requireDev);

function railwayConfigured() {
  return Boolean(
    process.env.RAILWAY_API_TOKEN &&
      process.env.RAILWAY_PROJECT_ID &&
      process.env.RAILWAY_BOT_SERVICE_ID &&
      process.env.RAILWAY_ENVIRONMENT_ID,
  );
}

// Guild count/names (works with just the bot token — no Railway needed),
// plus deploy status as a rough health signal when Railway is configured.
router.get('/overview', async (req, res, next) => {
  try {
    const guilds = await fetchBotGuildList({ bypassCache: true });

    let deployment = null;
    let deploymentError = null;
    if (railwayConfigured()) {
      try {
        deployment = await getLatestDeployment(
          process.env.RAILWAY_PROJECT_ID,
          process.env.RAILWAY_BOT_SERVICE_ID,
          process.env.RAILWAY_ENVIRONMENT_ID,
        );
      } catch (err) {
        deploymentError = err.message;
      }
    }

    res.json({
      guildCount: guilds.length,
      guilds,
      bot: {
        // Reaching Discord's API with the bot token at all means the token
        // is valid and the bot process (or at least its REST access) is up.
        tokenValid: true,
        checkedAt: new Date().toISOString(),
      },
      deployment,
      railwayConfigured: railwayConfigured(),
      deploymentError,
    });
  } catch (err) {
    next(err);
  }
});

const LOG_LIMIT = 200;
// Heuristic for "command/moderation activity" lines without needing the
// bot's own code changed yet — matches the emoji markers already visible
// in its console output (see llmMod / voice-session / cleanup logs).
const ACTIVITY_PATTERN = /🤖|🛡|⚠️|\bwarn\b|\bban\b|\bkick\b|\bmute\b/i;

router.get('/logs', async (req, res, next) => {
  if (!railwayConfigured()) {
    return res.status(503).json({
      error:
        'Railway log access isn’t configured yet. Set RAILWAY_API_TOKEN (a project token) to enable this.',
    });
  }

  const type = req.query.type === 'activity' ? 'activity' : 'errors';

  try {
    const deployment = await getLatestDeployment(
      process.env.RAILWAY_PROJECT_ID,
      process.env.RAILWAY_BOT_SERVICE_ID,
      process.env.RAILWAY_ENVIRONMENT_ID,
    );
    if (!deployment) return res.json({ logs: [] });

    const logs = await getDeploymentLogs(deployment.id, { limit: LOG_LIMIT });
    const filtered =
      type === 'errors'
        ? logs.filter((l) => l.severity === 'error')
        : logs.filter((l) => ACTIVITY_PATTERN.test(l.message));

    res.json({ logs: filtered.slice(-100) });
  } catch (err) {
    next(err);
  }
});

export default router;
