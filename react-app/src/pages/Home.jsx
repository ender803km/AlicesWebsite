import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowsClockwise,
  Cards,
  Coins,
  GameController,
  PaperPlaneTilt,
  ShieldCheck,
  SlidersHorizontal,
  Sword,
  UsersThree,
  Wrench,
} from '@phosphor-icons/react'

import { useReveal } from '../hooks/useReveal'
import NeuralCanvas from '../components/NeuralCanvas'
import { CATEGORIES, COMMAND_COUNT } from '../data/commands'
import { INVITE_URL, INVITE_LABEL, SUPPORT_SERVER_URL } from '../lib/links'
import { fetchPublicStats } from '../lib/api'
import '../styles/system.css'
import '../styles/home.css'

const MODULE_COUNT = CATEGORIES.reduce((total, c) => total + c.modules.length, 0)

/* A server count only helps once it is large enough to read as evidence.
   Below this it is shown to nobody, and the band falls back to the
   product facts, which are true from day one. The count reveals itself
   automatically as the bot grows, with no code change needed. */
const SERVER_COUNT_REVEAL_AT = 25

/* Real quotes from real server owners go here. Empty on purpose: the
   section does not render at all until there is something honest to put
   in it. Shape: { quote, name, role }. */
const TESTIMONIALS = []

const CATEGORY_ICONS = {
  moderation: ShieldCheck,
  economy: Coins,
  adventure: Sword,
  community: UsersThree,
  utilities: Wrench,
}

/* Hand-picked so each cell shows commands a server owner would actually
   recognise, rather than whichever ones happen to be declared first. */
const CATEGORY_SHOWCASE = {
  economy: ['/daily', '/work', '/fish', '/blackjack', '/petmenu', '/alliance', '/challenges'],
  moderation: ['/warn', 'Warn Message', '/warns', '/setup dashboard'],
  adventure: ['/start', '/quests', '/travel', '/launch'],
  community: ['/giveaway start', '/count', '/leaderboard', '/stats', '/milestones'],
  utilities: ['/steal', '/export-chat-history'],
}

const CATEGORY_PITCH = {
  economy:
    'Coins to earn, jobs to work, a bank that pays interest, blackjack to lose it all at, fishing and hunting with tools that wear out, and pets that keep earning while your members are offline. On top of that sit daily challenges, a weekly rotation that scores a different theme every day, and six-person alliances competing for the Sunday standings.',
  moderation:
    'Two tiers of automod: a plain-text pass that clears slurs, invite links, caps and spam on its own, and an opt-in AI check that reads context before acting. Three warnings inside 24 hours jails a member automatically. Warnings are anonymous, so your mods stop being the target — and everything is configured from one dashboard.',
  adventure: 'A turn-based RPG with its own gold, gear and areas to unlock, plus a real Texas Hold\'em table running as a Discord Activity.',
  community: 'Giveaways weighted by how active people actually are, a counting game, a starboard, a one-word collaborative story, reaction GIFs, and one leaderboard hub covering all six boards.',
  utilities: 'The small things you would otherwise add a fourth bot for — including a ? text-prefix shortcut for every economy command.',
}

const PROBLEMS = [
  {
    problem: 'Nothing to do',
    answer: 'A reason to open Discord',
    detail:
      'Daily rewards, streaks, challenges, pets earning in the background, and a counting streak nobody wants to be the one to break.',
  },
  {
    problem: 'Mods burn out',
    answer: 'Moderation that runs itself',
    detail:
      'Automod handles the obvious cases. Warnings are anonymous and stack into an automatic jail, so no single mod wears the blame.',
  },
  {
    problem: 'Six bots, six dashboards',
    answer: 'One bot, one dashboard',
    detail:
      `${MODULE_COUNT} modules on one core, configured from one dashboard, holding one set of permissions in your server settings.`,
  },
]

