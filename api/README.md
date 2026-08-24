# A.L.I.C.E — API

Phase 2 of the site rebuild: a small Express service handling Discord OAuth2
login and serving the data the React dashboard needs. No database yet —
everything a session needs (profile, manageable guilds, dev flag) is computed
once at login and signed into a JWT. Phase 3 adds MongoDB-backed per-server
config on top of this.

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

## Environment variables

See `.env.example` for the full list and where each value comes from. The
short version:

- `DISCORD_CLIENT_ID` — public, already known (it's in the site's invite link).
- `DISCORD_CLIENT_SECRET` — from the Discord Developer Portal. **Set this directly in Railway's dashboard, not here.**
- `DISCORD_BOT_TOKEN` — in Railway, set this as a reference to the existing bot service's variable (`${{A.L.I.C.E Bot.DISCORD_TOKEN}}`) rather than copying the value, so the secret only lives in one place.
- `OAUTH_REDIRECT_URI` — must exactly match a redirect URI registered on the Discord app (Discord Developer Portal → OAuth2 → Redirects). Add both the local dev one and the production Railway URL there.
- `FRONTEND_URL` — where the React app runs; used for CORS and for where to send the user back after login.
- `JWT_SECRET` — a random signing secret, unrelated to Discord. Any long random string.
- `DEV_USER_IDS` — comma-separated Discord user IDs allowed into the Phase 3 devs-only dashboard. Leave empty until that's built.

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
