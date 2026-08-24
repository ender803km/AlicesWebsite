import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer text-center">
      <div className="container">
        <nav className="site-footer-links" aria-label="Footer">
          <Link to="/commands">Commands</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href="https://discord.gg/Rtnrd5G38a" target="_blank" rel="noopener">
            Support server
          </a>
        </nav>
        <p className="site-footer-copy">© {new Date().getFullYear()} A.L.I.C.E</p>
      </div>
    </footer>
  )
}
