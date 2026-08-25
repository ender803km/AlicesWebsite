import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReveal } from '../hooks/useReveal'
import { INVITE_URL, INVITE_LABEL } from '../lib/links'
import '../styles/system.css'

function Backdrop() {
  return (
    <>
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
    </>
  )
}

export default function Dashboard() {
  const { user, guilds, loading, logout } = useAuth()
  const [ref, visible] = useReveal({ threshold: 0.05 })

  if (loading) {
    return (
      <main id="main-content" className="home-page home-content">
        <Backdrop />
        <div className="home-wrap home-wrap-narrow" role="status" aria-label="Loading your servers">
          {/* Mirrors the header: avatar, name, then the list of server rows. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div className="home-skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
            <div className="home-skeleton" style={{ width: 220, height: 28 }} />
          </div>
          <div className="home-skeleton" style={{ width: 120, height: 14, marginBottom: '1rem' }} />
          <div className="home-skeleton" style={{ height: 68, borderRadius: 12, marginBottom: '0.75rem' }} />
          <div className="home-skeleton" style={{ height: 68, borderRadius: 12, marginBottom: '0.75rem' }} />
          <div className="home-skeleton" style={{ height: 68, borderRadius: 12 }} />
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <main id="main-content" className="home-page home-content">
      <Backdrop />
      <div ref={ref} className={`home-wrap home-wrap-narrow home-reveal ${visible ? 'is-visible' : ''}`}>
        <span className="home-eyebrow">Account</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={user.avatar} alt="" width={48} height={48} className="home-avatar" />
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: user.isDev ? '0.3rem' : 0 }}>Welcome, {user.username}</h1>
              {user.isDev && <span className="home-badge home-badge-mods">Dev</span>}
            </div>
          </div>
          <button className="home-btn home-btn-secondary home-btn-sm" onClick={logout} type="button">Log out</button>
        </div>

        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--home-ink-muted)', marginBottom: '1rem' }}>
          Your servers
        </h2>

        {guilds.length === 0 ? (
          <div className="home-empty">
            <h3>No servers yet</h3>
            <p>
              A.L.I.C.E isn&rsquo;t installed in any server you manage yet. Invite it to
              one, then come back here to configure it.
            </p>
            <a href={INVITE_URL} target="_blank" rel="noopener" className="home-btn home-btn-primary">
              {INVITE_LABEL}
              <span className="home-icon-chip" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          </div>
        ) : (
          <ul className="home-panel-list">
            {guilds.map((guild) => (
              <li key={guild.id} className="home-panel-row">
                {guild.icon ? (
                  <img src={guild.icon} alt="" width={36} height={36} className="home-avatar" />
                ) : (
                  <div className="home-avatar home-avatar-placeholder" style={{ width: 36, height: 36 }} aria-hidden="true" />
                )}
                <span style={{ flexGrow: 1 }}>{guild.name}</span>
                {guild.botInstalled ? (
                  <Link className="home-btn home-btn-secondary home-btn-sm" to={`/servers/${guild.id}`}>
                    Configure
                  </Link>
                ) : (
                  <button
                    className="home-btn home-btn-secondary home-btn-sm"
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
