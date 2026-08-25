import { useCallback, useEffect, useState } from 'react'
import { Navigate, Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchGuildConfig, saveGuildConfig, fetchGuildChannels } from '../lib/api'
import { useReveal } from '../hooks/useReveal'
import '../styles/system.css'

// Every branch of this screen paints the same ambient stack, so switching
// between loading, error and the form does not change the background.
function Backdrop() {
  return (
    <>
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
    </>
  )
}

// Stands in for the first few form sections, in the same shapes, so the
// real form does not shift the page when it arrives.
function ConfigSkeleton() {
  return (
    <div role="status" aria-label="Loading configuration">
      <div className="home-skeleton" style={{ width: 180, height: 20, marginBottom: '1.25rem' }} />
      <div className="home-toggle-grid" style={{ marginBottom: '3rem' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div className="home-skeleton" key={i} style={{ height: 44 }} />
        ))}
      </div>
      <div className="home-skeleton" style={{ width: 160, height: 20, marginBottom: '1.25rem' }} />
      <div className="home-skeleton" style={{ height: 40, marginBottom: '0.75rem' }} />
      <div className="home-skeleton" style={{ height: 40, width: '60%' }} />
    </div>
  )
}

// This form is long: a single page-wide reveal would resolve while most
// of it is still off-screen, so each section gets its own small
// IntersectionObserver instead (same idea as the homepage's FeatureCard)
// and fades/rises in as the user actually scrolls to it.
function RevealSection({ children }) {
  const [ref, visible] = useReveal({ threshold: 0.2 })
  return (
    <section ref={ref} className={`home-form-section home-reveal ${visible ? 'is-visible' : ''}`}>
      {children}
    </section>
  )
}

// Same 12 modules from the public Commands page, in the same order, so the
// toggle list here reads as "the same bot" rather than a different feature
// set. Keep this in sync with alice-api's MODULE_KEYS.
const MODULES = [
  { key: 'statBot', label: '📈 Stat Bot' },
  { key: 'achievements', label: '🏆 Achievements' },
  { key: 'moderation', label: '🛡 Moderation' },
  { key: 'starboard', label: '⭐ Starboard' },
  { key: 'serverSetup', label: '⚙️ Server Setup' },
  { key: 'giveaway', label: '🎁 Giveaway' },
  { key: 'counting', label: '🔢 Counting' },
  { key: 'economy', label: '💰 Economy' },
  { key: 'rpgGame', label: '⚔️ RPG Game' },
  { key: 'interactions', label: '🎉 Interactions' },
  { key: 'emojiTools', label: '🎭 Emoji Tools' },
  { key: 'chatExport', label: '🗂️ Chat Export' },
]

function ChannelSelect({ id, value, onChange, channels }) {
  return (
    <select id={id} className="home-select" value={value || ''} onChange={onChange}>
      <option value="">None</option>
      {channels.map((c) => (
        <option key={c.id} value={c.id}>
          #{c.name}
        </option>
      ))}
    </select>
  )
}

