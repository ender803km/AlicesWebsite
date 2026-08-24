import { forwardRef, lazy, Suspense, useRef } from 'react'
import { useReveal } from '../hooks/useReveal'

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

// A card whose border glows faintly under the cursor — tracked via CSS
// custom properties rather than re-rendering React on every mouse move.
const SpotlightCard = forwardRef(function SpotlightCard(
  { className = '', children, onMouseMove, ...rest },
  ref,
) {
  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
    onMouseMove?.(e)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group/spot relative overflow-hidden ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(79,147,224,0.16), transparent 70%)',
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  )
})

function FeatureCard({ feature, index }) {
  const [ref, visible] = useReveal({ threshold: 0.15 })
  const isLg = feature.size === 'lg'

  return (
    <SpotlightCard
      ref={ref}
      className={`rounded-[1.75rem] [border:1px_solid_rgba(255,255,255,0.08)] bg-white/[0.02] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:[border-color:rgba(255,255,255,0.14)] ${
        isLg ? 'sm:col-span-4' : 'sm:col-span-2'
      } ${visible ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-10 opacity-0 blur-sm'}`}
      style={{ transitionDelay: visible ? `${(index % 3) * 90}ms` : '0ms' }}
    >
      <div
        className={`relative rounded-[calc(1.75rem-0.375rem)] bg-[#0d131b] p-7 ${
          isLg ? 'flex flex-col gap-[1.25rem] sm:flex-row sm:items-start' : 'h-full'
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#4f93e0]/[0.12] text-2xl ${
            isLg ? 'h-14 w-14 text-3xl' : 'h-12 w-12'
          }`}
          aria-hidden="true"
        >
          {feature.icon}
        </div>
        <div>
          <h2 className={`font-display mt-[1rem] font-semibold tracking-tight text-[#eef1f5] sm:mt-0 ${isLg ? 'text-2xl' : 'text-lg'}`}>
            {feature.title}
          </h2>
          <p className={`mt-2 leading-relaxed text-[#97a3b3] ${isLg ? 'max-w-[52ch]' : ''}`}>{feature.text}</p>
        </div>
      </div>
    </SpotlightCard>
  )
}

function Orb({ className }) {
  return <div className={`pointer-events-none absolute rounded-full blur-[110px] ${className}`} aria-hidden="true" />
}

export default function Home() {
  const [heroRef, heroVisible] = useReveal({ threshold: 0.1 })
  const scrollRef = useRef(null)

  function scrollToFeatures() {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main id="main-content">
      <header className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
        <Suspense fallback={null}>
          <LiquidEtherBackground />
        </Suspense>

        <Orb className="-left-24 top-16 h-72 w-72 bg-[#4f93e0]/[0.18]" />
        <Orb className="-right-16 top-56 h-64 w-64 bg-[#3ecf8e]/[0.12]" />

        <div className="container relative z-10">
          <div className="row align-items-center gy-5">
            <div
              ref={heroRef}
              className={`col-lg-6 transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                heroVisible ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-10 opacity-0 blur-sm'
              }`}
            >
              <span className="site-hero-eyebrow">
                <span className="dot" aria-hidden="true" />
                Online now
              </span>
              <h1 className="font-display text-[2.75rem] font-bold leading-[1.05] tracking-tight text-[#eef1f5] sm:text-[3.4rem]">
                Artificial Learning &amp; Intelligent Community Engine
              </h1>
              <p className="mt-[1.25rem] max-w-[52ch] text-lg leading-relaxed text-[#97a3b3]">
                Moderation, logging, statistics, and an economy system for Discord —
                configured per server from a dashboard, not a config file.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-[1rem]">
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1520771362246103091&permissions=1392442207446&integration_type=0&scope=bot+applications.commands"
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-[0.75rem] rounded-full bg-[#4f93e0] py-2.5 pl-6 pr-2.5 font-semibold text-[#06101c] no-underline transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-[#74abe8] hover:shadow-[0_16px_32px_-16px_rgba(79,147,224,0.55)] active:scale-[0.98]"
                >
                  Invite Bot
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#06101c]/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </a>
                <a
                  href="https://github.com/ender803km"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full [border:1px_solid_rgba(255,255,255,0.15)] px-6 py-2.5 font-semibold text-[#eef1f5] no-underline transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:[border-color:rgba(255,255,255,0.3)] hover:bg-white/5 active:scale-[0.98]"
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <div className="mx-auto inline-block rounded-[2rem] [border:1px_solid_rgba(255,255,255,0.08)] bg-white/[0.02] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <img
                  src="/images/alice.png"
                  alt="A.L.I.C.E bot avatar"
                  className="block max-w-[380px] rounded-[calc(2rem-0.5rem)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToFeatures}
          aria-label="Scroll to features"
          className="absolute bottom-6 left-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full [border:1px_solid_rgba(255,255,255,0.1)] text-[#97a3b3] transition-all duration-300 hover:[border-color:rgba(255,255,255,0.25)] hover:text-[#eef1f5] sm:flex"
        >
          <span className="animate-bounce">↓</span>
        </button>
      </header>

      <section ref={scrollRef} className="py-24 sm:py-32">
        <div className="container">
          <div className="grid grid-cols-1 gap-[1rem] sm:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard feature={feature} index={index} key={feature.title} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
