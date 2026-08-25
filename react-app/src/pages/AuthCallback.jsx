import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../styles/system.css'

// Every branch of this screen paints the same ambient stack, so the page
// does not flash a different background while the token is exchanged.
function Backdrop() {
  return (
    <>
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
    </>
  )
}

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
        <Backdrop />
        <div className="home-wrap" style={{ maxWidth: 480 }}>
          <span className="home-eyebrow">Account</span>
          <div className="home-alert home-alert-error" role="alert">
            That login link looks incomplete.
          </div>
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

  // Signing-in state. The skeleton stands in for the heading and the line
  // of copy that the dashboard paints a moment later, so the handoff does
  // not jump.
  return (
    <main id="main-content" className="home-page home-content home-content-center">
      <Backdrop />
      <div className="home-wrap" style={{ maxWidth: 480 }} role="status" aria-label="Signing you in">
        <span className="home-eyebrow">Account</span>
        <div className="home-skeleton" style={{ width: 200, height: 30, margin: '0 auto 1.25rem' }} />
        <div className="home-skeleton" style={{ width: '100%', height: 14, margin: '0 auto 0.6rem' }} />
        <div className="home-skeleton" style={{ width: '70%', height: 14, margin: '0 auto' }} />
      </div>
    </main>
  )
}
