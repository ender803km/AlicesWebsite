import { lazy, Suspense } from 'react'

// Lazily loaded so the ~800kB three.js dependency it pulls in only ever
// loads for visitors who land on the homepage, not on every route.
const LiquidEtherBackground = lazy(() => import('../components/LiquidEtherBackground'))

const features = [
  {
    icon: '🛡',
    title: 'Moderation',
    text: 'Auto-mod filters, mod logs, and an AI layer that reads context before it warns or acts — not just keyword matching.',
    size: 'lg',
  },
  { icon: '💰', title: 'Economy', text: 'A currency and leveling system your members earn just by being active.' },
  { icon: '📈', title: 'Statistics', text: 'Per-server activity tracking, so growth is something you can see.' },
  { icon: '⭐', title: 'Starboard', text: 'The best messages in a channel get pinned automatically, no manual curation.' },
  { icon: '🎁', title: 'Giveaways & events', text: 'Run giveaways, counting games, and RPG mechanics without a second bot.' },
  {
    icon: '⚙️',
    title: 'Configurable per server',
    text: 'Turn modules on or off, set channels, and adjust behavior from a dashboard — no config file editing.',
    size: 'lg',
  },
]

export default function Home() {
  return (
    <main id="main-content">
      <header className="site-hero">
        <Suspense fallback={null}>
          <LiquidEtherBackground />
        </Suspense>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6" data-aos="fade-right">
              <span className="site-hero-eyebrow">
                <span className="dot" aria-hidden="true" />
                Online now
              </span>
              <h1 className="display-4 fw-bold mb-4">Artificial Learning &amp; Intelligent Community Engine</h1>
              <p className="lead text-body-secondary mb-4">
                Moderation, logging, statistics, and an economy system for Discord —
                configured per server from a dashboard, not a config file.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1520771362246103091&permissions=1392442207446&integration_type=0&scope=bot+applications.commands"
                  className="btn btn-primary btn-lg px-4"
                  target="_blank"
                  rel="noopener"
                >
                  Invite Bot
                </a>
                <a href="https://github.com/ender803km" className="btn btn-outline-light btn-lg px-4" target="_blank" rel="noopener">
                  GitHub
                </a>
              </div>
            </div>
            <div className="col-lg-6 text-center" data-aos="fade-left">
              <img src="/images/alice.png" className="site-hero-img" alt="A.L.I.C.E bot avatar" />
            </div>
          </div>
        </div>
      </header>

      <section className="site-features">
        <div className="container">
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div
                className={`feature-card${feature.size === 'lg' ? ' feature-card--lg' : ''}`}
                data-aos="fade-up"
                data-aos-delay={(index % 3) * 80}
                key={feature.title}
              >
                <div className="feature-card-icon" aria-hidden="true">{feature.icon}</div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
