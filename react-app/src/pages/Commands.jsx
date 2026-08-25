import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Coins,
  MagnifyingGlass,
  ShieldCheck,
  Sword,
  UsersThree,
  Wrench,
  X,
} from '@phosphor-icons/react'

import { CATEGORIES, ALL_COMMANDS, COMMAND_COUNT } from '../data/commands'
import '../styles/system.css'
import '../styles/commands.css'

const CATEGORY_ICONS = {
  moderation: ShieldCheck,
  economy: Coins,
  adventure: Sword,
  community: UsersThree,
  utilities: Wrench,
}

const ACCESS_LABEL = {
  mods: 'Mods only',
  admin: 'Admin',
  manageExpressions: 'Manage Expressions',
}

const ACCESS_CLASS = {
  mods: 'home-badge-mods',
  admin: 'home-badge-admin',
  manageExpressions: 'home-badge',
}

const KIND_LABEL = {
  prefix: 'Prefix command',
  context: 'Right-click a message',
  both: '? alias',
}

const FILTERS = [
  { id: 'all', label: 'Everything' },
  { id: 'everyone', label: 'Anyone can run' },
  { id: 'mods', label: 'Mods only' },
  { id: 'admin', label: 'Admin only' },
]

const MODULE_COMMAND_COUNT = (module) =>
  module.groups.reduce((total, g) => total + g.commands.length, 0)

function matchesFilter(command, filter) {
  if (filter === 'all') return true
  if (filter === 'everyone') return command.access === 'everyone'
  if (filter === 'mods') return command.access === 'mods'
  if (filter === 'admin') return command.access === 'admin'
  return true
}

function matchesQuery(command, query) {
  if (!query) return true
  const haystack = `${command.name} ${command.args || ''} ${command.desc} ${command.moduleName}`
  return haystack.toLowerCase().includes(query)
}

/* Wraps the matched run of text so the eye lands on why a row matched.
   Splits on the raw query rather than a regex so a user typing "["
   or "/" does not blow up the page. */
function Highlight({ text, query }) {
  if (!query) return text
  const lower = text.toLowerCase()
  const at = lower.indexOf(query)
  if (at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className="home-cmd-mark">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  )
}

/* Required arguments read slightly brighter than optional ones, so the
   difference between <user> and [user] is visible without reading. */
