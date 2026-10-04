// ─── Shared UI ────────────────────────────────────────────────────────────────
export function SectionHeader({ num, title, locator }) {
  return (
    <div className="section-header">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="locator-badge">{locator}</span>
    </div>
  )
}

export function Output({ id, children }) {
  return <p id={id} className="output">{children}</p>
}
