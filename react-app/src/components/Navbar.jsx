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

export default function Navbar() {
  const { user, loading } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top site-navbar">
      <div className="container">
        <NavLink className="navbar-brand" to="/">A.L.I.C.E</NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto gap-lg-4">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  aria-current={undefined}
                  to={link.to}
                  end={link.end}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item">
              {!loading && (
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  to={user ? '/dashboard' : '/login'}
                >
                  {user ? 'Dashboard' : 'Login'}
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