function Args({ args }) {
  if (!args) return null
  const parts = args.split(/(\s+)/)
  return (
    <span className="home-cmd-args">
      {parts.map((part, i) =>
        part.startsWith('<') ? (
          <span className="is-required" key={i}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

function CommandRow({ command, query, showOrigin = false }) {
  const accessLabel = ACCESS_LABEL[command.access]
  const kindLabel = KIND_LABEL[command.kind]

  return (
    <div className="home-cmd-row">
      <div className="home-cmd-signature">
        <code className="home-cmd-name">
          <Highlight text={command.name} query={query} />
        </code>
        <Args args={command.args} />
      </div>

      {(accessLabel || kindLabel) && (
        <div className="home-cmd-badges">
          {kindLabel && <span className="home-badge">{kindLabel}</span>}
          {accessLabel && (
            <span className={`home-badge ${ACCESS_CLASS[command.access]}`}>{accessLabel}</span>
          )}
        </div>
      )}

      <p className="home-cmd-desc">
        <Highlight text={command.desc} query={query} />
      </p>

      {showOrigin && (
        <p className="home-cmd-hit-origin">
          <a href={`#${command.moduleId}`}>{command.moduleName}</a>
          {command.groupTitle ? ` / ${command.groupTitle}` : ''}
        </p>
      )}
    </div>
  )
}

/* Tracks which module is in view so the rail can show position.
   IntersectionObserver is the trigger rather than a scroll listener, so
   this costs nothing per frame, but the decision is made by measuring
   the module tops against a line near the top of the viewport.
   Comparing intersectionRatio instead looks reasonable and is wrong: a
   ratio is a fraction of each element's own height, so a 3-command
   module fills the band and scores near 1.0 while the 44-command
   Economy module scores 0.1 with the whole viewport inside it. The rail
   then points at the short section above. */
function useActiveModule(moduleIds, enabled) {
  const [active, setActive] = useState(moduleIds[0])

  useEffect(() => {
    if (!enabled) return undefined

    const pick = () => {
      const line = window.innerHeight * 0.3
      let current = moduleIds[0]
      for (const id of moduleIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }

    const observer = new IntersectionObserver(pick, {
      rootMargin: '0px 0px -60% 0px',
      threshold: [0, 0.02, 0.5, 1],
    })
    moduleIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    pick()
    return () => observer.disconnect()
  }, [moduleIds, enabled])

  return active
}

export default function Commands() {
  const [rawQuery, setRawQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const inputRef = useRef(null)

  const query = rawQuery.trim().toLowerCase()
  const searching = query.length > 0 || filter !== 'all'

  const moduleIds = useMemo(
    () => CATEGORIES.flatMap((c) => c.modules.map((m) => m.id)),
    [],
  )
  const activeModule = useActiveModule(moduleIds, !searching)

  // "/" jumps to search from anywhere on the page, the way it does in
  // most docs. Ignored while the user is already typing in a field.
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') inputRef.current?.blur()
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hits = useMemo(
    () => ALL_COMMANDS.filter((c) => matchesFilter(c, filter) && matchesQuery(c, query)),
    [query, filter],
  )

  const clear = useCallback(() => {
    setRawQuery('')
    setFilter('all')
    inputRef.current?.focus()
  }, [])

  return (
    <main id="main-content" className="home-page home-cmd-page">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />

      <div className="home-wrap">
        <header className="home-cmd-masthead">
          <h1>Commands</h1>
          <p>
            All {COMMAND_COUNT} of them, with their arguments and the permission each one
            needs. Everything is a slash command unless its badge says otherwise.
          </p>
        </header>

        {/* Category chips, shown in place of the rail on narrow screens. */}
        <nav className="home-cmd-rail-mobile" aria-label="Jump to a module">
          <ul>
            {CATEGORIES.flatMap((category) =>
              category.modules.map((module) => (
                <li key={module.id}>
                  <a
                    href={`#${module.id}`}
                    className={!searching && activeModule === module.id ? 'is-current' : ''}
                  >
                    {module.name}
                  </a>
                </li>
              )),
            )}
          </ul>
        </nav>

        <div className="home-cmd-layout">
          <nav className="home-cmd-rail" aria-label="Command modules">
            {CATEGORIES.map((category) => (
              <div className="home-cmd-rail-group" key={category.id}>
                <h2>{category.name}</h2>
                <ul>
                  {category.modules.map((module) => (
                    <li key={module.id}>
                      <a
                        href={`#${module.id}`}
                        className={!searching && activeModule === module.id ? 'is-current' : ''}
                        aria-current={!searching && activeModule === module.id ? 'true' : undefined}
                      >
                        {module.name}
                        <span className="home-cmd-rail-count">
                          {MODULE_COMMAND_COUNT(module) || '-'}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div>
            <div className="home-cmd-tools">
              <div className={`home-cmd-search ${rawQuery ? 'has-value' : ''}`}>
                <MagnifyingGlass size={18} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  className="home-input"
                  placeholder="Search commands, arguments or descriptions"
                  value={rawQuery}
                  onChange={(e) => setRawQuery(e.target.value)}
                  aria-label="Search commands"
                />
                <kbd className="home-cmd-kbd">/</kbd>
                {rawQuery && (
                  <button type="button" className="home-cmd-clear" onClick={clear} aria-label="Clear search">
                    <X size={14} weight="bold" />
                  </button>
                )}
              </div>

              <div className="home-cmd-filters">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="home-cmd-filter"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
                {searching && (
                  <span className="home-cmd-result-count" role="status">
                    {hits.length} of {COMMAND_COUNT}
                  </span>
                )}
              </div>
            </div>

            {searching ? (
              hits.length === 0 ? (
                <div className="home-empty">
                  <h3>No commands match that</h3>
                  <p>
                    Nothing here is called “{rawQuery}”. Try a shorter word, or search a
                    description instead of a command name.
                  </p>
                  <button type="button" className="home-btn home-btn-secondary" onClick={clear}>
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="home-cmd-list">
                  {hits.map((command) => (
                    <CommandRow
                      key={`${command.moduleId}-${command.name}-${command.args || ''}`}
                      command={command}
                      query={query}
                      showOrigin
                    />
                  ))}
                </div>
              )
            ) : (
              CATEGORIES.flatMap((category) =>
                category.modules.map((module) => {
                  const Icon = CATEGORY_ICONS[category.id]
                  return (
                    <section className="home-cmd-module" id={module.id} key={module.id}>
                      <div className="home-cmd-module-head">
                        <h2>
                          <span className="home-cmd-module-icon" aria-hidden="true">
                            <Icon size={16} weight="duotone" />
                          </span>
                          {module.name}
                        </h2>
                        <p className="home-cmd-module-desc">{module.description}</p>
                      </div>

                      {module.groups.map((group, gi) => (
                        <div className="home-cmd-group" key={group.title || `g${gi}`}>
                          {group.title && <h3 className="home-cmd-group-title">{group.title}</h3>}
                          {group.note && <p className="home-cmd-group-note">{group.note}</p>}
                          <div className="home-cmd-list">
                            {group.commands.map((command) => (
                              <CommandRow
                                key={`${command.name}-${command.args || ''}`}
                                command={{ ...command, moduleId: module.id, moduleName: module.name }}
                                query=""
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  )
                }),
              )
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
