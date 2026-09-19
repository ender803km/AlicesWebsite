import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchGuildConfig,
  saveGuildSettings,
  setGuildFeature,
  fetchGuildChannels,
  fetchGuildRoles,
} from '../lib/api'
import { useReveal } from '../hooks/useReveal'
import '../styles/system.css'

// This screen has no list of modules in it, and that is the point.
//
// The previous version hardcoded twelve module names and a config shape to
// match, neither of which existed in the bot — which is why nothing saved
// here ever reached it. Everything below is now generated from the feature
// manifest the bot publishes at boot: the cards, their switches, and the
// controls under them. Adding a module to the bot makes it appear here with
// no change to this file.

function Backdrop() {
  return (
    <>
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
    </>
  )
}

function ConfigSkeleton() {
  return (
    <div role="status" aria-label="Loading configuration">
      {Array.from({ length: 4 }, (_, i) => (
        <div className="home-skeleton" key={i} style={{ height: 116, borderRadius: 16, marginBottom: '1rem' }} />
      ))}
    </div>
  )
}

function RevealCard({ children, enabled }) {
  const [ref, visible] = useReveal({ threshold: 0.15 })
  return (
    <section
      ref={ref}
      data-enabled={enabled ? 'true' : 'false'}
      className={`home-feature-card home-reveal ${visible ? 'is-visible' : ''}`}
    >
      {children}
    </section>
  )
}

// The switch position is the state, but only if you can read a switch. A word
// next to it is unambiguous at a glance, survives a colourblind reader, and
// gives the row something to say when it is skimmed rather than studied.
// aria-hidden because role="switch" already announces its own state — this is
// the visual half of the same information, not a second announcement.
function SwitchState({ on, children }) {
  return (
    <span className="home-switch-state">
      <span className="home-switch-state-text" data-on={on ? 'true' : 'false'} aria-hidden="true">
        {on ? 'On' : 'Off'}
      </span>
      {children}
    </span>
  )
}

// ─── One control, chosen by the type the bot declared ────────────────────────

