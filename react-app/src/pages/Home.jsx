import { useRef } from 'react'
import { useReveal } from '../hooks/useReveal'
import NeuralCanvas from '../components/NeuralCanvas'
import '../styles/homepage.css'

const features = [
  {
    area: 'home-b-mod',
    title: 'Moderation',
    text: 'Auto-mod filters, mod logs, and an AI layer that reads context before it warns or acts — not just keyword matching.',
    tag: 'Always on',
    big: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />
      </svg>
    ),
  },
  {
    area: 'home-b-stat',
    title: 'Statistics',
    text: 'Per-server activity tracking, so growth is something you can see.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V10M11 19V5M18 19v-7" />
      </svg>
    ),
  },
  {
    area: 'home-b-give',
    title: 'Giveaways & events',
    text: 'Run giveaways, counting games, and RPG mechanics without a second bot.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="13" rx="1" />
        <path d="M3 12h18M12 8v13" />
        <path d="M12 8c-1.5-3-3.5-4-5-3s-1 3 1 3M12 8c1.5-3 3.5-4 5-3s1 3-1 3" />
      </svg>
    ),
  },
  {
    area: 'home-b-eco',
    title: 'Economy',
    text: 'A currency and leveling system your members earn just by being active.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5v9M9 9.5c0-1 1-1.8 3-1.8s3 .8 3 1.8-1 1.4-3 1.8-3 .9-3 1.9 1 1.8 3 1.8 3-.8 3-1.8" />
      </svg>
    ),
  },
  {
    area: 'home-b-star',
    title: 'Starboard',
    text: 'The best messages in a channel get pinned automatically, no manual curation.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M12 3.5l2.4 5 5.5.6-4 3.8 1 5.4L12 15.8l-4.9 2.5 1-5.4-4-3.8 5.5-.6z" />
      </svg>
    ),
  },
  {
    area: 'home-b-conf',
    title: 'Configurable per server',
    text: 'Turn modules on or off, set channels, and adjust behavior from a dashboard — no config file editing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <circle cx="9" cy="6" r="2" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <circle cx="15" cy="12" r="2" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="11" cy="18" r="2" />
      </svg>
    ),
  },
]

// Nudges a button toward the cursor on hover — cheap, transform-only, and
// skipped entirely for touch input and reduced-motion preferences.
function useMagnetic() {
  const ref = useRef(null)
  const rafRef = useRef(null)

  function handleMove(e) {
    const btn = ref.current
    if (!btn) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`
    })
  }

  function handleLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (ref.current) ref.current.style.transform = ''
  }

  return [ref, handleMove, handleLeave]
}

function FeatureCard({ feature, index }) {
  const [ref, visible] = useReveal({ threshold: 0.15 })
  return (
    <div
      ref={ref}
      className={`home-card-shell ${feature.area} home-reveal home-reveal-blur ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: visible ? `${(index % 6) * 70}ms` : '0ms' }}
    >
      <div className="home-card-core">
        <div>
          <div className="home-card-icon" aria-hidden="true">{feature.icon}</div>
          <h3>{feature.title}</h3>
          <p>{feature.text}</p>
        </div>
        {feature.tag && <span className="home-card-tag">{feature.tag}</span>}
      </div>
    </div>
  )
}

function FeaturesHead() {
  const [ref, visible] = useReveal({ threshold: 0.15 })
  return (
    <div ref={ref} className={`home-section-head home-reveal home-reveal-blur ${visible ? 'is-visible' : ''}`}>
      <div className="home-section-head-rule-row">
        <span className="home-section-head-rule" aria-hidden="true" />
        <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> What it does</div>
        <span className="home-section-head-rule" aria-hidden="true" />
      </div>
      <h2>Six systems, one bot.</h2>
      <p>
        Everything below runs on the same MongoDB-backed core — no separate bots to invite, no
        separate dashboards to juggle.
      </p>
    </div>
  )
}

export default function Home() {
  const [heroRef, heroVisible] = useReveal({ threshold: 0.1 })
  const [portraitRef, portraitVisible] = useReveal({ threshold: 0.1 })
  const [inviteRef, onInviteMove, onInviteLeave] = useMagnetic()
  const [githubRef, onGithubMove, onGithubLeave] = useMagnetic()

  return (
    <main id="main-content" className="home-page">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-spotlight" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />

      <header className="home-hero">
        <NeuralCanvas className="home-hero-canvas" />
        <div className="home-wrap">
          <div ref={heroRef}>
            <div className={`home-eyebrow home-reveal ${heroVisible ? 'is-visible' : ''}`}>
              <span className="home-dot" aria-hidden="true" /> Moderation &middot; Economy &middot; AI-assisted
            </div>
            <h1 className={`home-reveal home-reveal-blur ${heroVisible ? 'is-visible' : ''}`} style={{ transitionDelay: heroVisible ? '60ms' : '0ms' }}>
              Artificial Learning &amp; Intelligent Community Engine
            </h1>
            <p
              className={`home-lede home-reveal ${heroVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: heroVisible ? '120ms' : '0ms' }}
            >
              Moderation, logging, statistics, and an economy system for Discord — running
              quietly in the background, configured per server from a dashboard, not a config
              file.
            </p>
            <div
              className={`home-cta-row home-reveal ${heroVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: heroVisible ? '180ms' : '0ms' }}
            >
              <a
                ref={inviteRef}
                href="https://discord.com/oauth2/authorize?client_id=1520771362246103091&permissions=1392442207446&integration_type=0&scope=bot+applications.commands"
                target="_blank"
                rel="noopener"
                className="home-btn home-btn-primary"
                onMouseMove={onInviteMove}
                onMouseLeave={onInviteLeave}
              >
                Invite Bot
                <span className="home-icon-chip" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a
                ref={githubRef}
                href="https://github.com/ender803km"
                target="_blank"
                rel="noopener"
                className="home-btn home-btn-outline"
                onMouseMove={onGithubMove}
                onMouseLeave={onGithubLeave}
              >
                GitHub
              </a>
            </div>
          </div>

          <div ref={portraitRef} className={`home-reveal home-reveal-blur ${portraitVisible ? 'is-visible' : ''}`}>
            <div className="home-portrait-shell">
              <div className="home-portrait-glow" aria-hidden="true" />
              <div className="home-portrait-core">
                <img src="/images/alice.png" alt="A.L.I.C.E bot avatar" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="home-features">
        <div className="home-wrap">
          <FeaturesHead />
          <div className="home-bento">
            {features.map((feature, index) => (
              <FeatureCard feature={feature} index={index} key={feature.title} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
