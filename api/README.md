# A.L.I.C.E — API

A small Express service handling Discord OAuth2 login and serving the data
the React dashboard needs. Session data (profile, manageable guilds, dev
flag) is computed once at login and signed into a JWT — no DB lookups on
every request. Phase 3 adds a MongoDB-backed per-server config store and a
devs-only monitoring dashboard on top of that.

**Note on Phase 3 scope:** the config endpoints below let a server's admins
save settings (module toggles, moderation, welcome/leave messages, economy)
into MongoDB, and the dashboard UI can read/edit them. The bot itself does
not yet read from this database — it still runs on whatever's hardcoded in
its own repo. Wiring the bot up to actually obey these settings is a
follow-up pass in the bot's own codebase.

## How auth works

1. Frontend sends the user to `GET /auth/discord/login`, which redirects to Discord's OAuth2 consent screen (`identify` + `guilds` scopes).
2. Discord redirects back to `GET /auth/discord/callback` with a code.
3. This service exchanges the code for an access token, then in parallel:
   - fetches the user's Discord profile,
   - fetches every guild the user belongs to (filtered down to ones they can manage — owner, or the Manage Server permission),
   - fetches every guild the *bot* is currently in (using the bot's own token).
4. It signs a 7-day JWT containing the profile, the intersected "you manage this and the bot is in it" guild list, and whether the user's ID is on the dev allowlist.
5. It redirects to `${FRONTEND_URL}/auth/callback#token=<jwt>` — a URL fragment, so the token never touches server logs or gets resent on later navigation.
6. The frontend stores that token and sends it as `Authorization: Bearer <token>` on `/api/me` and `/api/guilds`.

## Routes

| Route | Auth | What it does |
|---|---|---|
| `GET /health` | none | Liveness check for Railway |
| `GET /auth/discord/login` | none | Redirects to Discord's OAuth2 consent screen |
| `GET /auth/discord/callback` | none | Discord redirects here after consent |
| `GET /api/me` | Bearer | Current user's profile + dev flag |
| `GET /api/guilds` | Bearer | Guilds the user manages where the bot is installed |
| `GET /api/guilds/:guildId/config` | Bearer, must manage `:guildId` | That server's dashboard config (defaults if never saved) |
| `PUT /api/guilds/:guildId/config` | Bearer, must manage `:guildId` | Save (partial-merge) that server's config |
| `GET /api/guilds/:guildId/channels` | Bearer, must manage `:guildId` | Text channels in that server, for the channel-picker dropdowns |
| `GET /api/dev/overview` | Bearer, dev only | Guild count + names the bot is in, plus deploy status if Railway is configured |
| `GET /api/dev/logs?type=errors\|activity` | Bearer, dev only | Recent bot service log lines pulled from Railway (needs `RAILWAY_API_TOKEN`) |

## Environment variables

See `.env.example` for the full list and where each value comes from. The
short version:

- `DISCORD_CLIENT_ID` — public, already known (it's in the site's invite link).
- `DISCORD_CLIENT_SECRET` — from the Discord Developer Portal. **Set this directly in Railway's dashboard, not here.**
- `DISCORD_BOT_TOKEN` — in Railway, set this as a reference to the existing bot service's variable (`${{A.L.I.C.E Bot.DISCORD_TOKEN}}`) rather than copying the value, so the secret only lives in one place.
- `OAUTH_REDIRECT_URI` — must exactly match a redirect URI registered on the Discord app (Discord Developer Portal → OAuth2 → Redirects). Add both the local dev one and the production Railway URL there.
- `FRONTEND_URL` — where the React app runs; used for CORS and for where to send the user back after login.
- `JWT_SECRET` — a random signing secret, unrelated to Discord. Any long random string.
- `DEV_USER_IDS` — comma-separated Discord user IDs allowed into the devs-only dashboard.
- `MONGODB_URI` — connection string for the dashboard's own MongoDB database (guild config). Get one from a free MongoDB Atlas cluster; see the setup steps in `.env.example`. **Set this directly in Railway, not here.**
- `RAILWAY_API_TOKEN` / `RAILWAY_PROJECT_ID` / `RAILWAY_ENVIRONMENT_ID` / `RAILWAY_BOT_SERVICE_ID` — optional, powers the devs dashboard's log viewer. The three IDs are just identifiers, not secrets; only the token needs care.

## Running locally

```
npm install
cp .env.example .env   # fill in the values above
npm run dev             # http://localhost:3000
```

You'll need a redirect URI of `http://localhost:3000/auth/discord/callback`
added in the Discord Developer Portal for local testing to work, alongside
the production one.

## Deploying

This is meant to run as its own Railway service in the same project as the
bot, with this folder (`api/`) as its root directory. Nothing in this repo
wires that up automatically — it's created once via Railway, then redeploys
on every push like the other services.
