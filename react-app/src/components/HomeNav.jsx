import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight } from '@phosphor-icons/react'

import { useAuth } from '../context/AuthContext'
import { INVITE_URL } from '../lib/links'
import '../styles/system.css'

// Privacy and Terms deliberately live in the footer rather than up here.
// They are legally required, not navigational, and carrying them made
// the bar eight items wide with no room left for the thing the page is
// actually asking people to do.
const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/commands', label: 'Commands' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function HomeNav() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close the mobile menu on navigation, otherwise it stays open over
  // the page the user just asked for.
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Lock body scroll while the menu is open, and let Escape close it.
  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const accountLink = loading
    ? null
    : { to: user ? '/dashboard' : '/login', label: user ? 'Dashboard' : 'Log in' }

  const allLinks = [
    ...navLinks,
    ...(!loading && user?.isDev ? [{ to: '/dev', label: 'Dev' }] : []),
    ...(accountLink ? [accountLink] : []),
  ]

  return (
    <div className="home-page">
      <div className="home-nav-shell">
        <nav className="home-nav" aria-label="Primary">
          <NavLink to="/" end className="home-brand">A.L.I.C.E</NavLink>

          <ul className="home-nav-links">
            {allLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? 'is-current' : '')}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <a href={INVITE_URL} target="_blank" rel="noopener" className="home-nav-cta">
            Invite
            <span className="home-icon-chip" aria-hidden="true">
              <ArrowUpRight weight="bold" />
            </span>
          </a>

          <button
            type="button"
            className={`home-hamburger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
          </button>
        </nav>
      </div>

      <div id="home-mobile-menu" className={`home-mobile-menu ${open ? 'is-open' : ''}`}>
        <ul>
          {allLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'is-current' : '')}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener"
          className="home-btn home-btn-primary home-btn-lg home-mobile-cta"
        >
          Invite to Discord
          <span className="home-icon-chip" aria-hidden="true">
            <ArrowUpRight weight="bold" />
          </span>
        </a>
      </div>
    </div>
  )
}
