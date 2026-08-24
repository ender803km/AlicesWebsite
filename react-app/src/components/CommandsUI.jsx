// Small presentational building blocks used by the Commands page so the
// page itself reads as content, not markup.

export function CommandModule({ id, title, description, children }) {
  return (
    <section id={id} className="home-cmd-module">
      <h2>{title}</h2>
      <p className="home-cmd-module-desc">{description}</p>
      {children}
    </section>
  )
}

export function CommandList({ children }) {
  return <div className="home-cmd-list">{children}</div>
}

export function CommandEntry({ name, badges, children }) {
  return (
    <div className="home-cmd-row">
      <div className="home-cmd-entry">
        <code className="home-cmd-name">{name}</code>
        {badges?.map((badge) => (
          <span className={`home-badge ${badge.className}`} key={badge.label}>
            {badge.label}
          </span>
        ))}
      </div>
      {children ? <p className="home-cmd-desc">{children}</p> : null}
    </div>
  )
}

export function SubgroupTitle({ children }) {
  return <h3 className="home-cmd-subgroup">{children}</h3>
}

export function ChipGrid({ items }) {
  return (
    <div className="home-cmd-chip-grid">
      {items.map((item) => (
        <code className="home-cmd-chip" key={item}>{item}</code>
      ))}
    </div>
  )
}

export const badgeStyles = {
  mods: { className: 'home-badge-mods', label: 'Mods only' },
  admin: { className: 'home-badge-admin', label: 'Admin' },
  contextMenu: { className: 'home-badge-context', label: 'Right-click a message' },
  manageExpressions: { className: 'home-badge-expressions', label: 'Manage Expressions' },
}
