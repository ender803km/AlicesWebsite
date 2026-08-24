import { Link } from 'react-router-dom'
import '../styles/homepage.css'

export default function Footer() {
  return (
    <footer className="home-page home-footer">
      <div className="home-wrap">
        <nav className="home-footer-links" aria-label="Footer">
          <Link to="/commands">Commands</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href="https://discord.gg/Rtnrd5G38a" target="_blank" rel="noopener">
            Support server
          </a>
        </nav>
        <p className="home-footer-copy">© {new Date().getFullYear()} A.L.I.C.E</p>
      </div>
    </footer>
  )
}
