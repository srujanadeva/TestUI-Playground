import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// ─── I1. Resizable panels ────────────────────────────────────────────────────
const SPLIT_MIN = 20
const SPLIT_MAX = 80
const SPLIT_DEFAULT = 35

function ResizableSection() {
  const { t, lang } = useLang()
  const splitRef = useRef(null)
  const [size, setSize]         = useState(SPLIT_DEFAULT)
  const [dragging, setDragging] = useState(false)
  const rtl = lang === 'ar'
  const set = v => setSize(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, Math.round(v))))

  const onPointerDown = e => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = e => {
    if (!dragging) return
    const r = splitRef.current.getBoundingClientRect()
    set(((rtl ? r.right - e.clientX : e.clientX - r.left) / r.width) * 100)
  }
  const onKeyDown = e => {
    const grow = rtl ? 'ArrowLeft' : 'ArrowRight'
    const shrink = rtl ? 'ArrowRight' : 'ArrowLeft'
    const next = { [grow]: size + 5, [shrink]: size - 5, Home: SPLIT_MIN, End: SPLIT_MAX }[e.key]
    if (next === undefined) return
    e.preventDefault()
    set(next)
  }

  return (
    <section id="sec-int-resize" className="card media-wide" data-size={size} data-dragging={dragging}>
      <SectionHeader num="I1" title={t('secI1Title')} locator="role=separator / aria-valuenow" />
      <p className="desc">{t('secI1Desc', { min: SPLIT_MIN, max: SPLIT_MAX })}</p>
      <div ref={splitRef} className="lab-split" data-testid="split">
        <div className="lab-pane lab-pane-first" id="pane-first" style={{ flexBasis: `${size}%` }}>
          <strong>{t('paneFirst')}</strong>
          <span className="lab-muted">{size}%</span>
        </div>
        <div id="split-handle" className={`lab-handle ${dragging ? 'is-dragging' : ''}`} role="separator"
          tabIndex={0} aria-orientation="vertical" aria-controls="pane-first" aria-label={t('splitHandle')}
          aria-valuemin={SPLIT_MIN} aria-valuemax={SPLIT_MAX} aria-valuenow={size}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
          onKeyDown={onKeyDown} onDoubleClick={() => set(SPLIT_DEFAULT)} />
        <div className="lab-pane" id="pane-second">
          <strong>{t('paneSecond')}</strong>
          <span className="lab-muted">{100 - size}%</span>
        </div>
      </div>
      <Output id="split-status">{t('splitStatus', { n: size })}</Output>
    </section>
  )
}

