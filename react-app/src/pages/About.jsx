import { Link } from 'react-router-dom'
import { ArrowUpRight } from '@phosphor-icons/react'

import { useReveal } from '../hooks/useReveal'
import { CATEGORIES, COMMAND_COUNT } from '../data/commands'
import { INVITE_URL, INVITE_LABEL, SUPPORT_SERVER_URL } from '../lib/links'
import '../styles/system.css'

const MODULE_COUNT = CATEGORIES.reduce((total, c) => total + c.modules.length, 0)

export default function About() {
  const [ref, visible] = useReveal({ threshold: 0.05 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />

      <div ref={ref} className={`home-wrap home-wrap-narrow home-reveal ${visible ? 'is-visible' : ''}`}>
        <span className="home-eyebrow">About</span>
        <h1>About A.L.I.C.E</h1>
        <p className="home-lede">
          Artificial Learning and Intelligent Community Engine. One Discord bot covering the
          jobs most servers otherwise hand to five or six separate ones: moderation, an
          economy, an RPG, a poker table, giveaways, community games and activity tracking.
        </p>

        <h2>Why it exists</h2>
        <p>
          Most Discord servers do not fail loudly. They go quiet. Members join during a busy
          week, lurk, and never open the tab again, because nothing is waiting for them when
          they do. Meanwhile the mods who are still around spend their evenings deleting the
          same spam.
        </p>
        <p>
          A.L.I.C.E is built around both halves of that. The economy, pets, daily challenges,
          the weekly rotation, alliances, the counting game and the RPG exist to give people a
          small reason to check in, and a slightly different one each day. Automod and the
          anonymous warning system exist so that keeping the place civil does not fall on one
          person who then burns out.
        </p>

        <h2>How it is built</h2>
        <p>
          Every system shares one MongoDB-backed core rather than running as separate bots.
          That is the reason coins earned in one place count toward an achievement somewhere
          else, and the reason there is one dashboard rather than six. Each module registers
          a manifest saying what it owns and what it depends on, so turning one off tells you
          what else it would take with it instead of quietly breaking something.
        </p>
        <dl className="home-facts">
          <dt>Runtime</dt>
          <dd>Node.js with discord.js</dd>
          <dt>Storage</dt>
          <dd>MongoDB, one shared core across all {MODULE_COUNT} modules</dd>
          <dt>Hosting</dt>
          <dd>Railway, running continuously rather than on demand</dd>
          <dt>Moderation</dt>
          <dd>
            Rule-based automod, plus an opt-in language model layer that reads context before
            it acts rather than matching keywords, with self-harm and child-safety flags
            routed to their own private alert channels
          </dd>
          <dt>Interface</dt>
          <dd>
            Discord slash commands and a ? text-prefix shortcut, an in-Discord settings
            dashboard, and this site
          </dd>
        </dl>

        <h2>What is in it</h2>
        <p>
          {COMMAND_COUNT} commands across {MODULE_COUNT} modules, grouped into{' '}
          {CATEGORIES.length} categories. Every one is documented, and the list is generated
          from the bot&rsquo;s own source rather than kept by hand.
        </p>
        <ul className="home-list">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.name}.</strong> {category.blurb}
            </li>
          ))}
        </ul>

        <h2>Who runs it</h2>
        <p>
          One developer. Every command works today, with nothing held back. If something
          breaks, or you want a system that is not here yet, the{' '}
          <a
            href={SUPPORT_SERVER_URL}
            target="_blank"
            rel="noopener"
            style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            support server
          </a>{' '}
          is the fastest way to reach someone.
        </p>

        <div className="home-cta-row" style={{ marginTop: '2.5rem' }}>
          <a href={INVITE_URL} target="_blank" rel="noopener" className="home-btn home-btn-primary">
            {INVITE_LABEL}
            <span className="home-icon-chip" aria-hidden="true">
              <ArrowUpRight weight="bold" />
            </span>
          </a>
          <Link to="/commands" className="home-btn home-btn-secondary">
            Browse commands
          </Link>
        </div>
      </div>
    </main>
  )
}
