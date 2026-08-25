import { ArrowUpRight } from '@phosphor-icons/react'

import { useReveal } from '../hooks/useReveal'
import { SUPPORT_SERVER_URL, GITHUB_URL, INVITE_URL, INVITE_LABEL } from '../lib/links'
import '../styles/system.css'

const CHANNELS = [
  {
    href: SUPPORT_SERVER_URL,
    title: 'Support server',
    body: 'The fastest route for anything. Setup questions, a command behaving oddly, or a feature you want.',
  },
  {
    href: GITHUB_URL,
    title: 'GitHub',
    body: 'For reproducible bugs and anything about the code itself.',
  },
  {
    href: 'https://heylink.me/A.L.I.C.E_Bot/',
    title: 'All links',
    body: 'Every A.L.I.C.E link in one place, including listings and social accounts.',
  },
]

export default function Contact() {
  const [ref, visible] = useReveal({ threshold: 0.05 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />

      <div ref={ref} className={`home-wrap home-wrap-narrow home-reveal ${visible ? 'is-visible' : ''}`}>
        <span className="home-eyebrow">Get in touch</span>
        <h1>Contact</h1>
        <p className="home-lede">
          A.L.I.C.E is run by one developer, so there is no ticket queue. Pick whichever of
          these fits and you will get a real answer.
        </p>

        <div className="home-link-list">
          {CHANNELS.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              target="_blank"
              rel="noopener"
              className="home-link-row"
            >
              <div>
                <h3>{channel.title}</h3>
                <p>{channel.body}</p>
              </div>
              <ArrowUpRight size={18} weight="bold" className="home-link-row-arrow" aria-hidden="true" />
            </a>
          ))}
        </div>

        <h2>Reporting something broken</h2>
        <p>
          Four things make a bug fixable on the first reply: the command you ran, what you
          expected, what happened instead, and roughly when. A screenshot of the message
          A.L.I.C.E sent back covers most of that on its own.
        </p>

        <div className="home-cta-row" style={{ marginTop: '2.5rem' }}>
          <a href={INVITE_URL} target="_blank" rel="noopener" className="home-btn home-btn-primary">
            {INVITE_LABEL}
            <span className="home-icon-chip" aria-hidden="true">
              <ArrowUpRight weight="bold" />
            </span>
          </a>
        </div>
      </div>
    </main>
  )
}
