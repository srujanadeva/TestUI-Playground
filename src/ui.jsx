// ─── Shared UI ────────────────────────────────────────────────────────────────
// Small building blocks used by every element page: section headers, output
// lines, and the URL parameter helper that makes timings deterministic for tests.

/**
 * Header row of an element section.
 * @param num Section number shown in the badge ("D6", "07", …).
 * @param locator Hint for testers: the attribute or role to locate this section's elements by.
 */
export function SectionHeader({ num, title, locator }) {
  return (
    <div className="section-header">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="locator-badge">{locator}</span>
    </div>
  )
}

/** The status line under a section, which tests read to check what happened. */
export function Output({ id, children }) {
  return <p id={id} className="output">{children}</p>
}

/**
 * Reads `?<name>=<n>` from the page URL, clamped to [min, max].
 * Used for fixed delays and timers so tests can run deterministically.
 * @param name Query parameter name, e.g. "scrollDelay".
 * @param fallback Returned when the parameter is missing or not a number.
 * @returns The clamped number, or `fallback`.
 */
export function numberParam(name, fallback, min = 0, max = 10000) {
  const v = Number.parseInt(new URLSearchParams(window.location.search).get(name), 10)
  return Number.isFinite(v) ? Math.min(Math.max(v, min), max) : fallback
}
