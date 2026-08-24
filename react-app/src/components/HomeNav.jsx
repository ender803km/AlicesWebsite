import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/commands', label: 'Commands' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
]

// A floating "island" pill nav used only on the homepage, as a showcase of
// a heavier motion/glass treatment than the rest of the site. Every other
// route keeps the standard Bootstrap navbar in Navbar.jsx.
export default function HomeNav() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  // Lock body scroll while the overlay is open, and let Escape close it.
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
    <>
      <div className="fixed inset-x-0 top-6 z-[1000] flex justify-center px-[1rem]">
        <nav
          className="flex w-full max-w-[420px] items-center justify-between gap-[1rem] rounded-full [border:1px_solid_rgba(255,255,255,0.1)] bg-[#0a0f16]/70 py-2.5 pl-5 pr-2.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-[border-color,background-color] duration-300"
          aria-label="Primary"
        >
          <NavLink to="/" end className="font-display text-lg font-bold tracking-tight text-[#eef1f5] no-underline">
            A.L.I.C.E
          </NavLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="home-nav-overlay"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors duration-300 hover:bg-white/10"
          >
            <span
              className={`absolute h-[1.5px] w-4 bg-[#eef1f5] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? 'translate-y-0 rotate-45' : '-translate-y-[3px] rotate-0'
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-4 bg-[#eef1f5] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? 'translate-y-0 -rotate-45' : 'translate-y-[3px] rotate-0'
              }`}
            />
          </button>
        </nav>
      </div>

      <div
        id="home-nav-overlay"
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#05080c]/90 backdrop-blur-2xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex flex-col items-center gap-2 text-center">
          {allLinks.map((link, i) => (
            <li
              key={link.to}
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
            >
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-display block px-[1rem] py-2 text-3xl font-semibold tracking-tight no-underline transition-colors sm:text-4xl ${
                    isActive ? 'text-[#eef1f5]' : 'text-[#97a3b3] hover:text-[#eef1f5]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
