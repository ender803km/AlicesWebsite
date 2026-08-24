import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../lib/api'
import { useAuth } from '../context/AuthContext'

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
      <main className="page-section text-center">
        <div className="container" data-aos="fade-up">
          <p className="lead mb-4">That login link looks incomplete.</p>
          <a href="/login" className="btn btn-primary btn-lg px-4">Back to login</a>
        </div>
      </main>
    )
  }

  return (
    <main className="page-section text-center">
      <div className="container">
        <p className="lead">Signing you in…</p>
      </div>
    </main>
  )
}