/* The three systems that most change what a server can do with the bot, and
   the ones no other module explains on its own. Ordered by how much of the
   server they involve: a whole alliance, a whole week, a whole table. */
const HIGHLIGHTS = [
  {
    icon: UsersThree,
    title: 'Alliances',
    lede: 'Six people, one treasury',
    body:
      'Up to six members pool their weekly points into one alliance with a shared treasury, a rank ladder, and a Tech Center of upgrades. Founding one is deliberately expensive — it is a clubhouse, not a click. Nothing you can buy multiplies your points, so the richest alliance cannot compound its lead.',
  },
  {
    icon: ArrowsClockwise,
    title: 'Weekly Rotation',
    lede: 'A different game every day',
    body:
      'Monday scores hustling and pets, Tuesday social and gifts, Wednesday expansion, Thursday the casino, Friday voice, Saturday the heist. Sunday is Results Day: the standings post and the top three take the winner role, then it starts again.',
  },
  {
    icon: Cards,
    title: 'Poker',
    lede: 'A real table, inside Discord',
    body:
      "Texas Hold'em as a Discord Activity — a live table rendered in Discord's own panel, buying in against the same balance your members earn everywhere else.",
  },
]

const STEPS = [
  {
    icon: PaperPlaneTilt,
    title: 'Invite',
    body: 'Authorise A.L.I.C.E on the server you manage. Slash commands register straight away.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configure',
    body: 'Run /setup dashboard to switch modules on or off and set your channels and roles, all from one screen. Or use the web dashboard.',
  },
  {
    icon: GameController,
    title: 'Play',
    body: 'Members start earning coins the moment they talk. Nothing else needs turning on.',
  },
]

/* Nudges a button toward the cursor. Transform only, skipped for coarse
   pointers and for anyone who has asked for reduced motion. */
function useMagnetic() {
  const ref = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

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
      btn.style.transform = `translate(${x * 0.14}px, ${y * 0.28}px)`
    })
  }

  function handleLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (ref.current) ref.current.style.transform = ''
  }

  return [ref, handleMove, handleLeave]
}

