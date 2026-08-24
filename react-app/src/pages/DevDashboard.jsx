import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchDevOverview, fetchDevLogs } from '../lib/api'
import '../styles/homepage.css'

function timeAgo(iso) {
  if (!iso) return 'unknown'
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function LogPanel({ title, logs, empty }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--home-ink-muted)', marginBottom: '0.75rem' }}>
        {title}
      </h3>
      {logs.length === 0 ? (
        <p style={{ color: 'var(--home-ink-faint)', fontSize: '0.88rem' }}>{empty}</p>
      ) : (
        <div className="home-log-panel">
          {logs.map((log, i) => (
            <div key={i} className={log.severity === 'error' ? 'home-log-line-error' : undefined}>
              <span className="home-log-line-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="home-stat-grid">
      {Array.from({ length: 4 }, (_, i) => (
        <div className="home-stat-tile" key={i}>
          <div className="home-skeleton" style={{ width: '50%', height: 12, marginBottom: '0.6rem' }} />
          <div className="home-skeleton" style={{ width: '70%', height: 22 }} />
        </div>
      ))}
    </div>
  )
}

export default function DevDashboard() {
  const { user, loading: authLoading } = useAuth()

  const [overview, setOverview] = useState(null)
  const [errorLogs, setErrorLogs] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const overviewRes = await fetchDevOverview()
      setOverview(overviewRes)

      if (overviewRes.railwayConfigured) {
        const [errors, activity] = await Promise.all([
          fetchDevLogs('errors').catch(() => ({ logs: [] })),
          fetchDevLogs('activity').catch(() => ({ logs: [] })),
        ])
        setErrorLogs(errors.logs)
        setActivityLogs(activity.logs)
      }
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (authLoading) {
    return (
      <main id="main-content" className="home-page home-content home-content-center">
        <div className="home-mesh" aria-hidden="true" />
        <div className="home-grain" aria-hidden="true" />
        <div className="home-wrap"><p className="home-lede">Loading…</p></div>
      </main>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!user.isDev) return <Navigate to="/dashboard" replace />

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div className="home-wrap" style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Devs dashboard</h1>
          <button className="home-btn home-btn-outline home-btn-sm" type="button" onClick={load}>
            Refresh
          </button>
        </div>

        {status === 'loading' && <StatSkeleton />}
        {status === 'error' && <div className="home-alert home-alert-error" role="alert">{error}</div>}

        {status === 'ready' && overview && (
          <>
            <div className="home-stat-grid">
              <div className="home-stat-tile">
                <div className="home-stat-tile-label">Servers</div>
                <div className="home-stat-tile-value">{overview.guildCount}</div>
              </div>
              <div className="home-stat-tile">
                <div className="home-stat-tile-label">Bot token</div>
                <div className="home-stat-tile-value is-good">Valid</div>
              </div>
              <div className="home-stat-tile">
                <div className="home-stat-tile-label">Last deploy</div>
                <div className="home-stat-tile-value">
                  {overview.deployment ? overview.deployment.status : '—'}
                </div>
              </div>
              <div className="home-stat-tile">
                <div className="home-stat-tile-label">Deployed</div>
                <div className="home-stat-tile-value">
                  {overview.deployment ? timeAgo(overview.deployment.createdAt) : '—'}
                </div>
              </div>
            </div>

            {!overview.railwayConfigured && (
              <div className="home-alert home-alert-info" role="alert">
                Log viewer isn&rsquo;t set up yet — set <code>RAILWAY_API_TOKEN</code> (and the related
                project/environment/service IDs) on the API service to enable it.
              </div>
            )}

            {overview.railwayConfigured && (
              <>
                <LogPanel title="Recent errors" logs={errorLogs} empty="No recent errors. 🎉" />
                <LogPanel
                  title="Recent moderation / command activity"
                  logs={activityLogs}
                  empty="Nothing flagged recently."
                />
              </>
            )}

            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>
              Servers ({overview.guildCount})
            </h2>
            {overview.guilds.length === 0 ? (
              <p style={{ color: 'var(--home-ink-muted)' }}>A.L.I.C.E isn&rsquo;t in any servers right now.</p>
            ) : (
              <ul className="home-panel-list">
                {overview.guilds.map((guild) => (
                  <li key={guild.id} className="home-panel-row">
                    {guild.icon ? (
                      <img src={guild.icon} alt="" width={28} height={28} className="home-avatar" />
                    ) : (
                      <div className="home-avatar-placeholder" style={{ width: 28, height: 28 }} aria-hidden="true" />
                    )}
                    <span>{guild.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
