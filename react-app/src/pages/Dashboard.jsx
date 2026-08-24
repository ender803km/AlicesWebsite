import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, guilds, loading, logout } = useAuth()

  if (loading) {
    return (
      <main id="main-content" className="page-section">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="skeleton-line mb-4" style={{ width: 220, height: 32 }} />
          <div className="skeleton-line mb-2" style={{ height: 56, borderRadius: 12 }} />
          <div className="skeleton-line mb-2" style={{ height: 56, borderRadius: 12 }} />
          <div className="skeleton-line" style={{ height: 56, borderRadius: 12 }} />
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <main id="main-content" className="page-section">
      <div className="container" style={{ maxWidth: 800 }}>
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
          <ul className="list-group dashboard-list">
            {guilds.map((guild) => (
              <li key={guild.id} className="list-group-item d-flex align-items-center gap-3">
                {guild.icon ? (
                  <img src={guild.icon} alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
                ) : (
                  <div className="avatar-placeholder" style={{ width: 36, height: 36 }} aria-hidden="true" />
                )}
                <span className="flex-grow-1">{guild.name}</span>
                {guild.botInstalled ? (
                  <Link className="btn btn-sm btn-outline-primary" to={`/servers/${guild.id}`}>
                    Configure
                  </Link>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    disabled
                    title="Invite A.L.I.C.E to this server first"
                  >
                    Not installed
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