export default function GuildConfig() {
  const { guildId } = useParams()
  const { user, guilds, loading: authLoading } = useAuth()

  const [config, setConfig] = useState(null)
  const [channels, setChannels] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  const guild = guilds.find((g) => g.id === guildId)

  const load = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const [configRes, channelsRes] = await Promise.all([
        fetchGuildConfig(guildId),
        fetchGuildChannels(guildId).catch(() => ({ channels: [] })),
      ])
      setConfig(configRes.config)
      setChannels(channelsRes.channels)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [guildId])

  useEffect(() => {
    if (guild) load()
  }, [guild, load])

  if (authLoading) {
    return (
      <main id="main-content" className="home-page home-content">
        <Backdrop />
        <div className="home-wrap" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="home-skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div className="home-skeleton" style={{ width: 200, height: 26 }} />
          </div>
          <ConfigSkeleton />
        </div>
      </main>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!guild) {
    return (
      <main id="main-content" className="home-page home-content">
        <Backdrop />
        <div className="home-wrap" style={{ maxWidth: 700 }}>
          <div className="home-empty">
            <h3>Server not available</h3>
            <p>
              You don&rsquo;t manage a server with that ID, or A.L.I.C.E isn&rsquo;t in it.
            </p>
            <Link to="/dashboard" className="home-btn home-btn-secondary">Back to dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  function update(path, value) {
    setConfig((prev) => {
      const next = structuredClone(prev)
      let target = next
      for (let i = 0; i < path.length - 1; i += 1) target = target[path[i]]
      target[path[path.length - 1]] = value
      return next
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await saveGuildConfig(guildId, config)
      setConfig(res.config)
      setSavedAt(Date.now())
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main id="main-content" className="home-page home-content">
      <Backdrop />
      <div className="home-wrap" style={{ maxWidth: 760 }}>
        <span className="home-eyebrow">Server configuration</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          {guild.icon ? (
            <img src={guild.icon} alt="" width={40} height={40} className="home-avatar" />
          ) : (
            <div className="home-avatar home-avatar-placeholder" style={{ width: 40, height: 40 }} aria-hidden="true" />
          )}
          <h1 style={{ fontSize: '1.5rem' }}>{guild.name}</h1>
        </div>
        <p style={{ color: 'var(--home-ink-muted)', marginBottom: '2rem' }}>
          <Link to="/dashboard" style={{ color: 'var(--home-accent-bright)' }}>← Back to your servers</Link>
        </p>

        {status === 'loading' && <ConfigSkeleton />}

        {status === 'error' && (
          <div className="home-alert home-alert-error" role="alert">{error}</div>
        )}

        {status === 'ready' && config && (
          <form onSubmit={handleSave}>
            <RevealSection>
              <h2>Command modules</h2>
              <div className="home-toggle-grid">
                {MODULES.map((mod) => (
                  <div className="home-switch-row" key={mod.key}>
                    <input
                      className="home-switch"
                      type="checkbox"
                      role="switch"
                      id={`mod-${mod.key}`}
                      checked={config.modules[mod.key]}
                      onChange={(e) => update(['modules', mod.key], e.target.checked)}
                    />
                    <label htmlFor={`mod-${mod.key}`}>{mod.label}</label>
                  </div>
                ))}
              </div>
            </RevealSection>

            <RevealSection>
              <h2>Command prefix</h2>
              <div className="home-field" style={{ maxWidth: 120 }}>
                <input
                  type="text"
                  className="home-input"
                  maxLength={5}
                  required
                  value={config.prefix}
                  onChange={(e) => update(['prefix'], e.target.value)}
                />
              </div>
              {!config.prefix.trim() && (
                <p className="home-field-hint">Can&rsquo;t be blank. Pick at least one character.</p>
              )}
            </RevealSection>

            <RevealSection>
              <h2>Moderation</h2>
              <div className="home-field">
                <label htmlFor="mod-log-channel">Mod log channel</label>
                <ChannelSelect
                  id="mod-log-channel"
                  channels={channels}
                  value={config.moderation.logChannelId}
                  onChange={(e) => update(['moderation', 'logChannelId'], e.target.value || null)}
                />
              </div>
              <div className="home-switch-row" style={{ marginBottom: '0.6rem' }}>
                <input
                  className="home-switch"
                  type="checkbox"
                  role="switch"
                  id="automod-enabled"
                  checked={config.moderation.autoModEnabled}
                  onChange={(e) => update(['moderation', 'autoModEnabled'], e.target.checked)}
                />
                <label htmlFor="automod-enabled">Enable auto-mod</label>
              </div>
              <div
                className="home-switch-row"
                style={{ marginBottom: config.moderation.llmModEnabled ? '1rem' : 0 }}
              >
                <input
                  className="home-switch"
                  type="checkbox"
                  role="switch"
                  id="llmmod-enabled"
                  checked={config.moderation.llmModEnabled}
                  onChange={(e) => update(['moderation', 'llmModEnabled'], e.target.checked)}
                />
                <label htmlFor="llmmod-enabled">Enable AI moderation</label>
              </div>
              {config.moderation.llmModEnabled && (
                <div className="home-field" style={{ maxWidth: 220 }}>
                  <label htmlFor="llmmod-sensitivity">AI moderation sensitivity</label>
                  <select
                    id="llmmod-sensitivity"
                    className="home-select"
                    value={config.moderation.llmModSensitivity}
                    onChange={(e) => update(['moderation', 'llmModSensitivity'], e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
            </RevealSection>

            {[
              { key: 'welcome', title: 'Welcome messages', placeholder: 'Welcome to {server}, {user}!' },
              { key: 'leave', title: 'Leave messages', placeholder: '{user} has left {server}.' },
            ].map(({ key, title, placeholder }) => (
              <RevealSection key={key}>
                <h2>{title}</h2>
                <div className="home-switch-row" style={{ marginBottom: '1rem' }}>
                  <input
                    className="home-switch"
                    type="checkbox"
                    role="switch"
                    id={`${key}-enabled`}
                    checked={config[key].enabled}
                    onChange={(e) => update([key, 'enabled'], e.target.checked)}
                  />
                  <label htmlFor={`${key}-enabled`}>Enabled</label>
                </div>
                {config[key].enabled && (
                  <>
                    <div className="home-field">
                      <label htmlFor={`${key}-channel`}>Channel</label>
                      <ChannelSelect
                        id={`${key}-channel`}
                        channels={channels}
                        value={config[key].channelId}
                        onChange={(e) => update([key, 'channelId'], e.target.value || null)}
                      />
                    </div>
                    <div className="home-field">
                      <label htmlFor={`${key}-message`}>
                        Message <span style={{ color: 'var(--home-ink-faint)' }}>(use {'{user}'} and {'{server}'})</span>
                      </label>
                      <textarea
                        id={`${key}-message`}
                        className="home-textarea"
                        rows={2}
                        maxLength={500}
                        placeholder={placeholder}
                        value={config[key].message}
                        onChange={(e) => update([key, 'message'], e.target.value)}
                      />
                    </div>
                  </>
                )}
              </RevealSection>
            ))}

            <RevealSection>
              <h2>Economy &amp; leveling</h2>
              <div className="home-switch-row" style={{ marginBottom: '0.6rem' }}>
                <input
                  className="home-switch"
                  type="checkbox"
                  role="switch"
                  id="economy-enabled"
                  checked={config.economy.enabled}
                  onChange={(e) => update(['economy', 'enabled'], e.target.checked)}
                />
                <label htmlFor="economy-enabled">Enable economy</label>
              </div>
              <div className="home-switch-row" style={{ marginBottom: '1rem' }}>
                <input
                  className="home-switch"
                  type="checkbox"
                  role="switch"
                  id="leveling-enabled"
                  checked={config.economy.levelingEnabled}
                  onChange={(e) => update(['economy', 'levelingEnabled'], e.target.checked)}
                />
                <label htmlFor="leveling-enabled">Enable leveling</label>
              </div>
              <div className="home-field" style={{ maxWidth: 220 }}>
                <label htmlFor="currency-name">Currency name</label>
                <input
                  id="currency-name"
                  type="text"
                  className="home-input"
                  maxLength={30}
                  required
                  value={config.economy.currencyName}
                  onChange={(e) => update(['economy', 'currencyName'], e.target.value)}
                />
              </div>
              {!config.economy.currencyName.trim() && (
                <p className="home-field-hint">Can&rsquo;t be blank. Try &ldquo;Coins&rdquo; or &ldquo;Credits&rdquo;.</p>
              )}
            </RevealSection>

            {error && <div className="home-alert home-alert-error" role="alert">{error}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="home-btn home-btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
                <span className="home-icon-chip" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
              {savedAt && !saving && <span style={{ color: '#7fe3ac' }}>Saved ✓</span>}
            </div>

            <p className="home-field-hint" style={{ marginTop: '2rem' }}>
              Note: these settings are saved, but the bot doesn&rsquo;t read them yet. That wiring is a
              follow-up. This screen is safe to explore in the meantime.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
