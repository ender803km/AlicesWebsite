import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchDevOverview, fetchDevLogs } from '../lib/api'

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
    <div className="mb-4">
      <h3 className="h6 text-body-secondary mb-2">{title}</h3>
      {logs.length === 0 ? (
        <p className="text-body-secondary small">{empty}</p>
      ) : (
        <div
          className="bg-black rounded p-3 small"
          style={{ maxHeight: 260, overflowY: 'auto', fontFamily: 'monospace' }}
        >
          {logs.map((log, i) => (
            <div key={i} className={log.severity === 'error' ? 'text-danger' : 'text-light'}>
              <span className="text-body-secondary">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>{' '}
              {log.message}
            </div>
          ))}
        </div>
      )}
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
      <main className="page-section text-center">
        <div className="container"><p className="lead">Loading…</p></div>
      </main>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!user.isDev) return <Navigate to="/dashboard" replace />

  return (
    <main className="page-section">
      <div className="container" style={{ maxWidth: 900 }} data-aos="fade-up">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <h1 className="h3 fw-bold mb-0">Devs dashboard</h1>
          <button className="btn btn-sm btn-outline-light" type="button" onClick={load}>
            Refresh
          </button>
        </div>

        {status === 'loading' && <p className="lead">Loading…</p>}
        {status === 'error' && <div className="alert alert-danger" role="alert">{error}</div>}

        {status === 'ready' && overview && (
          <>
            <div className="row g-3 mb-5">
              <div className="col-6 col-md-3">
                <div className="p-3 rounded border border-secondary-subtle h-100">
                  <div className="text-body-secondary small">Servers</div>
                  <div className="h3 mb-0">{overview.guildCount}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded border border-secondary-subtle h-100">
                  <div className="text-body-secondary small">Bot token</div>
                  <div className="h5 mb-0 text-success">Valid</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded border border-secondary-subtle h-100">
                  <div className="text-body-secondary small">Last deploy</div>
                  <div className="h5 mb-0">
                    {overview.deployment ? overview.deployment.status : '—'}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded border border-secondary-subtle h-100">
                  <div className="text-body-secondary small">Deployed</div>
                  <div className="h5 mb-0">
                    {overview.deployment ? timeAgo(overview.deployment.createdAt) : '—'}
                  </div>
                </div>
              </div>
            </div>

            {!overview.railwayConfigured && (
              <div className="alert alert-secondary" role="alert">
                Log viewer isn't set up yet — set <code>RAILWAY_API_TOKEN</code> (and the related
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

            <h2 className="h5 mb-3">Servers ({overview.guildCount})</h2>
            <ul className="list-group">
              {overview.guilds.map((guild) => (
                <li key={guild.id} className="list-group-item d-flex align-items-center gap-3">
                  {guild.icon ? (
                    <img src={guild.icon} alt="" width={28} height={28} style={{ borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1d2f47' }} aria-hidden="true" />
                  )}
                  <span>{guild.name}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}
