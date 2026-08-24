// Small presentational building blocks used by the Commands page so the
// page itself reads as content, not markup.

export function CommandModule({ id, title, description, children }) {
  return (
    <section id={id} className="command-module">
      <h2 className="h3 command-module-header">{title}</h2>
      <p className="command-module-desc">{description}</p>
      {children}
    </section>
  )
}

export function CommandList({ children }) {
  return <div className="list-group command-list-group">{children}</div>
}

export function CommandEntry({ name, badges, children }) {
  return (
    <div className="list-group-item">
      <div className="command-entry">
        <code className="cmd-name">{name}</code>
        {badges?.map((badge) => (
          <span className={`badge ${badge.className}`} key={badge.label}>
            {badge.label}
          </span>
        ))}
      </div>
      {children ? <p className="command-desc">{children}</p> : null}
    </div>
  )
}

export function SubgroupTitle({ children }) {
  return <h3 className="command-subgroup-title">{children}</h3>
}

export function ChipGrid({ items }) {
  return (
    <div className="command-chip-grid">
      {items.map((item) => (
        <code className="cmd-chip" key={item}>{item}</code>
      ))}
    </div>
  )
}

export const badgeStyles = {
  mods: { className: 'text-bg-secondary', label: 'Mods only' },
  admin: { className: 'text-bg-danger', label: 'Admin' },
  contextMenu: { className: 'text-bg-dark', label: 'Right-click a message' },
  manageExpressions: { className: 'text-bg-secondary', label: 'Manage Expressions' },
}