// ─── I2. Sortable grid ───────────────────────────────────────────────────────
const START_ORDER = [3, 1, 2, 6, 4, 5, 9, 7, 8]
const COLS = 3
const isSorted = order => order.every((n, i) => n === i + 1)
const swap = (order, a, b) => {
  const next = [...order]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

function SortableGridSection() {
  const { t, lang } = useLang()
  const [order, setOrder]       = useState(START_ORDER)
  const [dragFrom, setDragFrom] = useState(null)  // index being dragged with the mouse
  const [over, setOver]         = useState(null)
  const [grabbed, setGrabbed]   = useState(null)  // { index, before } while moving with the keyboard
  const [note, setNote]         = useState(null)
  const tiles = useRef([])

  const focusAt = i => setTimeout(() => tiles.current[i]?.focus())

  const onKeyDown = (e, i) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (grabbed) { setGrabbed(null); setNote({ key: 'gridDropped', n: order[i], pos: i + 1 }) }
      else { setGrabbed({ index: i, before: order }); setNote({ key: 'gridGrabbed', n: order[i] }) }
      return
    }
    if (e.key === 'Escape' && grabbed) {
      e.preventDefault()
      setOrder(grabbed.before); setGrabbed(null); setNote({ key: 'gridCancelled' })
      focusAt(grabbed.before.indexOf(order[i]))
      return
    }
    const rtl = lang === 'ar'
    const step = {
      ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -COLS, ArrowDown: COLS,
    }[e.key]
    if (step === undefined) return
    e.preventDefault()
    const j = i + step
    if (j < 0 || j >= order.length || (Math.abs(step) === 1 && Math.floor(j / COLS) !== Math.floor(i / COLS))) return
    if (grabbed) { setOrder(o => swap(o, i, j)); setGrabbed(g => ({ ...g, index: j })) }
    focusAt(j)
  }

  const onDrop = (e, i) => {
    e.preventDefault()
    const from = dragFrom ?? Number(e.dataTransfer.getData('text/plain'))
    if (Number.isInteger(from) && from !== i) {
      setOrder(o => swap(o, from, i))
      setNote({ key: 'gridSwapped', a: order[from], b: order[i] })
    }
    setDragFrom(null); setOver(null)
  }

  const sorted = isSorted(order)
  return (
    <section id="sec-int-grid" className="card" data-order={order.join(',')} data-sorted={sorted}>
      <SectionHeader num="I2" title={t('secI2Title')} locator="data-tile / data-pos" />
      <p className="desc">{t('secI2Desc')}</p>
      <div className="lab-grid" role="grid" aria-label={t('secI2Title')}>
        {Array.from({ length: order.length / COLS }, (_, r) => (
          <div key={r} role="row" className="lab-grid-row">
            {order.slice(r * COLS, r * COLS + COLS).map((n, c) => {
              const i = r * COLS + c
              return (
                <div key={n} role="gridcell" ref={el => (tiles.current[i] = el)} tabIndex={0}
                  className={`lab-tile ${dragFrom === i ? 'is-dragging' : ''} ${over === i && dragFrom !== i ? 'is-over' : ''} ${grabbed?.index === i ? 'is-grabbed' : ''} ${n === i + 1 ? 'is-placed' : ''}`}
                  data-tile={n} data-pos={i + 1} aria-label={t('gridTile', { n, pos: i + 1 })}
                  aria-pressed={grabbed?.index === i}
                  draggable onDragStart={e => { setDragFrom(i); e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move' }}
                  onDragOver={e => { e.preventDefault(); setOver(i) }}
                  onDragLeave={() => setOver(o => (o === i ? null : o))}
                  onDrop={e => onDrop(e, i)} onDragEnd={() => { setDragFrom(null); setOver(null) }}
                  onKeyDown={e => onKeyDown(e, i)}>
                  {n}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="button-row">
        <button id="grid-reset" className="btn-secondary"
          onClick={() => { setOrder(START_ORDER); setGrabbed(null); setNote(null) }}>{t('intReset')}</button>
      </div>
      <p className="lab-muted" aria-live="polite" id="grid-live">{note ? t(note.key, note) : ''}</p>
      <Output id="grid-status">
        {sorted ? t('gridSorted') : t('gridOrder', { order: order.join(' ') })}
      </Output>
    </section>
  )
}

// ─── I3. Command palette ─────────────────────────────────────────────────────
const COMMANDS = [
  { key: 'new-test',       labelKey: 'cmdNewTest' },
  { key: 'run-all',        labelKey: 'cmdRunAll' },
  { key: 'toggle-compact', labelKey: 'cmdCompact' },
  { key: 'export-report',  labelKey: 'cmdExport' },
  { key: 'switch-language', labelKey: 'cmdLanguage' },
  { key: 'go-data',        labelKey: 'cmdGoData' },
]

function CommandPaletteSection() {
  const { t, toggleLang } = useLang()
  const navigate = useNavigate()
  const openerRef = useRef(null)
  const inputRef  = useRef(null)
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [active, setActive]   = useState(0)
  const [last, setLast]       = useState(null)
  const [compact, setCompact] = useState(false)

  const matches = COMMANDS.filter(c => t(c.labelKey).toLowerCase().includes(query.trim().toLowerCase()))

  const show = () => { setQuery(''); setActive(0); setOpen(true) }
  const hide = () => { setOpen(false); setTimeout(() => openerRef.current?.focus()) }

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => { if (!o) { setQuery(''); setActive(0) } return !o })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  const run = cmd => {
    setLast(cmd.key)
    setOpen(false)
    if (cmd.key === 'toggle-compact') setCompact(c => !c)
    if (cmd.key === 'switch-language') toggleLang()
    if (cmd.key === 'go-data') { navigate('/data'); return }
    setTimeout(() => openerRef.current?.focus())
  }

  const onKeyDown = e => {
    if (e.key === 'Escape') { e.preventDefault(); hide(); return }
    if (!matches.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % matches.length) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => (a <= 0 ? matches.length - 1 : a - 1)) }
    if (e.key === 'Enter')     { e.preventDefault(); run(matches[Math.min(active, matches.length - 1)]) }
  }

  const lastCmd = COMMANDS.find(c => c.key === last)
  return (
    <section id="sec-int-palette" className="card" data-open={open} data-compact={compact} data-last-command={last || ''}>
      <SectionHeader num="I3" title={t('secI3Title')} locator="Control+K / data-command" />
      <p className="desc">{t('secI3Desc')}</p>
      <div className="button-row lab-row-center">
        <button ref={openerRef} id="palette-open" className="btn-primary" aria-haspopup="dialog" onClick={show}>
          {t('paletteOpen')}
        </button>
        <span className="lab-muted"><kbd className="lab-kbd">Ctrl</kbd> / <kbd className="lab-kbd">⌘</kbd> + <kbd className="lab-kbd">K</kbd></span>
      </div>
      <Output id="palette-status">
        {t('paletteLast', { cmd: lastCmd ? t(lastCmd.labelKey) : t('intNone') })}
        {compact ? ` · ${t('paletteCompactOn')}` : ''}
      </Output>

      {open && (
        <>
          <div className="lab-overlay" onClick={hide} />
          <div className="lab-palette" role="dialog" aria-modal="true" aria-label={t('secI3Title')}
            data-testid="command-palette">
            <input ref={inputRef} id="palette-input" type="text" role="combobox" autoComplete="off"
              aria-expanded="true" aria-controls="palette-list" placeholder={t('palettePlaceholder')}
              aria-activedescendant={matches.length ? `palette-opt-${matches[Math.min(active, matches.length - 1)].key}` : undefined}
              value={query} onChange={e => { setQuery(e.target.value); setActive(0) }} onKeyDown={onKeyDown} />
            <ul id="palette-list" role="listbox" aria-label={t('paletteCommands')}>
              {matches.length ? matches.map((c, i) => (
                <li key={c.key} id={`palette-opt-${c.key}`} role="option" data-command={c.key}
                  aria-selected={i === active} className={i === active ? 'is-active' : ''}
                  onMouseEnter={() => setActive(i)} onMouseDown={e => { e.preventDefault(); run(c) }}>
                  {t(c.labelKey)}
                </li>
              )) : <li className="lab-pop-note" role="presentation" id="palette-empty">{t('paletteNone')}</li>}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}

// ─── I4. Copy to clipboard ───────────────────────────────────────────────────
const SNIPPET = 'npm install -D @playwright/test'

function CopySection() {
  const { t } = useLang()
  const [state, setState]   = useState('idle')  // idle | copied | failed
  const [pasted, setPasted] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(SNIPPET)
      setState('copied')
    } catch {
      setState('failed')
    }
    timer.current = setTimeout(() => setState('idle'), 2000)
  }

  return (
    <section id="sec-int-copy" className="card" data-state={state}>
      <SectionHeader num="I4" title={t('secI4Title')} locator="data-state / paste event" />
      <p className="desc">{t('secI4Desc')}</p>
      <div className="lab-copy-row">
        <code id="copy-source" className="lab-code lab-copy-code">{SNIPPET}</code>
        <button id="copy-btn" className={state === 'copied' ? 'btn-success' : 'btn-primary'} data-state={state}
          onClick={copy}>
          {state === 'copied' ? `✓ ${t('copyDone')}` : state === 'failed' ? t('copyFailed') : t('copyBtn')}
        </button>
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="paste-target">{t('pasteLabel')}</label>
        <textarea id="paste-target" rows={2} placeholder={t('pastePlaceholder')}
          onPaste={e => {
            const text = e.clipboardData.getData('text')
            setPasted({ n: text.length, match: text === SNIPPET })
          }} />
      </div>
      <Output id="copy-status">
        {state === 'copied' ? t('copyStatusCopied') : state === 'failed' ? t('copyStatusFailed') : t('copyStatusIdle')}
        {pasted && ` · ${t(pasted.match ? 'pasteMatch' : 'pasteOther', { n: pasted.n })}`}
      </Output>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function InteractionsPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero interactions-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="interactions-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('interactionsHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('interactionsHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🖐️</div>
      </header>

      <div className="content-grid media-grid lab-first-grid">
        <ResizableSection />
        <SortableGridSection />
        <CommandPaletteSection />
        <CopySection />
      </div>
    </div>
  )
}
