import { Link } from 'react-router-dom'

import { CATEGORIES } from '../data/commands'
import { INVITE_URL, SUPPORT_SERVER_URL, GITHUB_URL } from '../lib/links'
import '../styles/system.css'

export default function Footer() {
  return (
    <footer className="home-page home-footer">
      <div className="home-wrap">
        <div className="home-footer-grid">
          <div className="home-footer-brand">
            <Link to="/" className="home-brand">A.L.I.C.E</Link>
            <p className="home-footer-blurb">
              Artificial Learning and Intelligent Community Engine. Moderation, economy, games
              and events for Discord servers.
            </p>
          </div>

          <div className="home-footer-col">
            <h4>Commands</h4>
            <ul>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link to={`/commands#${category.modules[0].id}`}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-footer-col">
            <h4>Elsewhere</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li>
                <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener">Support server</a>
              </li>
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
              </li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="home-footer-base">
          <p>© {new Date().getFullYear()} A.L.I.C.E</p>
          <a href={INVITE_URL} target="_blank" rel="noopener" className="home-btn home-btn-secondary home-btn-sm">
            Invite to Discord
          </a>
        </div>
      </div>
    </footer>
  )
}
