// ─── Shared UI ────────────────────────────────────────────────────────────────
// Small building blocks used by every element page: section headers and their
// "Try this" tips, output lines, the card flash used by sidebar navigation, and
// the URL parameter helper that makes timings deterministic for tests.
import { useState, useEffect, useRef, useId } from 'react'
import { useLang } from './i18n.jsx'

/**
 * Header row of an element section.
 * @param num Section number shown in the badge ("D6", "07", …).
 * @param locator Hint for testers: the attribute or role to locate this section's elements by.
 * @param tip Optional key prefix: `<tip>Steps` (array) and `<tip>Check` hold the ⓘ box's text.
 */
export function SectionHeader({ num, title, locator, tip }) {
  return (
    <div className="section-header">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="locator-badge">{locator}</span>
      {tip && <InfoTip tip={tip} />}
    </div>
  )
}

/**
 * The ⓘ button and its "Try this" box. Opens on mouse hover or on click / tap /
 * Enter; a click pins it open until a click elsewhere or Escape. The box is only
 * in the DOM while open, so it can't sit over elements a test is clicking.
 */
function InfoTip({ tip }) {
  const { t, tArr } = useLang()
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned]   = useState(false)
  const wrapRef = useRef(null)
  const boxId   = useId()
  const open    = hovered || pinned

  useEffect(() => {
    if (!pinned) return
    const outside = e => { if (!wrapRef.current?.contains(e.target)) setPinned(false) }
    const escape  = e => { if (e.key === 'Escape') { setPinned(false); setHovered(false) } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [pinned])

  // Hover only for a real mouse: a tap fires pointerenter just before click,
  // which would open the box and then let the click toggle it straight shut.
  const enter = e => { if (e.pointerType === 'mouse') setHovered(true) }

  return (
    <span className="info-tip" ref={wrapRef}
      onPointerEnter={enter} onPointerLeave={() => setHovered(false)}>
      <button type="button" className="info-tip-btn" aria-label={t('tipButtonLabel')}
        aria-expanded={open} aria-controls={open ? boxId : undefined}
        onClick={() => setPinned(p => !p)}>i</button>
      {open && (
        <div id={boxId} className="info-tip-box" role="note">
          <strong className="info-tip-title">{t('tipTryThis')}</strong>
          <ol>{tArr(`${tip}Steps`).map((s, i) => <li key={i}>{withCode(s)}</li>)}</ol>
          <p className="info-tip-check"><strong>{t('tipTestChecks')}</strong> {withCode(t(`${tip}Check`))}</p>
        </div>
      )}
    </span>
  )
}

// Selectors, attributes and calls inside tip text: [attr="x"], #id, .class, data-* /
// aria-*, ?param=, and getByRole(...). The lookbehind keeps "example.com" whole.
const CODE_TOKEN = /(\[[^\]]+\](?:="[^"]*")?|(?<![\w])#[\w-]+|(?<![\w])\.[a-z][\w-]+|\b(?:data|aria)-[\w-]+(?:="[^"]*")?|\?[\w]+=[\w<>]*|\b\w+\([^)]*\))/

/**
 * Wraps the code-like parts of a tip in <code dir="ltr">. The dir attribute isolates
 * them, so in Arabic text their brackets and quotes aren't reordered by the bidi algorithm.
 */
function withCode(text) {
  return text.split(CODE_TOKEN).map((part, i) =>
    i % 2 ? <code key={i} dir="ltr" className="info-tip-code">{part}</code> : part)
}

const flashTimers = new Map() // section id -> timeout that ends its flash

/**
 * Briefly rings a section card so it is clear which one the sidebar jumped to,
 * even when it shares a grid row with others. Uses a data attribute rather than
 * a class so a React re-render of className can't cut the flash short.
 * @param id The section element's id.
 */
export function flashSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  clearTimeout(flashTimers.get(id))
  el.removeAttribute('data-flash')
  // Reading layout here restarts the CSS animation when the card is already flashing.
  void el.offsetWidth
  el.setAttribute('data-flash', '')
  flashTimers.set(id, setTimeout(() => el.removeAttribute('data-flash'), 1600))
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
