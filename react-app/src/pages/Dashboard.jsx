import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReveal } from '../hooks/useReveal'
import '../styles/homepage.css'

export default function Dashboard() {
  const { user, guilds, loading, logout } = useAuth()
  const [ref, visible] = useReveal({ threshold: 0.05 })

  if (loading) {
    return (
      <main id="main-content" className="home-page home-content">
        <div className="home-mesh" aria-hidden="true" />
        <div className="home-blueprint" aria-hidden="true" />
        <div className="home-spotlight" aria-hidden="true" />
        <div className="home-grain" aria-hidden="true" />
        <div className="home-wrap" style={{ maxWidth: 760 }}>
          <div className="home-skeleton" style={{ width: 220, height: 32, marginBottom: '1.5rem' }} />
          <div className="home-skeleton" style={{ height: 56, borderRadius: 12, marginBottom: '0.75rem' }} />
          <div className="home-skeleton" style={{ height: 56, borderRadius: 12, marginBottom: '0.75rem' }} />
          <div className="home-skeleton" style={{ height: 56, borderRadius: 12 }} />
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-spotlight" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`} style={{ maxWidth: 760 }}>
        <div className="home-page-eyebrow-row">
          <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> Account</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={user.avatar} alt="" width={48} height={48} className="home-avatar" />
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: user.isDev ? '0.3rem' : 0 }}>Welcome, {user.username}</h1>
              {user.isDev && <span className="home-badge home-badge-mods">Dev</span>}
            </div>
          </div>
          <button className="home-btn home-btn-outline home-btn-sm" onClick={logout} type="button">Log out</button>
        </div>

        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--home-ink-muted)', marginBottom: '1rem' }}>
          Your servers
        </h2>

        {guilds.length === 0 ? (
          <p className="home-lede">
            A.L.I.C.E isn&rsquo;t installed in any server you manage yet.{' '}
            <Link to="/" style={{ color: 'var(--home-accent-soft)' }}>Invite it to one</Link> and come back here.
          </p>
        ) : (
          <ul className="home-panel-list">
            {guilds.map((guild, i) => (
              <li
                key={guild.id}
                className="home-panel-row home-reveal-child"
                style={{ transitionDelay: visible ? `${i * 60}ms` : '0ms' }}
              >
                {guild.icon ? (
                  <img src={guild.icon} alt="" width={36} height={36} className="home-avatar" />
                ) : (
                  <div className="home-avatar-placeholder" style={{ width: 36, height: 36 }} aria-hidden="true" />
                )}
                <span style={{ flexGrow: 1 }}>{guild.name}</span>
                {guild.botInstalled ? (
                  <Link className="home-btn home-btn-outline home-btn-sm" to={`/servers/${guild.id}`}>
                    Configure
                  </Link>
                ) : (
                  <button
                    className="home-btn home-btn-outline home-btn-sm"
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
