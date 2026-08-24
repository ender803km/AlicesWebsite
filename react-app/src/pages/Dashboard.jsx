import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, guilds, loading, logout } = useAuth()

  if (loading) {
    return (
      <main className="page-section text-center">
        <div className="container"><p className="lead">Loading your servers…</p></div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="page-section">
      <div className="container" style={{ maxWidth: 800 }} data-aos="fade-up">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user.avatar}
              alt=""
              width={48}
              height={48}
              style={{ borderRadius: '50%' }}
            />
            <div>
              <h1 className="h3 fw-bold mb-0">Welcome, {user.username}</h1>
              {user.isDev && <span className="badge text-bg-secondary mt-1">Dev</span>}
            </div>
          </div>
          <button className="btn btn-outline-light" onClick={logout} type="button">Log out</button>
        </div>

        <h2 className="h5 text-body-secondary mb-3">Your servers</h2>

        {guilds.length === 0 ? (
          <p className="lead">
            A.L.I.C.E isn't installed in any server you manage yet.{' '}
            <Link to="/">Invite it to one</Link> and come back here.
          </p>
        ) : (
          <ul className="list-group">
            {guilds.map((guild) => (
              <li key={guild.id} className="list-group-item d-flex align-items-center gap-3">
                {guild.icon ? (
                  <img src={guild.icon} alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
                ) : (
                  <div
                    style={{ width: 36, height: 36, borderRadius: '50%', background: '#1d2f47' }}
                    aria-hidden="true"
                  />
                )}
                <span className="flex-grow-1">{guild.name}</span>
                <button className="btn btn-sm btn-outline-primary" type="button" disabled title="Coming in the next phase">
                  Configure
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
