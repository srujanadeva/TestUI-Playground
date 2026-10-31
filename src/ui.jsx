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

// ?<name>=<n> from the URL, clamped to [min, max]; `fallback` when missing or invalid.
// Used for fixed delays and timers so tests can run deterministically.
export function numberParam(name, fallback, min = 0, max = 10000) {
  const v = Number.parseInt(new URLSearchParams(window.location.search).get(name), 10)
  return Number.isFinite(v) ? Math.min(Math.max(v, min), max) : fallback
}