function Reveal({ as: Tag = 'div', className = '', delay = 0, blur = true, children, ...rest }) {
  const [ref, visible] = useReveal({ threshold: 0.12 })
  return (
    <Tag
      ref={ref}
      className={`home-reveal ${blur ? 'home-reveal-blur' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function InviteButton({ size = '', children = INVITE_LABEL }) {
  const [ref, onMove, onLeave] = useMagnetic()
  return (
    <a
      ref={ref}
      href={INVITE_URL}
      target="_blank"
      rel="noopener"
      className={`home-btn home-btn-primary ${size}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
      <span className="home-icon-chip" aria-hidden="true">
        <ArrowUpRight weight="bold" />
      </span>
    </a>
  )
}

/* Reads the public server count. Failing is fine and silent: the band
   simply shows the product facts, which never depend on the API being
   reachable. */
function useServerCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchPublicStats()
      .then((data) => {
        if (!cancelled && typeof data?.guildCount === 'number') setCount(data.guildCount)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return count
}

function ProofBand() {
  const serverCount = useServerCount()
  const showServers = serverCount !== null && serverCount >= SERVER_COUNT_REVEAL_AT

  const facts = [
    { value: String(MODULE_COUNT), label: 'systems, all on one core' },
    { value: String(COMMAND_COUNT), label: 'commands, every one documented' },
    { value: '1', label: 'dashboard to configure them from' },
  ]

  if (showServers) {
    facts.push({ value: serverCount.toLocaleString(), label: 'servers running it', live: true })
  }

  return (
    <section className="home-proof" aria-label="At a glance">
      <div className="home-wrap">
        <Reveal className="home-proof-inner">
          {facts.map((fact) => (
            <div className="home-proof-item" key={fact.label}>
              <div className="home-proof-value">
                {fact.live && <span className="home-live-dot" aria-hidden="true" />}
                {fact.value}
              </div>
              <div className="home-proof-label">{fact.label}</div>
            </div>
          ))}
        </Reveal>
        <Reveal className="home-proof-note" delay={80} blur={false}>
          Built and run by one developer.{' '}
          <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener">
            Ask questions in the support server
          </a>
          .
        </Reveal>
      </div>
    </section>
  )
}

function Testimonials() {
  if (TESTIMONIALS.length === 0) return null
  return (
    <section className="home-section" aria-labelledby="quotes-heading">
      <div className="home-wrap">
        <div className="home-section-head is-centered">
          <h2 id="quotes-heading">What server owners say</h2>
        </div>
        <div className="home-quotes">
          {TESTIMONIALS.map((t) => (
            <Reveal as="figure" className="home-quote" key={t.name}>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                {t.name}, {t.role}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [heroRef, heroVisible] = useReveal({ threshold: 0.05 })
  const heroShown = heroVisible ? 'is-visible' : ''

  return (
    <main id="main-content" className="home-page">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />

      {/* 1. Hero */}
      <header className="home-hero">
        <NeuralCanvas className="home-hero-canvas" />
        <div className="home-wrap">
          <div ref={heroRef}>
            <h1 className={`home-reveal home-reveal-blur ${heroShown}`}>
              Give them a reason to come back.
            </h1>
            <p
              className={`home-hero-lede home-reveal ${heroShown}`}
              style={{ transitionDelay: heroVisible ? '90ms' : '0ms' }}
            >
              A.L.I.C.E runs the economy, games, giveaways and moderation that keep a Discord
              server busy. {MODULE_COUNT} modules, one bot.
            </p>
            <div
              className={`home-cta-row home-reveal ${heroShown}`}
              style={{ transitionDelay: heroVisible ? '160ms' : '0ms' }}
            >
              <InviteButton size="home-btn-lg" />
              <Link to="/commands" className="home-btn home-btn-secondary home-btn-lg">
                Browse commands
              </Link>
            </div>
          </div>

          <Reveal className="home-portrait" delay={120}>
            <div className="home-portrait-glow" aria-hidden="true" />
            <div className="home-portrait-frame">
              <img
                src="/images/alice.png"
                alt="A.L.I.C.E, drawn as a hooded figure in headphones in front of a wall of monitors"
                width="800"
                height="1000"
                fetchPriority="high"
              />
            </div>
          </Reveal>
        </div>
      </header>

      {/* 2. Proof */}
      <ProofBand />

      {/* 3. The problem it solves */}
      <section className="home-section home-problem" aria-labelledby="problem-heading">
        <div className="home-wrap">
          <Reveal>
            <h2 id="problem-heading" className="home-problem-statement">
              Servers rarely die from drama. They die from <em>silence</em>.
            </h2>
            <p className="home-problem-body">
              People join, read a bit, and never open the tab again, because there is nothing
              waiting for them when they do. A.L.I.C.E exists to put something there.
            </p>
          </Reveal>

          <div className="home-triad">
            {PROBLEMS.map((item, i) => (
              <Reveal className="home-triad-item" key={item.problem} delay={i * 90}>
                <div className="home-triad-problem">{item.problem}</div>
                <div className="home-triad-answer">{item.answer}</div>
                <p className="home-triad-detail">{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What it ships */}
      <section className="home-section" aria-labelledby="features-heading">
        <div className="home-wrap">
          <Reveal className="home-section-head">
            <span className="home-eyebrow">What it does</span>
            <h2 id="features-heading">
              {MODULE_COUNT} modules, grouped {CATEGORIES.length} ways.
            </h2>
            <p>
              Everything runs on the same MongoDB core, so progress, coins and stats follow a
              member across every system instead of living in separate bots.
            </p>
          </Reveal>

          <div className="home-bento">
            {CATEGORIES.map((category, i) => {
              const Icon = CATEGORY_ICONS[category.id]
              const chips = CATEGORY_SHOWCASE[category.id] || []
              const lead = i < 2
              const moduleCommands = category.modules.reduce(
                (total, m) => total + m.groups.reduce((a, g) => a + g.commands.length, 0),
                0,
              )
              return (
                <Reveal
                  className={`home-bento-cell ${lead ? 'is-lead' : ''}`}
                  key={category.id}
                  delay={(i % 3) * 80}
                >
                  <span className="home-card-icon" aria-hidden="true">
                    <Icon size={lead ? 24 : 20} weight="duotone" />
                  </span>
                  <h3>{category.name}</h3>
                  <p>{CATEGORY_PITCH[category.id]}</p>
                  <div className="home-bento-chips">
                    {chips.map((chip) => (
                      <span className="home-bento-chip" key={chip}>{chip}</span>
                    ))}
                    {moduleCommands > chips.length && (
                      <span className="home-bento-chip is-more">
                        +{moduleCommands - chips.length} more
                      </span>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4b. The three systems worth a closer look */}
      <section className="home-section" aria-labelledby="highlights-heading">
        <div className="home-wrap">
          <Reveal className="home-section-head">
            <span className="home-eyebrow">Worth the tour</span>
            <h2 id="highlights-heading">Three systems most bots do not have.</h2>
            <p>
              The economy is the habit. These are the reasons it stays interesting once
              everyone already has coins.
            </p>
          </Reveal>

          <div className="home-triad">
            {HIGHLIGHTS.map((item, i) => (
              <Reveal className="home-triad-item" key={item.title} delay={i * 90}>
                <span className="home-card-icon" aria-hidden="true">
                  <item.icon size={20} weight="duotone" />
                </span>
                <div className="home-triad-problem">{item.title}</div>
                <div className="home-triad-answer">{item.lede}</div>
                <p className="home-triad-detail">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How it works */}
      <section className="home-section" aria-labelledby="start-heading">
        <div className="home-wrap">
          <Reveal className="home-section-head is-centered">
            <h2 id="start-heading">Running in about a minute.</h2>
          </Reveal>

          <div className="home-steps">
            {STEPS.map((step, i) => (
              <Reveal className="home-step" key={step.title} delay={i * 110}>
                <span className="home-step-marker" aria-hidden="true">
                  <step.icon size={22} weight="duotone" />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Full index */}
      <section className="home-section" aria-labelledby="index-heading">
        <div className="home-wrap">
          <Reveal className="home-section-head">
            <h2 id="index-heading">Every module, in the open.</h2>
            <p>
              {COMMAND_COUNT} commands with their arguments and required permissions written
              down. Jump straight to the one you need.
            </p>
          </Reveal>

          <div className="home-index">
            {CATEGORIES.map((category, i) => (
              <Reveal className="home-index-group" key={category.id} delay={(i % 3) * 70}>
                <h3>{category.name}</h3>
                <ul>
                  {category.modules.map((module) => {
                    const count = module.groups.reduce((a, g) => a + g.commands.length, 0)
                    return (
                      <li key={module.id}>
                        <Link className="home-index-row" to={`/commands#${module.id}`}>
                          {module.name}
                          <span className="home-index-count">
                            {count === 0 ? 'no commands' : `${count} ${count === 1 ? 'command' : 'commands'}`}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* 7. Closing invite */}
      <section className="home-section" aria-labelledby="closer-heading">
        <div className="home-wrap">
          <Reveal className="home-closer">
            <h2 id="closer-heading">Add it to your server.</h2>
            <p>
              Free to add, and every command works from day one. Turn off whatever you do not
              want from the dashboard.
            </p>
            <div className="home-cta-row">
              <InviteButton size="home-btn-lg" />
              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noopener"
                className="home-btn home-btn-secondary home-btn-lg"
              >
                Join the support server
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
