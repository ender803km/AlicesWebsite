import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/homepage.css'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/commands', label: 'Commands' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
]

// A floating "island" pill nav used only on the homepage, matching the
// approved concept mockup. Every other route keeps the standard Bootstrap
// navbar in Navbar.jsx.
export default function HomeNav() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  // Lock body scroll while the mobile menu is open, and let Escape close it.
  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const accountLink = loading
    ? null
    : { to: user ? '/dashboard' : '/login', label: user ? 'Dashboard' : 'Login' }

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
                <NavLink to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'is-current' : '')}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <a
            href="https://discord.com/oauth2/authorize?client_id=1520771362246103091&permissions=1392442207446&integration_type=0&scope=bot+applications.commands"
            target="_blank"
            rel="noopener"
            className="home-nav-cta"
          >
            Invite
            <span className="home-icon-chip" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
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
      </div>
    </div>
  )
}
