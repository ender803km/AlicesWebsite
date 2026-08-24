import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import '../styles/homepage.css'

export default function NotFound() {
  const [ref, visible] = useReveal({ threshold: 0.1 })

  return (
    <main id="main-content" className="home-page home-content home-content-center">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`}>
        <div className="home-404-code">404</div>
        <p className="home-lede">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <div className="home-cta-row">
          <Link to="/" className="home-btn home-btn-primary">
            Back to Home
            <span className="home-icon-chip" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
