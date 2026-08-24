import { useCallback, useEffect, useState } from 'react'
import { Navigate, Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchGuildConfig, saveGuildConfig, fetchGuildChannels } from '../lib/api'

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
    <select id={id} className="form-select bg-dark text-light border-secondary" value={value || ''} onChange={onChange}>
      <option value="">— None —</option>
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
      <main className="page-section text-center">
        <div className="container"><p className="lead">Loading…</p></div>
      </main>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!guild) {
    return (
      <main className="page-section">
        <div className="container" style={{ maxWidth: 700 }}>
          <p className="lead">You don't manage a server with that ID, or A.L.I.C.E isn't in it.</p>
          <Link to="/dashboard" className="btn btn-outline-light">Back to dashboard</Link>
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
    <main className="page-section">
      <div className="container" style={{ maxWidth: 800 }} data-aos="fade-up">
        <div className="d-flex align-items-center gap-3 mb-2">
          {guild.icon ? (
            <img src={guild.icon} alt="" width={40} height={40} style={{ borderRadius: '50%' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1d2f47' }} aria-hidden="true" />
          )}
          <h1 className="h3 fw-bold mb-0">{guild.name}</h1>
        </div>
        <p className="text-body-secondary mb-4">
          <Link to="/dashboard">← Back to your servers</Link>
        </p>

        {status === 'loading' && <p className="lead">Loading configuration…</p>}

        {status === 'error' && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {status === 'ready' && config && (
          <form onSubmit={handleSave}>
            <section className="mb-5">
              <h2 className="h5 mb-3">Command modules</h2>
              <div className="row row-cols-2 row-cols-md-3 g-2">
                {MODULES.map((mod) => (
                  <div className="col" key={mod.key}>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`mod-${mod.key}`}
                        checked={config.modules[mod.key]}
                        onChange={(e) => update(['modules', mod.key], e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`mod-${mod.key}`}>{mod.label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-5">
              <h2 className="h5 mb-3">Command prefix</h2>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                style={{ maxWidth: 120 }}
                maxLength={5}
                value={config.prefix}
                onChange={(e) => update(['prefix'], e.target.value)}
              />
            </section>

            <section className="mb-5">
              <h2 className="h5 mb-3">Moderation</h2>
              <div className="mb-3">
                <label className="form-label" htmlFor="mod-log-channel">Mod log channel</label>
                <ChannelSelect
                  id="mod-log-channel"
                  channels={channels}
                  value={config.moderation.logChannelId}
                  onChange={(e) => update(['moderation', 'logChannelId'], e.target.value || null)}
                />
              </div>
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="automod-enabled"
                  checked={config.moderation.autoModEnabled}
                  onChange={(e) => update(['moderation', 'autoModEnabled'], e.target.checked)}
                />
                <label className="form-check-label" htmlFor="automod-enabled">Enable auto-mod</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="llmmod-enabled"
                  checked={config.moderation.llmModEnabled}
                  onChange={(e) => update(['moderation', 'llmModEnabled'], e.target.checked)}
                />
                <label className="form-check-label" htmlFor="llmmod-enabled">Enable AI moderation</label>
              </div>
              {config.moderation.llmModEnabled && (
                <div style={{ maxWidth: 220 }}>
                  <label className="form-label" htmlFor="llmmod-sensitivity">AI moderation sensitivity</label>
                  <select
                    id="llmmod-sensitivity"
                    className="form-select bg-dark text-light border-secondary"
                    value={config.moderation.llmModSensitivity}
                    onChange={(e) => update(['moderation', 'llmModSensitivity'], e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
            </section>

            {[
              { key: 'welcome', title: 'Welcome messages', placeholder: 'Welcome to {server}, {user}!' },
              { key: 'leave', title: 'Leave messages', placeholder: '{user} has left {server}.' },
            ].map(({ key, title, placeholder }) => (
              <section className="mb-5" key={key}>
                <h2 className="h5 mb-3">{title}</h2>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={`${key}-enabled`}
                    checked={config[key].enabled}
                    onChange={(e) => update([key, 'enabled'], e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`${key}-enabled`}>Enabled</label>
                </div>
                {config[key].enabled && (
                  <>
                    <div className="mb-3">
                      <label className="form-label" htmlFor={`${key}-channel`}>Channel</label>
                      <ChannelSelect
                        id={`${key}-channel`}
                        channels={channels}
                        value={config[key].channelId}
                        onChange={(e) => update([key, 'channelId'], e.target.value || null)}
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor={`${key}-message`}>
                        Message <span className="text-body-secondary">(use {'{user}'} and {'{server}'})</span>
                      </label>
                      <textarea
                        id={`${key}-message`}
                        className="form-control bg-dark text-light border-secondary"
                        rows={2}
                        maxLength={500}
                        placeholder={placeholder}
                        value={config[key].message}
                        onChange={(e) => update([key, 'message'], e.target.value)}
                      />
                    </div>
                  </>
                )}
              </section>
            ))}

            <section className="mb-5">
              <h2 className="h5 mb-3">Economy &amp; leveling</h2>
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="economy-enabled"
                  checked={config.economy.enabled}
                  onChange={(e) => update(['economy', 'enabled'], e.target.checked)}
                />
                <label className="form-check-label" htmlFor="economy-enabled">Enable economy</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="leveling-enabled"
                  checked={config.economy.levelingEnabled}
                  onChange={(e) => update(['economy', 'levelingEnabled'], e.target.checked)}
                />
                <label className="form-check-label" htmlFor="leveling-enabled">Enable leveling</label>
              </div>
              <div style={{ maxWidth: 220 }}>
                <label className="form-label" htmlFor="currency-name">Currency name</label>
                <input
                  id="currency-name"
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  maxLength={30}
                  value={config.economy.currencyName}
                  onChange={(e) => update(['economy', 'currencyName'], e.target.value)}
                />
              </div>
            </section>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {savedAt && !saving && <span className="text-success">Saved ✓</span>}
            </div>

            <p className="text-body-secondary small mt-4">
              Note: these settings are saved, but the bot doesn't read them yet — that wiring is a
              follow-up. This screen is safe to explore in the meantime.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
