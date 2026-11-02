// Playground sections 13, 14, 15 and 28 (sidebar group "Events"): hover tooltips,
// focus / blur logging, drag-and-drop reordering and a signature pad.
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// ─── 13. Mouse Hover ─────────────────────────────────────────────────────────
const HOVER_CARDS = [
  { id: 'hover-info',    labelKey: 'hoverInfo',    tipKey: 'tipInfo',    color: '#3b82f6' },
  { id: 'hover-warn',    labelKey: 'hoverWarning', tipKey: 'tipWarning', color: '#f59e0b' },
  { id: 'hover-success', labelKey: 'hoverSuccess', tipKey: 'tipSuccess', color: '#10b981' },
  { id: 'hover-danger',  labelKey: 'hoverDanger',  tipKey: 'tipDanger',  color: '#ef4444' },
]

/** Cards whose tooltip only exists in the DOM while the mouse is over them. */
export function HoverSection() {
  const { t } = useLang()
  const [active, setActive] = useState(null)
  return (
    <section id="sec-hover" className="card">
      <SectionHeader num="13" title={t('sec13Title')} locator="data-testid" />
      <p className="desc">{t('sec13Desc')}</p>
      <div className="hover-cards">
        {HOVER_CARDS.map(c => (
          <div key={c.id} data-testid={c.id} className="hover-card"
            style={{ '--hc': c.color }}
            onMouseEnter={() => setActive(c.id)}
            onMouseLeave={() => setActive(null)}>
            <span className="hover-card-label">{t(c.labelKey)}</span>
            {active === c.id && (
              <div data-testid={`${c.id}-tooltip`} className="hover-tooltip">{t(c.tipKey)}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 14. Focus / Blur ────────────────────────────────────────────────────────
const FOCUS_FIELD_KEYS = ['focusUsername', 'focusEmail', 'focusComment']
const FOCUS_IDS        = ['username', 'email', 'comment']

/** Three inputs that log their focus and blur events (last 5) and highlight the focused one. */
export function FocusBlurSection() {
  const { t, tArr } = useLang()
  const focusFields = tArr('focusFields')
  const [events, setEvents] = useState([])
  const [active, setActive] = useState('')
  const log = (label, type) => {
    setEvents(e => [`${label} → ${type}`, ...e].slice(0, 5))
    setActive(type === 'focus' ? label : '')
  }
  return (
    <section id="sec-focus" className="card">
      <SectionHeader num="14" title={t('sec14Title')} locator="id" />
      <p className="desc">{t('sec14Desc')}</p>
      {FOCUS_IDS.map((id, i) => {
        const label = focusFields[i] ?? t(FOCUS_FIELD_KEYS[i])
        return (
          <div key={id} className="form-field">
            <label className="field-label" htmlFor={`focus-${id}`}>{label}</label>
            <input id={`focus-${id}`} type="text"
              placeholder={t('phFocusField', { field: label })}
              className={active === label ? 'input-focused' : ''}
              onFocus={() => log(label, 'focus')}
              onBlur={() => log(label, 'blur')} />
          </div>
        )
      })}
      {events.length > 0 && (
        <div id="focus-event-log" className="event-log">
          {events.map((e, i) => <div key={i} className="event-entry">{e}</div>)}
        </div>
      )}
    </section>
  )
}

// ─── 15. Drag & Drop ─────────────────────────────────────────────────────────
const DRAG_KEYS = [
  { id: 'drag-1', labelKey: 'dragAlpha',   color: '#6366f1' },
  { id: 'drag-2', labelKey: 'dragBeta',    color: '#ec4899' },
  { id: 'drag-3', labelKey: 'dragGamma',   color: '#10b981' },
  { id: 'drag-4', labelKey: 'dragDelta',   color: '#f59e0b' },
  { id: 'drag-5', labelKey: 'dragEpsilon', color: '#ef4444' },
]

/**
 * A list reordered with HTML5 drag and drop. Dropping an item on another moves it
 * into that item's position (the rest shift); data-drag-pos gives each item's position.
 */
export function DragDropSection() {
  const { t } = useLang()
  const [items, setItems]       = useState(DRAG_KEYS)
  const [dragging, setDragging] = useState(null)
  const [log, setLog]           = useState('')

  // Remove the dragged item, then insert it at the target's index.
  const onDrop = targetId => {
    if (!dragging || dragging === targetId) return
    const from = items.findIndex(i => i.id === dragging)
    const to   = items.findIndex(i => i.id === targetId)
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)
    setLog(t('dragMoved', { label: t(moved.labelKey), pos: to + 1 }))
    setDragging(null)
  }

  return (
    <section id="sec-dragdrop" className="card">
      <SectionHeader num="15" title={t('sec15Title')} locator="data-drag-id" />
      <p className="desc">{t('sec15Desc')}</p>
      <div className="drag-list">
        {items.map((item, idx) => (
          <div key={item.id} data-drag-id={item.id} data-drag-pos={idx + 1}
            className={`drag-item ${dragging === item.id ? 'dragging' : ''}`}
            draggable
            onDragStart={() => setDragging(item.id)}
            // preventDefault on dragover is what makes an element a valid drop target.
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(item.id)}
            style={{ borderLeftColor: item.color }}>
            <span className="drag-handle">⠿</span>
            <span className="drag-label">{t(item.labelKey)}</span>
            <span className="drag-pos">{idx + 1}</span>
          </div>
        ))}
      </div>
      {log && <Output id="drag-log">{log}</Output>}
    </section>
  )
}

// ─── 28. Signature Pad ───────────────────────────────────────────────────────
// A canvas has no DOM content to assert on, so the pad exposes data-empty and
// data-strokes. Draws with pointer events (mouse, touch or pen). Save rejects
// ink shorter than SIGNATURE_MIN_LENGTH canvas px, so a single click is not a
// signature.
const SIGNATURE_MIN_LENGTH = 60

/**
 * Draws one stroke as connected line segments; a single point (a click) becomes a dot.
 * @param points Canvas-pixel [x, y] pairs.
 */
function drawStroke(ctx, points) {
  ctx.beginPath()
  if (points.length === 1) {
    ctx.arc(points[0][0], points[0][1], 1.5, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.moveTo(points[0][0], points[0][1])
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y))
  ctx.stroke()
}

/** Total length of all strokes in canvas px (sum of the distances between consecutive points). */
function inkLength(strokes) {
  let total = 0
  strokes.forEach(s => {
    for (let i = 1; i < s.length; i++) total += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1])
  })
  return total
}

/** The signature pad described above, with Undo, Clear and Save (shows a PNG preview). */
export function SignatureSection() {
  const { t } = useLang()
  const canvasRef = useRef(null)
  // The stroke being drawn, kept in a ref so pointermove doesn't re-render on every point.
  const current   = useRef(null)
  const [strokes, setStrokes] = useState([])
  const [saved, setSaved]     = useState(null)
  const [error, setError]     = useState('')

  /** The canvas's 2D context with the pen style applied. */
  function context() {
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = ctx.fillStyle = '#1e293b'
    return ctx
  }

  // Redraw from state whenever strokes change (covers undo and clear).
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = context()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    strokes.forEach(s => drawStroke(ctx, s))
  }, [strokes])

  /**
   * The pointer position in canvas pixels. The canvas is drawn at 600×200 but CSS
   * may show it at another size, so screen coordinates are scaled to match.
   */
  function point(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return [
      (e.clientX - rect.left) * canvas.width / rect.width,
      (e.clientY - rect.top) * canvas.height / rect.height,
    ]
  }

  function onPointerDown(e) {
    if (e.button !== 0) return
    // Keeps the stroke going even if the pointer leaves the canvas mid-stroke.
    e.currentTarget.setPointerCapture(e.pointerId)
    current.current = [point(e)]
    setError('')
    setSaved(null)
    drawStroke(context(), current.current)
  }

  function onPointerMove(e) {
    if (!current.current) return
    const p = point(e)
    const last = current.current[current.current.length - 1]
    current.current.push(p)
    // Draw only the new segment now; the whole stroke goes into state on pointerup.
    drawStroke(context(), [last, p])
  }

  function onPointerUp() {
    if (!current.current) return
    const stroke = current.current
    current.current = null
    setStrokes(s => [...s, stroke])
  }

  function save() {
    if (inkLength(strokes) < SIGNATURE_MIN_LENGTH) {
      setError(t('signatureTooShort'))
      return
    }
    const url = canvasRef.current.toDataURL('image/png')
    // Base64 is 4 characters per 3 bytes, so ×0.75 approximates the PNG's size.
    setSaved({ url, kb: (url.length * 0.75 / 1024).toFixed(1) })
  }

  function clear() {
    setStrokes([])
    setSaved(null)
    setError('')
  }

  function undo() {
    setStrokes(s => s.slice(0, -1))
    setSaved(null)
    setError('')
  }

  const empty = strokes.length === 0

  return (
    <section id="sec-signature" className="card">
      <SectionHeader num="28" title={t('sec28Title')} locator="canvas / data-empty" />
      <p className="desc">{t('sec28Desc')}</p>

      <div className="signature-wrap">
        <canvas ref={canvasRef} id="signature-pad" data-testid="signature-pad"
          className="signature-pad" width={600} height={200}
          role="img" aria-label={t('signatureAria')}
          data-empty={empty} data-strokes={strokes.length}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
        {empty && <span className="signature-placeholder">{t('signaturePlaceholder')}</span>}
      </div>

      <div className="button-row">
        <button id="signature-undo" className="btn-secondary" disabled={empty} onClick={undo}>{t('signatureUndo')}</button>
        <button id="signature-clear" className="btn-secondary" disabled={empty} onClick={clear}>{t('signatureClear')}</button>
        <button id="signature-save" className="btn-primary" disabled={empty} onClick={save}>{t('signatureSave')}</button>
      </div>

      {error && <span id="signature-error" className="error-msg">{error}</span>}
      {saved && (
        <>
          <Output id="signature-output">{t('signatureSaved', { n: strokes.length, kb: saved.kb })}</Output>
          <img id="signature-preview" className="signature-preview" src={saved.url} alt={t('signatureAria')} />
        </>
      )}
    </section>
  )
}