function SettingField({ id, type, value, onChange, channels, roles }) {
  if (type === 'boolean') {
    return (
      <input
        className="home-switch"
        type="checkbox"
        role="switch"
        id={id}
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
      />
    )
  }

  if (type === 'numeric') {
    return (
      <input
        id={id}
        type="number"
        className="home-input"
        style={{ maxWidth: 200 }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    )
  }

  if (type === 'channel' || type === 'role') {
    const options = type === 'channel' ? channels : roles
    const prefix = type === 'channel' ? '#' : '@'
    return (
      <select
        id={id}
        className="home-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">None</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {prefix}
            {o.name}
          </option>
        ))}
        {/* A saved ID whose channel or role has since been deleted would
            otherwise silently reset itself to None the next time anyone
            saved this page. */}
        {value && !options.some((o) => o.id === value) && (
          <option value={value}>Unknown ({value})</option>
        )}
      </select>
    )
  }

  if (type === 'multiChannel') {
    const selected = new Set(Array.isArray(value) ? value : [])
    return (
      <div className="home-checklist" id={id}>
        {channels.length === 0 && <p className="home-field-hint" style={{ margin: '0.4rem' }}>No channels to choose from.</p>}
        {channels.map((c) => (
          <label className="home-checklist-row" key={c.id}>
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={(e) => {
                const next = new Set(selected)
                if (e.target.checked) next.add(c.id)
                else next.delete(c.id)
                onChange([...next])
              }}
            />
            #{c.name}
          </label>
        ))}
      </div>
    )
  }

  // The bot published a control this page has no renderer for. Say so rather
  // than dropping it silently — a missing setting is much harder to notice
  // than an unfamiliar one.
  return (
    <p className="home-field-hint">
      This setting is a type this page can&rsquo;t edit yet ({type}). Use <code className="home-code">/setup</code> in Discord.
    </p>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GuildConfig() {
  const { guildId } = useParams()
  const { user, guilds, loading: authLoading } = useAuth()

  const [view, setView] = useState(null)
  const [channels, setChannels] = useState([])
  const [roles, setRoles] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [busyFeature, setBusyFeature] = useState(null)
  const [pendingDisable, setPendingDisable] = useState(null)
  const [notice, setNotice] = useState('')

  const guild = guilds.find((g) => g.id === guildId)

  const load = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const [configRes, channelsRes, rolesRes] = await Promise.all([
        fetchGuildConfig(guildId),
        fetchGuildChannels(guildId).catch(() => ({ channels: [] })),
        fetchGuildRoles(guildId).catch(() => ({ roles: [] })),
      ])
      setView(configRes)
      setChannels(channelsRes.channels)
      setRoles(rolesRes.roles)
      setDraft({})
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [guildId])

  useEffect(() => {
    if (guild) load()
  }, [guild, load])

  // Every field's saved value, flattened out of the per-feature response.
  // Flat on purpose: a few fields appear under more than one module (the mod
  // log channel belongs to both AutoMod and Channels), and keying state by
  // field means both controls show the same value and move together, rather
  // than one silently overwriting the other on save.
  const savedValues = useMemo(() => {
    const out = {}
    for (const feature of view?.features || []) {
      for (const setting of feature.settings) Object.assign(out, setting.values)
    }
    return out
  }, [view])

  // Which modules each field shows up under, so a shared one can say so.
  const fieldOwners = useMemo(() => {
    const out = {}
    for (const feature of view?.features || []) {
      for (const setting of feature.settings) {
        for (const field of setting.fields) {
          out[field] = out[field] || []
          if (!out[field].includes(feature.label)) out[field].push(feature.label)
        }
      }
    }
    return out
  }, [view])

  const enabledByKey = useMemo(() => {
    const out = {}
    for (const feature of view?.features || []) out[feature.key] = feature.enabled
    return out
  }, [view])

  const dirtyFields = Object.keys(draft)

  function valueOf(field) {
    return field in draft ? draft[field] : savedValues[field] ?? null
  }

  function setField(field, value) {
    setSavedAt(null)
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setDraft((prev) => {
      const next = { ...prev }
      // Editing a value back to what is already saved stops counting as a
      // change, so the save bar disappears rather than offering a no-op.
      if (JSON.stringify(value) === JSON.stringify(savedValues[field] ?? null)) delete next[field]
      else next[field] = value
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setFieldErrors({})
    try {
      const res = await saveGuildSettings(guildId, draft)
      setView(res)
      setDraft({})
      setSavedAt(Date.now())
    } catch (err) {
      setError(err.message)
      if (Array.isArray(err.details)) {
        setFieldErrors(Object.fromEntries(err.details.map((d) => [d.field, d.reason])))
      }
    } finally {
      setSaving(false)
    }
  }

  async function applyToggle(key, enabled) {
    setBusyFeature(key)
    setError('')
    setNotice('')
    setPendingDisable(null)
    try {
      const res = await setGuildFeature(guildId, key, enabled)
      setView(res.config)
      if (res.cascaded?.length) {
        setNotice(`Also turned off: ${res.cascaded.map((f) => f.label).join(', ')}.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyFeature(null)
    }
  }

  function requestToggle(feature, next) {
    if (!next) {
      // Anything that hard-requires this and is currently on will go off too.
      // Better to say which before the click than to explain it afterwards.
      const casualties = (view.features || []).filter(
        (f) => f.enabled && !f.alwaysOn && f.requires.includes(feature.key),
      )
      if (casualties.length) {
        setPendingDisable({ key: feature.key, casualties })
        return
      }
    }
    applyToggle(feature.key, next)
  }

  if (authLoading) {
    return (
      <main id="main-content" className="home-page home-content">
        <Backdrop />
        <div className="home-wrap" style={{ maxWidth: 820 }}>
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
            <p>You don&rsquo;t manage a server with that ID, or A.L.I.C.E isn&rsquo;t in it.</p>
            <Link to="/dashboard" className="home-btn home-btn-secondary">Back to dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="home-page home-content">
      <Backdrop />
      <div className="home-wrap" style={{ maxWidth: 820 }}>
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

        {status === 'error' && <div className="home-alert home-alert-error" role="alert">{error}</div>}

        {status === 'ready' && view && (
          <>
            {!view.configured && (
              <div className="home-alert home-alert-info" style={{ marginBottom: '1.5rem' }}>
                Nothing has been configured for this server yet, so everything below is at its
                default. Saving anything here creates its settings for the first time.
              </div>
            )}

            {notice && (
              <div className="home-alert home-alert-info" role="status" style={{ marginBottom: '1.5rem' }}>
                {notice}
              </div>
            )}

            {error && status === 'ready' && (
              <div className="home-alert home-alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            {view.features.map((feature) => {
              const missing = feature.requires.filter((key) => enabledByKey[key] === false)
              const blocked = !feature.enabled && missing.length > 0
              const confirming = pendingDisable?.key === feature.key

              return (
                <RevealCard key={feature.key} enabled={feature.enabled}>
                  <div className="home-feature-head">
                    <div>
                      <h3>
                        {feature.label}
                        {feature.alwaysOn && <span className="home-badge">Always on</span>}
                      </h3>
                      {feature.description && <p>{feature.description}</p>}
                    </div>

                    {!feature.alwaysOn && (
                      <SwitchState on={feature.enabled}>
                        <input
                          className="home-switch"
                          type="checkbox"
                          role="switch"
                          aria-label={`Enable ${feature.label}`}
                          checked={feature.enabled}
                          disabled={busyFeature === feature.key || blocked}
                          onChange={(e) => requestToggle(feature, e.target.checked)}
                        />
                      </SwitchState>
                    )}
                  </div>

                  {blocked && (
                    <p className="home-feature-note">
                      Needs{' '}
                      {missing
                        .map((key) => view.features.find((f) => f.key === key)?.label || key)
                        .join(' and ')}{' '}
                      turned on first.
                    </p>
                  )}


                  {confirming && (
                    <div className="home-confirm" role="alertdialog" aria-label="Confirm turning this off">
                      <p>
                        Turning off <strong>{feature.label}</strong> also turns off{' '}
                        <strong>{pendingDisable.casualties.map((f) => f.label).join(', ')}</strong>, which
                        can&rsquo;t run without it.
                      </p>
                      <div className="home-confirm-actions">
                        <button
                          type="button"
                          className="home-btn home-btn-secondary home-btn-sm"
                          onClick={() => applyToggle(feature.key, false)}
                        >
                          Turn off anyway
                        </button>
                        <button
                          type="button"
                          className="home-btn home-btn-quiet home-btn-sm"
                          onClick={() => setPendingDisable(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {feature.settings.length > 0 && (
                    <div className="home-feature-body">
                      {feature.settings.map((setting) =>
                        setting.fields.map((field, i) => {
                          const id = `set-${feature.key}-${field}`
                          const shared = (fieldOwners[field] || []).filter((l) => l !== feature.label)
                          const label = setting.fields.length > 1 ? `${setting.label} — ${field}` : setting.label

                          // A boolean reads as a row with the switch on the
                          // right; everything else stacks label above control.
                          if (setting.type === 'boolean') {
                            return (
                              <div key={field}>
                                <div className="home-switch-row" style={{ padding: '0.4rem 0' }}>
                                  <label htmlFor={id}>{label}</label>
                                  <SwitchState on={valueOf(field) === true}>
                                    <SettingField
                                      id={id}
                                      type={setting.type}
                                      value={valueOf(field)}
                                      onChange={(v) => setField(field, v)}
                                      channels={channels}
                                      roles={roles}
                                    />
                                  </SwitchState>
                                </div>
                                {i === 0 && setting.description && (
                                  <p className="home-field-hint">{setting.description}</p>
                                )}
                                {shared.length > 0 && (
                                  <p className="home-field-hint">Shared with {shared.join(', ')}.</p>
                                )}
                                {fieldErrors[field] && (
                                  <p className="home-field-error">{fieldErrors[field]}</p>
                                )}
                              </div>
                            )
                          }

                          return (
                            <div className="home-field" key={field}>
                              <label htmlFor={id}>{label}</label>
                              <SettingField
                                id={id}
                                type={setting.type}
                                value={valueOf(field)}
                                onChange={(v) => setField(field, v)}
                                channels={channels}
                                roles={roles}
                              />
                              {i === 0 && setting.description && (
                                <p className="home-field-hint">{setting.description}</p>
                              )}
                              {shared.length > 0 && (
                                <p className="home-field-hint">Shared with {shared.join(', ')}.</p>
                              )}
                              {fieldErrors[field] && <p className="home-field-error">{fieldErrors[field]}</p>}
                            </div>
                          )
                        }),
                      )}
                    </div>
                  )}
                </RevealCard>
              )
            })}

            {dirtyFields.length > 0 && (
              <div className="home-savebar">
                <span className="home-savebar-count">
                  {dirtyFields.length} unsaved {dirtyFields.length === 1 ? 'change' : 'changes'}
                </span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="home-btn home-btn-quiet home-btn-sm"
                    onClick={() => setDraft({})}
                    disabled={saving}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="home-btn home-btn-primary home-btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}

            {savedAt && dirtyFields.length === 0 && (
              <p style={{ color: '#7fe3ac', marginTop: '1.5rem' }}>
                Saved ✓ — A.L.I.C.E picks this up straight away.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
