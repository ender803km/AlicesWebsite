import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../styles/homepage.css'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const match = window.location.hash.match(/token=([^&]+)/)
    if (!match) {
      setFailed(true)
      return
    }
    setToken(decodeURIComponent(match[1]))
    // Clear the token out of the URL bar before doing anything else with it.
    window.history.replaceState(null, '', window.location.pathname)
    refresh().then(() => navigate('/dashboard', { replace: true }))
  }, [navigate, refresh])

  if (failed) {
    return (
      <main id="main-content" className="home-page home-content home-content-center">
        <div className="home-mesh" aria-hidden="true" />
        <div className="home-blueprint" aria-hidden="true" />
        <div className="home-spotlight" aria-hidden="true" />
        <div className="home-grain" aria-hidden="true" />
        <div className="home-wrap" style={{ maxWidth: 480 }}>
          <div className="home-page-eyebrow-row">
            <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> Account</div>
          </div>
          <p className="home-lede">That login link looks incomplete.</p>
          <div className="home-cta-row">
            <a href="/login" className="home-btn home-btn-primary">
              Back to login
              <span className="home-icon-chip" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="home-page home-content home-content-center">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-spotlight" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div className="home-wrap" style={{ maxWidth: 480 }}>
        <div className="home-page-eyebrow-row">
          <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> Account</div>
        </div>
        <p className="home-lede">Signing you in…</p>
      </div>
    </main>
  )
}
