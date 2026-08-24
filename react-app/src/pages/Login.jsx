import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReveal } from '../hooks/useReveal'
import '../styles/homepage.css'

const ERROR_MESSAGES = {
  invalid_state: "That login link expired — hit the button below to start over.",
  oauth_failed: "Discord couldn't complete the login. Give it another try.",
  access_denied: 'Login was cancelled.',
}

export default function Login() {
  const { loginUrl } = useAuth()
  const [params] = useSearchParams()
  const error = params.get('error')
  const [ref, visible] = useReveal({ threshold: 0.1 })

  return (
    <main id="main-content" className="home-page home-content home-content-center">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`} style={{ maxWidth: 480 }}>
        <h1>Log in</h1>
        <p className="home-lede">
          Log in with Discord to see the servers you manage where A.L.I.C.E is installed.
        </p>
        {error && (
          <div className="home-alert home-alert-error" role="alert">
            {ERROR_MESSAGES[error] || 'Something went wrong logging in — please try again.'}
          </div>
        )}
        <div className="home-cta-row">
          <a href={loginUrl} className="home-btn home-btn-primary">
            Login with Discord
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
