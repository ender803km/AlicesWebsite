import { lazy, Suspense } from 'react'

// Lazily loaded so the ~800kB three.js dependency it pulls in only ever
// loads for visitors who land on the homepage, not on every route.
const LiquidEtherBackground = lazy(() => import('../components/LiquidEtherBackground'))

const features = [
  { icon: '🛡', title: 'Moderation', text: 'Advanced filtering and server protection.' },
  { icon: '💰', title: 'Economy', text: 'Reward your community.' },
  { icon: '📈', title: 'Statistics', text: 'Track activity and growth.' },
  { icon: '⭐', title: 'Starboard', text: 'Highlight memorable messages.' },
  { icon: '🤖', title: 'AI Ready', text: 'Machine-learning moderation coming soon.' },
  { icon: '⚡', title: 'Fast', text: 'Built with Discord.js for speed.' },
]

export default function Home() {
  return (
    <>
      <header className="site-hero">
        <Suspense fallback={null}>
          <LiquidEtherBackground />
        </Suspense>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6" data-aos="fade-right">
              <h1 className="display-4 fw-bold mb-4">Artificial Learning &amp; Intelligent Community Engine</h1>
              <p className="lead text-body-secondary mb-4">
                Powerful moderation, logging, statistics, economy, and AI-assisted server management.
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
          <div className="row g-4">
            {features.map((feature, index) => (
              <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={(index % 3) * 100} key={feature.title}>
                <div className="card site-card h-100">
                  <div className="card-body">
                    <h2 className="h4 card-title">{feature.icon} {feature.title}</h2>
                    <p className="card-text">{feature.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
