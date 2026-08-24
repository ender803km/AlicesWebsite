# A.L.I.C.E — Website (React)

Phase 1 of the site rebuild: the existing static site (`index.html`, `alice-bot-site/*.html`)
ported 1:1 into a React + Vite app, with the same content, design, and dark
Bootstrap theme. No auth or dashboard yet — that's Phase 2/3, tracked separately.

## Stack

- **Vite + React** — build tooling and UI.
- **react-router-dom** — client-side routes for Home / Commands / About / Privacy / Terms / Contact / 404.
- **Bootstrap 5** — same dark theme and component classes (cards, buttons, navbar) as the original site, now installed via npm instead of a CDN `<link>`.
- **AOS** (Animate On Scroll) — same fade/zoom scroll animations as before, re-triggered on route change.
- **three.js** — powers the WebGL "liquid ether" background behind the homepage hero (`src/lib/liquid-ether.js`, ported from the original vanilla-JS module). Lazy-loaded so it only downloads for visitors who land on the homepage.

## Structure

```
src/
  App.jsx                  route table + AOS lifecycle
  main.jsx                 app entry, global CSS/JS imports
  index.css                ported styles from the original css/style.css
  components/
    Navbar.jsx, Footer.jsx
    LiquidEtherBackground.jsx   React wrapper around the three.js effect
    CommandsUI.jsx              small building blocks used by the Commands page
  pages/
    Home.jsx, About.jsx, Commands.jsx, Contact.jsx, Privacy.jsx, Terms.jsx, NotFound.jsx
  lib/
    liquid-ether.js         framework-agnostic WebGL effect (unchanged logic, bundled `three` import)
public/images/              LOGO.png, alice.png, alice_banner.png
```

## Running locally

```
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## What's next (Phase 2 / 3)

This app has no backend yet. The plan (see project memory for the full writeup):

1. A new, separate Railway service for the API (Discord OAuth2, sessions, guild config, metrics).
2. Discord login + a "your servers" view for regular users.
3. Per-server config screens + a devs-only monitoring dashboard, gated by a Discord user ID allowlist.

## Deploying

Not yet wired to Railway — this is still local-only. Once ready, this becomes
its own Railway service serving the `dist/` build (or a Node static server),
alongside the new API service and the existing bot service.
