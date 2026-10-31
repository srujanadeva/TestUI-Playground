import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output, numberParam } from '../ui.jsx'

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// ─── C1. Autocomplete combobox ───────────────────────────────────────────────
const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'India', 'Indonesia', 'Ireland',
  'Italy', 'Japan', 'Kenya', 'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Poland',
  'Portugal', 'Saudi Arabia', 'Singapore', 'South Africa', 'Spain', 'Sweden', 'Switzerland',
  'Thailand', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
]

function ComboboxSection() {
  const { t } = useLang()
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [options, setOptions]   = useState([])
  const [active, setActive]     = useState(-1)
  const [selected, setSelected] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const search = value => {
    setQuery(value)
    clearTimeout(timer.current)
    const q = value.trim().toLowerCase()
    if (!q) { setOpen(false); setLoading(false); setOptions([]); return }
    setOpen(true); setLoading(true); setActive(-1)
    // Options "arrive from the server" after a delay, so they aren't in the DOM straight away.
    timer.current = setTimeout(() => {
      setOptions(COUNTRIES.filter(c => c.toLowerCase().includes(q)))
      setLoading(false)
    }, numberParam('comboDelay', 400))
  }
  const pick = value => { setSelected(value); setQuery(value); setOpen(false); setActive(-1) }
  const clear = () => { clearTimeout(timer.current); setQuery(''); setSelected(''); setOpen(false); setOptions([]) }

  const onKeyDown = e => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (!open || loading || !options.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % options.length) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => (a <= 0 ? options.length - 1 : a - 1)) }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(options[active]) }
  }

  useEffect(() => {
    if (active >= 0) document.getElementById(`combo-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const state = loading ? 'loading' : open ? 'open' : selected ? 'selected' : 'idle'
  return (
    <section id="sec-controls-combobox" className="card" data-state={state} data-selected={selected}>
      <SectionHeader num="C1" title={t('secC1Title')} locator="role=combobox / role=option" />
      <p className="desc">{t('secC1Desc')}</p>
      <div className="lab-field-wrap">
        <div className="input-row">
          <input id="combo-input" type="text" role="combobox" autoComplete="off"
            aria-label={t('comboLabel')} placeholder={t('comboPlaceholder')}
            aria-expanded={open} aria-controls="combo-listbox" aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `combo-opt-${active}` : undefined}
            value={query} onChange={e => search(e.target.value)} onKeyDown={onKeyDown}
            onBlur={() => setOpen(false)} />
          <button id="combo-clear" className="btn-secondary" onClick={clear}>{t('ctlClear')}</button>
        </div>
        {open && (
          <ul id="combo-listbox" className="lab-pop" role="listbox" aria-label={t('comboLabel')}
            aria-busy={loading}>
            {loading ? <li className="lab-pop-note" role="presentation">{t('ctlLoading')}</li>
              : !options.length ? <li className="lab-pop-note" role="presentation">{t('ctlNoMatches')}</li>
              : options.map((c, i) => (
                <li key={c} id={`combo-opt-${i}`} role="option" data-value={c} aria-selected={i === active}
                  className={i === active ? 'is-active' : ''}
                  onMouseDown={e => { e.preventDefault(); pick(c) }} onMouseEnter={() => setActive(i)}>
                  {c}
                </li>
              ))}
          </ul>
        )}
      </div>
      <Output id="combo-status">{t('comboSelected', { value: selected || t('ctlNone') })}</Output>
    </section>
  )
}

// ─── C2. Multi-select with chips ─────────────────────────────────────────────
const SKILLS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'Kotlin', 'Swift', 'Ruby', 'SQL', 'Playwright', 'Selenium', 'Cypress']
const MAX_CHIPS = 5

function ChipsSection() {
  const { t } = useLang()
  const [chosen, setChosen] = useState(['JavaScript', 'Python'])
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const [active, setActive] = useState(0)
  const [error, setError]   = useState('')
  const inputRef = useRef(null)

  const matches = SKILLS.filter(s => !chosen.includes(s) && s.toLowerCase().includes(query.trim().toLowerCase()))

  const add = value => {
    if (chosen.length >= MAX_CHIPS) { setError('chipsMax'); return }
    setChosen(c => [...c, value]); setQuery(''); setActive(0); setError('')
  }
  const remove = value => { setChosen(c => c.filter(v => v !== value)); setError(''); inputRef.current?.focus() }

  const onKeyDown = e => {
    if (e.key === 'Backspace' && !query && chosen.length) { remove(chosen[chosen.length - 1]); return }
    if (e.key === 'Escape') { setOpen(false); return }
    if (!matches.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => (a + 1) % matches.length) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => (a <= 0 ? matches.length - 1 : a - 1)) }
    if (e.key === 'Enter')     { e.preventDefault(); add(matches[Math.min(active, matches.length - 1)]) }
  }

  return (
    <section id="sec-controls-chips" className="card" data-count={chosen.length}>
      <SectionHeader num="C2" title={t('secC2Title')} locator="data-testid=chip / data-value" />
      <p className="desc">{t('secC2Desc', { max: MAX_CHIPS })}</p>
      <div className="lab-field-wrap">
        <div className="lab-chipbox" onClick={() => inputRef.current?.focus()}>
          {chosen.map(v => (
            <span key={v} className="lab-chip" data-testid="chip" data-value={v}>
              {v}
              <button className="lab-chip-x" data-testid={`chip-remove-${slug(v)}`}
                aria-label={t('chipsRemove', { value: v })}
                onClick={e => { e.stopPropagation(); remove(v) }}>✕</button>
            </span>
          ))}
          <input ref={inputRef} id="chips-input" type="text" role="combobox" autoComplete="off"
            aria-label={t('chipsLabel')} placeholder={t('chipsPlaceholder')}
            aria-expanded={open && matches.length > 0} aria-controls="chips-listbox"
            value={query} onChange={e => { setQuery(e.target.value); setOpen(true); setActive(0) }}
            onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={onKeyDown} />
        </div>
        {open && matches.length > 0 && (
          <ul id="chips-listbox" className="lab-pop" role="listbox" aria-label={t('chipsLabel')}>
            {matches.map((s, i) => (
              <li key={s} role="option" data-value={s} aria-selected={i === active}
                className={i === active ? 'is-active' : ''}
                onMouseDown={e => { e.preventDefault(); add(s) }} onMouseEnter={() => setActive(i)}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      {error && <p id="chips-error" className="error-msg" role="alert">{t(error, { max: MAX_CHIPS })}</p>}
      <Output id="chips-status">
        {t('chipsSelected', { n: chosen.length, list: chosen.join(', ') || t('ctlNone') })}
      </Output>
    </section>
  )
}

// ─── C3. Toggle switches ─────────────────────────────────────────────────────
const SWITCHES = [
  { key: 'email',  labelKey: 'switchEmail',  on: true },
  { key: 'sms',    labelKey: 'switchSms',    on: false },
  { key: 'digest', labelKey: 'switchDigest', on: false },
  { key: 'beta',   labelKey: 'switchBeta',   on: true, disabled: true },
]

function SwitchesSection() {
  const { t } = useLang()
  const [on, setOn] = useState(() => Object.fromEntries(SWITCHES.map(s => [s.key, s.on])))
  const enabled = SWITCHES.filter(s => on[s.key])
  return (
    <section id="sec-controls-switches" className="card" data-on={enabled.map(s => s.key).join(',')}>
      <SectionHeader num="C3" title={t('secC3Title')} locator="role=switch / aria-checked" />
      <p className="desc">{t('secC3Desc')}</p>
      <div className="lab-switches">
        {SWITCHES.map(s => (
          <button key={s.key} id={`switch-${s.key}`} className="lab-switch" role="switch"
            aria-checked={on[s.key]} disabled={s.disabled}
            onClick={() => setOn(o => ({ ...o, [s.key]: !o[s.key] }))}>
            <span className="lab-switch-track" aria-hidden />
            <span>{t(s.labelKey)}</span>
          </button>
        ))}
      </div>
      <Output id="switch-status">
        {t('switchOn', { list: enabled.map(s => t(s.labelKey)).join(', ') || t('ctlNone') })}
      </Output>
    </section>
  )
}

// ─── C4. Number stepper ──────────────────────────────────────────────────────
const STEP_MIN = 0
const STEP_MAX = 10

function StepperSection() {
  const { t } = useLang()
  const [value, setValue] = useState(1)
  const [draft, setDraft] = useState('1')
  const set = v => {
    const n = Number.isFinite(v) ? Math.min(STEP_MAX, Math.max(STEP_MIN, Math.round(v))) : value
    setValue(n); setDraft(String(n))
  }
  return (
    <section id="sec-controls-stepper" className="card" data-value={value}>
      <SectionHeader num="C4" title={t('secC4Title')} locator="id / data-value" />
      <p className="desc">{t('secC4Desc', { min: STEP_MIN, max: STEP_MAX })}</p>
      <div className="lab-stepper">
        <button id="stepper-dec" className="btn-secondary" aria-label={t('stepperDec')}
          disabled={value <= STEP_MIN} onClick={() => set(value - 1)}>−</button>
        <input id="stepper-input" type="text" inputMode="numeric" aria-label={t('stepperLabel')}
          value={draft} onChange={e => setDraft(e.target.value)}
          onBlur={() => set(Number(draft === '' ? NaN : draft))}
          onKeyDown={e => {
            if (e.key === 'Enter') set(Number(draft === '' ? NaN : draft))
            if (e.key === 'ArrowUp')   { e.preventDefault(); set(value + 1) }
            if (e.key === 'ArrowDown') { e.preventDefault(); set(value - 1) }
          }} />
        <button id="stepper-inc" className="btn-secondary" aria-label={t('stepperInc')}
          disabled={value >= STEP_MAX} onClick={() => set(value + 1)}>+</button>
      </div>
      <Output id="stepper-status">{t('stepperValue', { n: value })}</Output>
    </section>
  )
}

// ─── C5. Colour picker ───────────────────────────────────────────────────────
const SWATCHES = [
  { hex: '#4f46e5', name: 'Indigo' }, { hex: '#059669', name: 'Emerald' }, { hex: '#d97706', name: 'Amber' },
  { hex: '#dc2626', name: 'Red' },    { hex: '#0284c7', name: 'Sky' },     { hex: '#db2777', name: 'Pink' },
]

function ColourSection() {
  const { t } = useLang()
  const [color, setColor] = useState('#4f46e5')
  const [hex, setHex]     = useState('#4f46e5')
  const [error, setError] = useState('')
  const apply = c => { const v = c.toLowerCase(); setColor(v); setHex(v); setError('') }
  const applyHex = () => {
    const v = hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`
    if (/^#[0-9a-f]{6}$/i.test(v)) apply(v)
    else setError('colorInvalid')
  }
  const named = SWATCHES.find(s => s.hex === color)
  return (
    <section id="sec-controls-color" className="card" data-color={color}>
      <SectionHeader num="C5" title={t('secC5Title')} locator="id / data-color" />
      <p className="desc">{t('secC5Desc')}</p>
      <div className="lab-color-row">
        <input id="color-input" type="color" aria-label={t('colorPick')} value={color}
          onChange={e => apply(e.target.value)} />
        <div className="lab-swatches" role="group" aria-label={t('colorSwatches')}>
          {SWATCHES.map(s => (
            <button key={s.hex} className="lab-swatch" data-color={s.hex} aria-label={s.name}
              aria-pressed={color === s.hex} style={{ background: s.hex }} onClick={() => apply(s.hex)} />
          ))}
        </div>
      </div>
      <div className="input-row">
        <input id="color-hex" type="text" dir="ltr" aria-label={t('colorHex')} value={hex} aria-invalid={!!error}
          onChange={e => setHex(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') applyHex() }} />
        <button id="color-apply" className="btn-primary" onClick={applyHex}>{t('ctlApply')}</button>
      </div>
      {error && <p id="color-error" className="error-msg" role="alert">{t(error)}</p>}
      <div id="color-preview" className="lab-color-preview" data-color={color} style={{ background: color }} />
      <Output id="color-status">{t('colorValue', { hex: color, name: named ? ` (${named.name})` : '' })}</Output>
    </section>
  )
}

// ─── C6. Time and date-time pickers ──────────────────────────────────────────
const DT_MIN = '2026-01-01T00:00'
const DT_MAX = '2026-12-31T23:59'

function TimeSection() {
  const { t } = useLang()
  const [time, setTime] = useState('09:30')
  const [dt, setDt]     = useState('2026-11-02T14:00')
  const timeError = time && (time < '09:00' || time > '17:00') ? t('timeOutside') : ''
  const dtError = dt && (dt < DT_MIN || dt > DT_MAX) ? t('dtOutside') : ''
  return (
    <section id="sec-controls-time" className="card" data-time={time} data-datetime={dt}
      data-valid={!timeError && !dtError && !!time && !!dt}>
      <SectionHeader num="C6" title={t('secC6Title')} locator="id / ISO value" />
      <p className="desc">{t('secC6Desc')}</p>
      <div className="lab-two-col">
        <div className="form-field">
          <label className="field-label" htmlFor="time-input">{t('timeLabel')}</label>
          <input id="time-input" className="lab-input" type="time" min="09:00" max="17:00" step="900"
            value={time} aria-invalid={!!timeError} onChange={e => setTime(e.target.value)} />
          {timeError && <span id="time-error" className="error-msg" role="alert">{timeError}</span>}
        </div>
        <div className="form-field">
          <label className="field-label" htmlFor="datetime-input">{t('dtLabel')}</label>
          <input id="datetime-input" className="lab-input" type="datetime-local" min={DT_MIN} max={DT_MAX}
            value={dt} aria-invalid={!!dtError} onChange={e => setDt(e.target.value)} />
          {dtError && <span id="datetime-error" className="error-msg" role="alert">{dtError}</span>}
        </div>
      </div>
      <Output id="time-status">{t('timeValue', { time: time || '—', dt: dt || '—' })}</Output>
    </section>
  )
}

// ─── C7. Rich text editor ────────────────────────────────────────────────────
const RTE_COMMANDS = [
  { cmd: 'bold', label: <b>B</b>, key: 'rteBold' },
  { cmd: 'italic', label: <i>I</i>, key: 'rteItalic' },
  { cmd: 'underline', label: <u>U</u>, key: 'rteUnderline' },
  { cmd: 'insertUnorderedList', label: '• ≡', key: 'rteBullets' },
  { cmd: 'insertOrderedList', label: '1. ≡', key: 'rteNumbers' },
]
const RTE_INITIAL = 'Release notes for <b>v2.4</b>: select some text and use the toolbar.'

function RichTextSection() {
  const { t } = useLang()
  const ref = useRef(null)
  const [html, setHtml]       = useState(RTE_INITIAL)
  const [chars, setChars]     = useState(0)
  const [pressed, setPressed] = useState({})

  const sync = () => { setHtml(ref.current.innerHTML); setChars(ref.current.textContent.length) }
  useEffect(() => { ref.current.innerHTML = RTE_INITIAL; sync() }, [])

  // Reflect the formatting at the caret in each toolbar button's aria-pressed.
  useEffect(() => {
    const onSel = () => {
      const sel = document.getSelection()
      if (!sel?.anchorNode || !ref.current?.contains(sel.anchorNode)) return
      setPressed(Object.fromEntries(RTE_COMMANDS.map(c => [c.cmd, document.queryCommandState(c.cmd)])))
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [])

  const run = cmd => {
    ref.current.focus()
    document.execCommand(cmd)
    sync()
    setPressed(p => ({ ...p, [cmd]: document.queryCommandState(cmd) }))
  }
  const clear = () => { ref.current.innerHTML = ''; sync() }

  return (
    <section id="sec-controls-rte" className="card media-wide">
      <SectionHeader num="C7" title={t('secC7Title')} locator="contenteditable / data-cmd" />
      <p className="desc">{t('secC7Desc')}</p>
      <div className="lab-rte-bar" role="toolbar" aria-label={t('rteToolbar')}>
        {RTE_COMMANDS.map(c => (
          <button key={c.cmd} className="btn-secondary lab-rte-btn" data-cmd={c.cmd} aria-label={t(c.key)}
            aria-pressed={!!pressed[c.cmd]} onMouseDown={e => { e.preventDefault(); run(c.cmd) }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(c.cmd) } }}>
            {c.label}
          </button>
        ))}
        <button id="rte-clear" className="btn-secondary lab-rte-btn" onClick={clear}>{t('ctlClear')}</button>
      </div>
      <div ref={ref} id="rte" className="lab-rte" contentEditable suppressContentEditableWarning
        role="textbox" aria-multiline="true" aria-label={t('secC7Title')}
        onInput={sync} />
      <Output id="rte-status">{t('rteCount', { n: chars })}</Output>
      <pre id="rte-html" className="lab-code" data-testid="rte-html">{html}</pre>
    </section>
  )
}

// ─── C8. Masked inputs ───────────────────────────────────────────────────────
function formatPhone(d) {
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return d ? `(${d}` : ''
}
function cardBrand(d) {
  if (/^3[47]/.test(d)) return 'amex'
  if (/^4/.test(d)) return 'visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'mastercard'
  return d ? 'unknown' : ''
}
function formatCard(d, brand) {
  if (brand === 'amex') return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ')
  return d.replace(/(.{4})(?=.)/g, '$1 ')
}
function luhn(d) {
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i])
    if (i % 2) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return sum % 10 === 0
}

function MaskedSection() {
  const { t } = useLang()
  const [phone, setPhone]   = useState('')
  const [card, setCard]     = useState('')
  const [amount, setAmount] = useState('')  // digits, last two are cents

  const brand = cardBrand(card)
  const cardLen = brand === 'amex' ? 15 : 16
  const cardDone = card.length === cardLen
  const cardValid = cardDone && luhn(card)
  const cents = amount.padStart(3, '0')
  const amountRaw = amount ? `${Number(cents.slice(0, -2))}.${cents.slice(-2)}` : ''
  const amountShown = amount ? '$' + Number(amountRaw).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''

  return (
    <section id="sec-controls-masked" className="card">
      <SectionHeader num="C8" title={t('secC8Title')} locator="id / data-raw" />
      <p className="desc">{t('secC8Desc')}</p>
      <div className="form-field">
        <label className="field-label" htmlFor="mask-phone">{t('maskPhone')}</label>
        <input id="mask-phone" type="text" inputMode="numeric" placeholder="(555) 123-4567" dir="ltr"
          data-raw={phone} value={formatPhone(phone)}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="mask-card">
          {t('maskCard')} {brand && brand !== 'unknown' && <span className="lab-brand" data-testid="card-brand">{brand}</span>}
        </label>
        <input id="mask-card" type="text" inputMode="numeric" placeholder="4242 4242 4242 4242" dir="ltr"
          data-raw={card} data-brand={brand} data-valid={cardDone ? String(cardValid) : ''}
          aria-invalid={cardDone && !cardValid} value={formatCard(card, brand)}
          onChange={e => {
            const d = e.target.value.replace(/\D/g, '')
            setCard(d.slice(0, cardBrand(d) === 'amex' ? 15 : 16))
          }} />
        {cardDone && !cardValid && <span id="mask-card-error" className="error-msg" role="alert">{t('maskCardInvalid')}</span>}
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="mask-amount">{t('maskAmount')}</label>
        <input id="mask-amount" type="text" inputMode="numeric" placeholder="$0.00" dir="ltr"
          data-raw={amountRaw} value={amountShown}
          onChange={e => setAmount(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9))} />
      </div>
      <Output id="mask-status">{t('maskRaw', { phone: phone || '—', card: card || '—', amount: amountRaw || '—' })}</Output>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ControlsPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero controls-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="controls-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('controlsHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('controlsHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🎛️</div>
      </header>

      <h2 className="media-group-title">{t('controlsGroupSelect')}</h2>
      <div className="content-grid media-grid">
        <ComboboxSection />
        <ChipsSection />
        <SwitchesSection />
        <StepperSection />
      </div>

      <h2 className="media-group-title">{t('controlsGroupInput')}</h2>
      <div className="content-grid media-grid">
        <ColourSection />
        <TimeSection />
        <MaskedSection />
        <RichTextSection />
      </div>
    </div>
  )
}
