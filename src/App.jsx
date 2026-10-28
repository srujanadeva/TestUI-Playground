import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LanguageProvider, useLang } from './i18n'
import { useAuth } from './auth/AuthContext.jsx'
import LoginPage from './auth/LoginPage.jsx'
import SignupPage from './auth/SignupPage.jsx'
import ForgotPasswordPage from './auth/ForgotPasswordPage.jsx'
import AccountPage from './auth/AccountPage.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import PetstorePage from './petstore/PetstorePage.jsx'
import MediaPage from './media/MediaPage.jsx'
import FramesPage from './frames/FramesPage.jsx'
import SpreadsheetPage from './spreadsheet/SpreadsheetPage.jsx'
import VerificationPage from './verification/VerificationPage.jsx'
import { SectionHeader, Output } from './ui.jsx'

// ─── 01. Text Input ──────────────────────────────────────────────────────────
function TextInputSection() {
  const { t } = useLang()
  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('')
  return (
    <section id="sec-text" className="card">
      <SectionHeader num="01" title={t('sec01Title')} locator="id" />
      <p className="desc">{t('sec01Desc')}</p>
      <div className="input-row">
        <input id="first-name-input" type="text" placeholder={t('phEnterName')}
          value={name} onChange={e => setName(e.target.value)} />
        <button id="greet-btn"
          onClick={() => setGreeting(t('greetingHello', { name: name || 'stranger' }))}>
          {t('btnGreet')}
        </button>
      </div>
      {greeting && <Output id="greeting-output">{greeting}</Output>}
    </section>
  )
}

// ─── 02. Password & Textarea ─────────────────────────────────────────────────
function PasswordTextareaSection() {
  const { t } = useLang()
  const [pass, setPass] = useState('')
  const [note, setNote] = useState('')
  const [shown, setShown] = useState(false)
  return (
    <section id="sec-password" className="card">
      <SectionHeader num="02" title={t('sec02Title')} locator="id / className" />
      <p className="desc">{t('sec02Desc')}</p>
      <div className="input-row">
        <input id="password-input" type={shown ? 'text' : 'password'}
          placeholder={t('phPassword')} value={pass} onChange={e => setPass(e.target.value)} />
        <button className="btn-secondary" id="toggle-password-btn"
          onClick={() => setShown(s => !s)}>{shown ? t('btnHide') : t('btnShow')}</button>
      </div>
      <textarea id="notes-textarea" className="notes-textarea"
        placeholder={t('phNotes')} rows={3}
        value={note} onChange={e => setNote(e.target.value)} />
      {note && <Output id="textarea-char-count">{t('charCount', { n: note.length })}</Output>}
    </section>
  )
}

// ─── 03. Date Picker ─────────────────────────────────────────────────────────
function DatePickerSection() {
  const { t } = useLang()
  const [date, setDate] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  return (
    <section id="sec-date" className="card">
      <SectionHeader num="03" title={t('sec03Title')} locator="id" />
      <p className="desc">{t('sec03Desc')}</p>
      <label className="field-label" htmlFor="single-date">{t('labelSingleDate')}</label>
      <input id="single-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
      {date && <Output id="selected-date">{t('selectedDate', { date })}</Output>}
      <div className="date-range">
        <div>
          <label className="field-label" htmlFor="range-from">{t('labelFrom')}</label>
          <input id="range-from" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="range-to">{t('labelTo')}</label>
          <input id="range-to" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>
      {from && to && <Output id="date-range-output">{t('dateRange', { from, to })}</Output>}
    </section>
  )
}

// ─── 04. Range Slider ────────────────────────────────────────────────────────
function SliderSection() {
  const { t } = useLang()
  const [qty, setQty]             = useState(50)
  const [brightness, setBrightness] = useState(70)
  return (
    <section id="sec-slider" className="card">
      <SectionHeader num="04" title={t('sec04Title')} locator="id" />
      <p className="desc">{t('sec04Desc')}</p>
      <div className="slider-group">
        <label className="field-label" htmlFor="qty-slider">
          {t('labelQty', { n: '' })}<strong>{qty}</strong>
        </label>
        <input id="qty-slider" type="range" min={0} max={100} value={qty}
          onChange={e => setQty(Number(e.target.value))} />
      </div>
      <div className="slider-group">
        <label className="field-label" htmlFor="brightness-slider">
          {t('labelBrightness', { n: '' })}<strong>{brightness}%</strong>
        </label>
        <input id="brightness-slider" type="range" min={0} max={100} value={brightness}
          onChange={e => setBrightness(Number(e.target.value))} />
        <div id="brightness-preview" className="brightness-preview"
          style={{ opacity: brightness / 100 }} />
      </div>
    </section>
  )
}

// ─── 05. File Upload ─────────────────────────────────────────────────────────
function FileUploadSection() {
  const { t } = useLang()
  const [files, setFiles]         = useState([])
  const [draggingOver, setDraggingOver] = useState(false)
  const inputRef                  = useRef(null)

  const handleFiles = list =>
    setFiles(Array.from(list).map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
    })))

  return (
    <section id="sec-file" className="card">
      <SectionHeader num="05" title={t('sec05Title')} locator="id" />
      <p className="desc">{t('sec05Desc')}</p>
      <div
        className={`drop-zone ${draggingOver ? 'drop-active' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDraggingOver(true) }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={e => { e.preventDefault(); setDraggingOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <div className="drop-icon">&#8679;</div>
        <p>{t('dropOrBrowse')} <span className="link-text">{t('dropBrowse')}</span></p>
        <p className="drop-hint">{t('dropHint')}</p>
        <input ref={inputRef} id="file-upload-input" type="file" multiple
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className="file-item" data-filename={f.name}>
              <span className="file-name">{f.name}</span>
              <span className="file-meta">{f.size}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 06. Form Validation ─────────────────────────────────────────────────────
function FormValidationSection() {
  const { t } = useLang()
  const [form, setForm]   = useState({ email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [ok, setOk]       = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.includes('@'))         e.email    = t('errEmail')
    if (!/^\d{10}$/.test(form.phone))      e.phone    = t('errPhone')
    if (form.password.length < 8)          e.password = t('errPassword')
    return e
  }

  const submit = () => {
    const e = validate()
    setErrors(e)
    setOk(Object.keys(e).length === 0)
  }

  const set = key => e => { setForm(f => ({ ...f, [key]: e.target.value })); setOk(false) }

  const fields = [
    { key: 'email',    labelKey: 'labelEmail',    id: 'val-email',    type: 'text',     phKey: 'phEmailField',    ariaKey: 'ariaEmail' },
    { key: 'phone',    labelKey: 'labelPhone',    id: 'val-phone',    type: 'text',     phKey: 'phPhoneField',    ariaKey: 'ariaPhone' },
    { key: 'password', labelKey: 'labelPassword', id: 'val-password', type: 'password', phKey: 'phPasswordField', ariaKey: 'ariaPassword' },
  ]

  return (
    <section id="sec-form" className="card">
      <SectionHeader num="06" title={t('sec06Title')} locator="placeholder / aria-label" />
      <p className="desc">{t('sec06Desc')}</p>
      {fields.map(f => (
        <div key={f.key} className="form-field">
          <label className="field-label" htmlFor={f.id}>{t(f.labelKey)}</label>
          <input id={f.id} type={f.type} placeholder={t(f.phKey)} aria-label={t(f.ariaKey)}
            value={form[f.key]} onChange={set(f.key)}
            className={errors[f.key] ? 'input-error' : ''} />
          {errors[f.key] && <span id={`${f.key}-error`} className="error-msg">{errors[f.key]}</span>}
        </div>
      ))}
      <button id="validate-submit-btn" onClick={submit}>{t('btnSubmit')}</button>
      {ok && <span id="form-success" className="success-msg">{t('formSuccess')}</span>}
    </section>
  )
}

// ─── 07. Checkboxes ──────────────────────────────────────────────────────────
const SKILL_KEYS = ['javascript', 'python', 'java', 'rust', 'go', 'typescript']

function CheckboxSection() {
  const { t, tArr } = useLang()
  const skills = tArr('skills')
  const [selected, setSelected] = useState([])
  const toggle = i => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])
  return (
    <section id="sec-checkbox" className="card">
      <SectionHeader num="07" title={t('sec07Title')} locator="label[for]" />
      <p className="desc">{t('sec07Desc')}</p>
      <div className="checkbox-grid">
        {SKILL_KEYS.map((key, i) => (
          <label key={key} className="checkbox-label" htmlFor={`cb-${key}`}>
            <input type="checkbox" id={`cb-${key}`}
              checked={selected.includes(i)} onChange={() => toggle(i)} />
            {skills[i]}
          </label>
        ))}
      </div>
      <Output id="checkbox-summary">
        {selected.length === 0
          ? t('nothingSelected')
          : t('selectedSkills', { skills: selected.map(i => skills[i]).join(', ') })}
      </Output>
    </section>
  )
}

// ─── 08. Radio Group ─────────────────────────────────────────────────────────
const PLANS = [
  { id: 'plan-free',       value: 'Free',       price: '$0/mo',  descKey: 'planFreeDesc' },
  { id: 'plan-pro',        value: 'Pro',        price: '$12/mo', descKey: 'planProDesc' },
  { id: 'plan-enterprise', value: 'Enterprise', price: '$49/mo', descKey: 'planEnterpriseDesc' },
]

function RadioSection() {
  const { t } = useLang()
  const [plan, setPlan] = useState('')
  return (
    <section id="sec-radio" className="card">
      <SectionHeader num="08" title={t('sec08Title')} locator="name" />
      <p className="desc">{t('sec08Desc')}</p>
      <div className="radio-cards">
        {PLANS.map(p => (
          <label key={p.id} htmlFor={p.id}
            className={`radio-card ${plan === p.value ? 'radio-selected' : ''}`}>
            <input type="radio" id={p.id} name="plan-type" value={p.value}
              checked={plan === p.value} onChange={() => setPlan(p.value)} />
            <div className="radio-card-body">
              <strong>{p.value}</strong>
              <span className="radio-price">{p.price}</span>
              <small>{t(p.descKey)}</small>
            </div>
          </label>
        ))}
      </div>
      {plan && <Output id="selected-plan">{t('selectedPlan', { plan })}</Output>}
    </section>
  )
}

// ─── 09. Dropdown & Multi-Select ─────────────────────────────────────────────
function DropdownSection() {
  const { t, tArr } = useLang()
  const countries = tArr('countries')
  const tagList   = tArr('tagList')
  const [country, setCountry] = useState('')
  const [tags, setTags]       = useState([])
  const toggleTag = tag => setTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])

  return (
    <section id="sec-dropdown" className="card">
      <SectionHeader num="09" title={t('sec09Title')} locator="id" />
      <p className="desc">{t('sec09Desc')}</p>
      <label className="field-label" htmlFor="country-select">{t('labelCountry')}</label>
      <select id="country-select" value={country} onChange={e => setCountry(e.target.value)}>
        <option value="">{t('selectCountryDefault')}</option>
        {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>
      {country && <Output id="selected-country">{t('selectedCountry', { country })}</Output>}
      <label className="field-label">{t('labelSkillsMulti')}</label>
      <div id="tag-selector" className="tag-selector">
        {tagList.map((tag, i) => (
          <button key={i} type="button" data-tag={tag}
            className={`tag-btn ${tags.includes(tag) ? 'tag-active' : ''}`}
            onClick={() => toggleTag(tag)}>{tag}</button>
        ))}
      </div>
      {tags.length > 0 && <Output id="selected-tags">{t('selectedTags', { tags: tags.join(', ') })}</Output>}
    </section>
  )
}

// ─── 10. Click Counter ───────────────────────────────────────────────────────
function ClickCounterSection() {
  const { t } = useLang()
  const [counts, setCounts] = useState({ primary: 0, success: 0, danger: 0 })
  const inc = key => setCounts(c => ({ ...c, [key]: c[key] + 1 }))
  const reset = () => setCounts({ primary: 0, success: 0, danger: 0 })
  const total = counts.primary + counts.success + counts.danger
  return (
    <section id="sec-counter" className="card">
      <SectionHeader num="10" title={t('sec10Title')} locator="className" />
      <p className="desc">{t('sec10Desc')}</p>
      <div className="button-row">
        <button className="btn-primary"   onClick={() => inc('primary')}>{t('btnPrimary')}</button>
        <button className="btn-success"   onClick={() => inc('success')}>{t('btnSuccess')}</button>
        <button className="btn-danger"    onClick={() => inc('danger')}>{t('btnDanger')}</button>
        <button className="btn-secondary" onClick={reset}>{t('btnReset')}</button>
      </div>
      <div className="counter-stats">
        {['primary', 'success', 'danger'].map(k => (
          <div key={k} className="stat" data-stat={k}>
            <span>{counts[k]}</span><small>{k}</small>
          </div>
        ))}
        <div className="stat stat-total" data-stat="total">
          <span>{total}</span><small>total</small>
        </div>
      </div>
    </section>
  )
}

// ─── 11. Double Click ────────────────────────────────────────────────────────
function DoubleClickSection() {
  const { t } = useLang()
  const [log, setLog] = useState([])
  const add = msg => setLog(l => [msg, ...l].slice(0, 4))
  return (
    <section id="sec-dblclick" className="card">
      <SectionHeader num="11" title={t('sec11Title')} locator="data-testid" />
      <p className="desc">{t('sec11Desc')}</p>
      <div
        className="click-area"
        data-testid="click-area"
        onClick={() => add(t('evtSingleClick'))}
        onDoubleClick={() => add(t('evtDoubleClick'))}
        onContextMenu={e => { e.preventDefault(); add(t('evtRightClick')) }}
      >
        <span className="click-area-text">{t('clickAreaLabel')}</span>
      </div>
      {log.length > 0 && (
        <div id="click-log" className="event-log">
          {log.map((e, i) => (
            <div key={i} className="event-entry" data-event={e}>{e}</div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 12. Dynamic Buttons ─────────────────────────────────────────────────────
function DynamicButtonsSection() {
  const { t } = useLang()
  const [loading, setLoading]   = useState(false)
  const [loadDone, setLoadDone] = useState(false)
  const [visible, setVisible]   = useState(true)
  const [extras, setExtras]     = useState([])

  const simulateLoad = () => {
    setLoading(true); setLoadDone(false)
    setTimeout(() => { setLoading(false); setLoadDone(true) }, 2000)
  }

  return (
    <section id="sec-dynamic" className="card">
      <SectionHeader num="12" title={t('sec12Title')} locator="id / data-dynamic-id" />
      <p className="desc">{t('sec12Desc')}</p>
      <div className="button-row">
        <button id="btn-load" onClick={simulateLoad} disabled={loading}
          className={loadDone ? 'btn-success' : 'btn-primary'}>
          {loading ? t('btnLoading') : loadDone ? t('btnDone') : t('btnStartLoading')}
        </button>
        {visible
          ? <button id="btn-disappear" className="btn-warning" onClick={() => setVisible(false)}>{t('btnDisappear')}</button>
          : <button id="btn-reappear"  className="btn-success" onClick={() => setVisible(true)}>{t('btnReappear')}</button>
        }
        <button id="btn-add-dynamic" className="btn-secondary"
          onClick={() => setExtras(e => [...e, Date.now()])}>{t('btnAddButton')}</button>
      </div>
      {extras.length > 0 && (
        <div className="extra-buttons">
          {extras.map(id => (
            <button key={id} data-dynamic-id={id} className="btn-extra"
              onClick={() => setExtras(e => e.filter(x => x !== id))}>
              {t('btnRemove', { id: String(id).slice(-4) })}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 13. Mouse Hover ─────────────────────────────────────────────────────────
const HOVER_CARDS = [
  { id: 'hover-info',    labelKey: 'hoverInfo',    tipKey: 'tipInfo',    color: '#3b82f6' },
  { id: 'hover-warn',    labelKey: 'hoverWarning', tipKey: 'tipWarning', color: '#f59e0b' },
  { id: 'hover-success', labelKey: 'hoverSuccess', tipKey: 'tipSuccess', color: '#10b981' },
  { id: 'hover-danger',  labelKey: 'hoverDanger',  tipKey: 'tipDanger',  color: '#ef4444' },
]

function HoverSection() {
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

function FocusBlurSection() {
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

function DragDropSection() {
  const { t } = useLang()
  const [items, setItems]       = useState(DRAG_KEYS)
  const [dragging, setDragging] = useState(null)
  const [log, setLog]           = useState('')

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

// ─── 16. Browser Popups ──────────────────────────────────────────────────────
function PopupsSection() {
  const { t } = useLang()
  const [result, setResult] = useState('')
  return (
    <section id="sec-popups" className="card">
      <SectionHeader num="16" title={t('sec16Title')} locator="id" />
      <p className="desc">{t('sec16Desc')}</p>
      <div className="button-row">
        <button id="btn-alert" className="btn-warning"
          onClick={() => { window.alert(t('alertMsg')); setResult(t('alertDismissed')) }}>
          {t('btnAlert')}
        </button>
        <button id="btn-prompt" className="btn-primary"
          onClick={() => {
            const v = window.prompt(t('promptMsg'))
            setResult(v !== null ? t('promptReturned', { val: v }) : t('promptCancelled'))
          }}>
          {t('btnPrompt')}
        </button>
        <button id="btn-confirm" className="btn-success"
          onClick={() => {
            const ok = window.confirm(t('confirmMsg'))
            setResult(ok ? t('confirmOk') : t('confirmCancel'))
          }}>
          {t('btnConfirm')}
        </button>
      </div>
      {result && <Output id="popup-result">{result}</Output>}
    </section>
  )
}

// ─── 17. Links & New Windows ─────────────────────────────────────────────────
function LinksWindowsSection() {
  const { t } = useLang()
  const [log, setLog] = useState('')
  return (
    <section id="sec-windows" className="card">
      <SectionHeader num="17" title={t('sec17Title')} locator="id / href / target" />
      <p className="desc">{t('sec17Desc')}</p>
      <div className="links-grid">
        <a id="link-anchor"  href="#sec-text" className="link-chip">{t('linkAnchor')}</a>
        <a id="link-newtab"  href="https://example.com" target="_blank" rel="noreferrer" className="link-chip">
          {t('linkExternal')}
        </a>
        <a id="link-download" href="data:text/plain,Hello" download="sample.txt" className="link-chip">
          {t('linkDownload')}
        </a>
        <button id="btn-js-newtab" className="btn-secondary"
          onClick={() => { window.open('https://example.com', '_blank'); setLog(t('newTabOpened')) }}>
          {t('btnJsNewTab')}
        </button>
        <button id="btn-js-newwindow" className="btn-secondary"
          onClick={() => {
            window.open('https://example.com', 'popup', 'width=700,height=500,left=200,top=100')
            setLog(t('newWindowOpened'))
          }}>
          {t('btnJsNewWindow')}
        </button>
      </div>
      {log && <Output id="window-log">{log}</Output>}
    </section>
  )
}

// ─── 19. Shadow DOM ──────────────────────────────────────────────────────────
function ShadowDOMSection() {
  const { t, lang } = useLang()
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (!host.shadowRoot) {
      host.attachShadow({ mode: 'open' })
    }
    const shadow = host.shadowRoot
    shadow.innerHTML = `
      <style>
        :host{display:block}
        .wrap{background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:8px;padding:20px;color:#e2e8f0}
        .badge{display:inline-block;background:#6366f1;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em}
        p{font-size:13px;color:#94a3b8;margin-bottom:12px}
        .row{display:flex;gap:8px}
        input{flex:1;padding:8px 12px;background:#1e293b;border:1px solid #475569;border-radius:6px;color:#e2e8f0;font-size:14px;outline:none}
        input:focus{border-color:#6366f1}
        button{padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}
        button:hover{background:#4f46e5}
        #shadow-output{margin-top:10px;padding:10px 12px;background:rgba(99,102,241,.15);border-radius:6px;color:#a5b4fc;font-size:14px;min-height:38px}
      </style>
      <div class="wrap">
        <span class="badge">${t('shadowBadge')}</span>
        <p>${t('shadowDesc')}</p>
        <div class="row">
          <input id="shadow-input" type="text" placeholder="${t('shadowPlaceholder')}"/>
          <button id="shadow-btn">${t('shadowBtnRead')}</button>
        </div>
        <div id="shadow-output">${t('shadowResultInit')}</div>
      </div>`
    shadow.getElementById('shadow-btn').addEventListener('click', () => {
      const val = shadow.getElementById('shadow-input').value
      shadow.getElementById('shadow-output').textContent =
        val ? t('shadowValue', { val }) : t('shadowEmpty')
    })
  }, [lang])

  return (
    <section id="sec-shadow" className="card">
      <SectionHeader num="19" title={t('sec19Title')} locator="data-testid / shadowRoot" />
      <p className="desc">{t('sec19Desc')} <code>locator.shadowRoot()</code></p>
      <div ref={hostRef} data-testid="shadow-host" />
    </section>
  )
}

// ─── 20. Pagination Table ────────────────────────────────────────────────────
const NAMES   = ['Alice','Bob','Carol','David','Emma','Frank','Grace','Henry','Iris','Jack','Karen','Leo','Maya','Nathan','Olivia','Paul','Quinn','Rachel','Sam','Tina']
const DEPTS   = ['Engineering','Marketing','Sales','HR','Finance']
const ROLES   = ['Manager','Senior Dev','Analyst','Lead','Coordinator']
const EMPLOYEES = Array.from({ length: 25 }, (_, i) => ({
  id:     `EMP${String(i + 1).padStart(3, '0')}`,
  name:   NAMES[i % NAMES.length],
  dept:   DEPTS[i % DEPTS.length],
  role:   ROLES[i % ROLES.length],
  status: i % 5 === 0 ? 'Inactive' : 'Active',
}))
const PER_PAGE = 5

function PaginationTableSection() {
  const { t } = useLang()
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')

  const filtered = EMPLOYEES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.dept.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <section id="sec-table" className="card">
      <SectionHeader num="20" title={t('sec20Title')} locator="id / data-row-id" />
      <p className="desc">{t('sec20Desc')}</p>
      <input id="employee-search" placeholder={t('phSearch')}
        value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      <div className="table-wrap">
        <table id="employee-table">
          <thead>
            <tr>
              <th>{t('colId')}</th>
              <th>{t('colName')}</th>
              <th>{t('colDept')}</th>
              <th>{t('colRole')}</th>
              <th>{t('colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} data-row-id={r.id}>
                <td className="cell-id">{r.id}</td>
                <td className="cell-name">{r.name}</td>
                <td className="cell-dept">{r.dept}</td>
                <td>{r.role}</td>
                <td>
                  <span className={`status-badge ${r.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                    {r.status === 'Active' ? t('statusActive') : t('statusInactive')}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} id="no-results" className="no-results">{t('noResults')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button id="page-first" onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button id="page-prev"  onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button key={n} data-page={n} onClick={() => setPage(n)}
            className={`page-num ${page === n ? 'page-active' : ''}`}>{n}</button>
        ))}
        <button id="page-next" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>›</button>
        <button id="page-last" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
      </div>
      <p id="page-info" className="page-info">
        {t('pageInfo', { shown: rows.length, total: filtered.length, page, totalPages })}
      </p>
    </section>
  )
}

// ─── 21. Show / Hide & Tabs ──────────────────────────────────────────────────
function ShowHideSection() {
  const { t, tArr } = useLang()
  const tabs       = tArr('tabs')
  const tabContent = tArr('tabContent')
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState(0)
  return (
    <section id="sec-toggle" className="card">
      <SectionHeader num="21" title={t('sec21Title')} locator="className / role" />
      <p className="desc">{t('sec21Desc')}</p>
      <button className="toggle-btn" id="toggle-panel-btn" onClick={() => setOpen(o => !o)}>
        {open ? t('btnCollapsePanel') : t('btnExpandPanel')}
      </button>
      {open && (
        <div id="collapsible-content" className="collapsible-panel">
          <p>{t('panelVisible')} <strong>{t('panelVisibleBold')}</strong>.</p>
          <code data-testid="secret-value">Secret: PANEL-XYZ-789</code>
        </div>
      )}
      <div className="tab-bar" role="tablist">
        {tabs.map((label, i) => (
          <button key={i} role="tab" id={`tab-${['details','settings','preview'][i]}`}
            className={`tab-btn ${tab === i ? 'tab-active' : ''}`}
            onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>
      <div id="tab-content" className="tab-content" role="tabpanel">
        {tabContent[tab]}
      </div>
    </section>
  )
}

// ─── 22. Popup Alerts ────────────────────────────────────────────────────────
const POPUP_TYPES = {
  warning: {
    id: 'warning',
    icon: '⚠',
    titleKey: 'popupWarningTitle',
    messageKey: 'popupWarningMsg',
    colorVar: '#d97706',
    bgVar: '#fffbeb',
    borderVar: '#fde68a',
  },
  error: {
    id: 'error',
    icon: '✕',
    titleKey: 'popupErrorTitle',
    messageKey: 'popupErrorMsg',
    colorVar: '#dc2626',
    bgVar: '#fef2f2',
    borderVar: '#fecaca',
  },
  exception: {
    id: 'exception',
    icon: '⚡',
    titleKey: 'popupExceptionTitle',
    messageKey: 'popupExceptionMsg',
    colorVar: '#7c3aed',
    bgVar: '#f5f3ff',
    borderVar: '#ddd6fe',
    mono: true,
  },
}

function PopupAlertsSection() {
  const { t } = useLang()
  const [active, setActive] = useState(null)
  const popup = active ? POPUP_TYPES[active] : null

  return (
    <section id="sec-popup-alerts" className="card">
      <SectionHeader num="22" title={t('sec22Title')} locator="id / role" />
      <p className="desc">{t('sec22Desc')}</p>
      <div className="button-row">
        <button id="btn-warning-popup"   className="btn-warning"   onClick={() => setActive('warning')}>{t('btnWarningPopup')}</button>
        <button id="btn-error-popup"     className="btn-danger"    onClick={() => setActive('error')}>{t('btnErrorPopup')}</button>
        <button id="btn-exception-popup" className="btn-exception" onClick={() => setActive('exception')}>{t('btnExceptionPopup')}</button>
      </div>

      {popup && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title"
          onClick={() => setActive(null)}>
          <div className="popup-modal"
            style={{ '--popup-color': popup.colorVar, '--popup-bg': popup.bgVar, '--popup-border': popup.borderVar }}
            onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <span className="popup-icon">{popup.icon}</span>
              <h3 className="popup-title" id="popup-title">{t(popup.titleKey)}</h3>
              <button className="popup-close" id="popup-close-btn" aria-label="Close" onClick={() => setActive(null)}>✕</button>
            </div>
            <p id="popup-message" className={`popup-message ${popup.mono ? 'popup-message-mono' : ''}`}>
              {t(popup.messageKey)}
            </p>
            <div className="popup-footer">
              <button id="popup-dismiss-btn" onClick={() => setActive(null)}>{t('btnDismiss')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── 23. Conditional Fields ──────────────────────────────────────────────────
function ConditionalFieldsSection() {
  const { t } = useLang()
  const [enabled, setEnabled] = useState(false)
  const [text, setText]       = useState('')
  const [chosen, setChosen]   = useState('')
  const [radio, setRadio]     = useState('')

  return (
    <section id="sec-conditional" className="card">
      <SectionHeader num="23" title={t('sec23Title')} locator="id / data-testid" />
      <p className="desc">{t('sec23Desc')}</p>

      <label className="checkbox-label" htmlFor="conditional-toggle">
        <input type="checkbox" id="conditional-toggle" data-testid="conditional-toggle"
          checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        {t('conditionalToggleLabel')}
      </label>

      {enabled && (
        <div id="conditional-fields" className="conditional-fields">
          <div className="form-field">
            <label className="field-label" htmlFor="conditional-text">{t('conditionalTextLabel')}</label>
            <input id="conditional-text" data-testid="conditional-text" type="text"
              placeholder={t('conditionalTextPh')} value={text}
              onChange={e => setText(e.target.value)} />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="conditional-dropdown">{t('conditionalDropdownLabel')}</label>
            <select id="conditional-dropdown" data-testid="conditional-dropdown"
              value={chosen} onChange={e => setChosen(e.target.value)}>
              <option value="">{t('conditionalDropdownPh')}</option>
              <option value="alpha">{t('conditionalOpt1')}</option>
              <option value="beta">{t('conditionalOpt2')}</option>
              <option value="gamma">{t('conditionalOpt3')}</option>
            </select>
          </div>

          <div className="form-field">
            <span className="field-label">{t('conditionalRadioLabel')}</span>
            <div className="cond-radio-group">
              {['alpha', 'beta', 'gamma'].map(val => (
                <label key={val} className="cond-radio-label"
                  htmlFor={`conditional-radio-${val}`}>
                  <input type="radio" name="conditional-radio"
                    id={`conditional-radio-${val}`}
                    data-testid={`conditional-radio-${val}`}
                    value={val} checked={radio === val}
                    onChange={() => setRadio(val)} />
                  {t(`conditionalRadio${val.charAt(0).toUpperCase() + val.slice(1)}`)}
                </label>
              ))}
            </div>
          </div>

          {(text || chosen || radio) && (
            <Output id="conditional-output">
              {t('conditionalOutput', { text: text || '—', select: chosen || '—', radio: radio || '—' })}
            </Output>
          )}
        </div>
      )}
    </section>
  )
}

// ─── 24. Delayed Widget ──────────────────────────────────────────────────────
// Loads 1–6 s after the page renders, like a slow backend call. ?delay=<ms>
// in the URL fixes the delay for deterministic test runs.
function pickDelay() {
  const override = Number.parseInt(new URLSearchParams(window.location.search).get('delay'), 10)
  if (Number.isFinite(override) && override >= 0) return override
  return 1000 + Math.floor(Math.random() * 5001)
}

const DELAYED_STATS = [
  { key: 'orders',  labelKey: 'statOrders',  value: '1,284' },
  { key: 'revenue', labelKey: 'statRevenue', value: '$48,920' },
  { key: 'users',   labelKey: 'statUsers',   value: '312' },
]

function DelayedWidgetSection() {
  const { t } = useLang()
  const [run, setRun]     = useState(0)
  const [delay, setDelay] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    const ms = pickDelay()
    setDelay(ms)
    setState('loading')
    const timer = setTimeout(() => setState('loaded'), ms)
    return () => clearTimeout(timer)
  }, [run])

  const loading = state === 'loading'

  return (
    <section id="sec-delayed" className="card">
      <SectionHeader num="24" title={t('sec24Title')} locator="data-state / data-testid" />
      <p className="desc">{t('sec24Desc')}</p>

      <div className="delayed-widget" data-testid="delayed-widget" data-state={state}
        data-delay-ms={delay ?? undefined} aria-busy={loading}>
        {loading ? (
          <div role="status" aria-live="polite">
            <div className="stats-grid">
              {DELAYED_STATS.map(s => (
                <div key={s.key} className="stat-card">
                  <span className="skeleton skeleton-label" />
                  <span className="skeleton skeleton-value" />
                </div>
              ))}
            </div>
            <p className="delayed-status">{t('delayedLoading')}</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              {DELAYED_STATS.map(s => (
                <div key={s.key} className="stat-card">
                  <span className="stat-label">{t(s.labelKey)}</span>
                  <span className="stat-value" data-testid={`stat-${s.key}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <p id="delayed-load-time" className="delayed-status">
              {t('delayedLoadedIn', { seconds: (delay / 1000).toFixed(1) })}
            </p>
          </>
        )}
      </div>

      <div className="button-row">
        <button id="btn-reload-widget" className="btn-secondary" disabled={loading}
          onClick={() => setRun(r => r + 1)}>{t('btnReloadWidget')}</button>
      </div>
    </section>
  )
}

// ─── 25. Ratings ─────────────────────────────────────────────────────────────
// Three builds of a star rating: native radio inputs, a custom role="slider"
// with half stars (hover previews, click commits, arrow keys step by 0.5), and
// a read-only display.
const STAR_VALUES = [1, 2, 3, 4, 5]
const READONLY_RATING = 3.5

function starFill(value, star) {
  if (value >= star) return 'full'
  if (value >= star - 0.5) return 'half'
  return 'empty'
}

function RatingsSection() {
  const { t, lang } = useLang()
  const [product, setProduct] = useState(0)
  const [half, setHalf]       = useState(0)
  const [hover, setHover]     = useState(null)
  const rtl = lang === 'ar'

  // The first half of a star (left in LTR, right in RTL) is worth n - 0.5.
  function valueFromPointer(e, star) {
    const rect = e.currentTarget.getBoundingClientRect()
    const fromStart = rtl ? rect.right - e.clientX : e.clientX - rect.left
    return fromStart < rect.width / 2 ? star - 0.5 : star
  }

  function handleKey(e) {
    const inc = rtl ? 'ArrowLeft' : 'ArrowRight'
    const dec = rtl ? 'ArrowRight' : 'ArrowLeft'
    let next = null
    if (e.key === inc || e.key === 'ArrowUp')        next = Math.min(5, half + 0.5)
    else if (e.key === dec || e.key === 'ArrowDown') next = Math.max(0, half - 0.5)
    else if (e.key === 'Home')                       next = 0
    else if (e.key === 'End')                        next = 5
    if (next === null) return
    e.preventDefault()
    setHalf(next)
  }

  const shown = hover ?? half

  return (
    <section id="sec-ratings" className="card">
      <SectionHeader num="25" title={t('sec25Title')} locator="name / role=slider / data-value" />
      <p className="desc">{t('sec25Desc')}</p>

      <fieldset className="rating-group">
        <legend className="field-label">{t('ratingProductLabel')}</legend>
        <div className="rating-stars">
          {STAR_VALUES.map(n => (
            <label key={n} htmlFor={`rating-star-${n}`} title={t('ratingStarN', { n })}>
              <input type="radio" className="visually-hidden" name="rating-product"
                id={`rating-star-${n}`} value={n} checked={product === n}
                onChange={() => setProduct(n)} />
              <span className="star" data-fill={starFill(product, n)} aria-hidden="true">★</span>
              <span className="visually-hidden">{t('ratingStarN', { n })}</span>
            </label>
          ))}
        </div>
        <div className="rating-row">
          <Output id="rating-product-output">
            {product ? t('ratingYouRated', { n: product }) : t('ratingNone')}
          </Output>
          <button id="rating-product-clear" className="btn-secondary" disabled={!product}
            onClick={() => setProduct(0)}>{t('ratingClear')}</button>
        </div>
      </fieldset>

      <div className="rating-group">
        <span className="field-label" id="rating-half-label">{t('ratingHalfLabel')}</span>
        <div className="rating-stars rating-half" role="slider" tabIndex={0}
          data-testid="rating-half" aria-labelledby="rating-half-label"
          aria-valuemin={0} aria-valuemax={5} aria-valuenow={half}
          aria-valuetext={t('ratingValueText', { n: half })}
          data-value={half} data-hover-value={hover ?? undefined}
          onKeyDown={handleKey} onMouseLeave={() => setHover(null)}>
          {STAR_VALUES.map(n => (
            <span key={n} className="star" data-star={n} data-fill={starFill(shown, n)}
              onMouseMove={e => setHover(valueFromPointer(e, n))}
              onClick={e => setHalf(valueFromPointer(e, n))}>★</span>
          ))}
        </div>
        <div className="rating-row">
          <Output id="rating-half-output">
            {hover !== null
              ? t('ratingPreview', { n: hover })
              : half ? t('ratingYouRated', { n: half }) : t('ratingNone')}
          </Output>
          <button id="rating-half-clear" className="btn-secondary" disabled={!half}
            onClick={() => setHalf(0)}>{t('ratingClear')}</button>
        </div>
      </div>

      <div className="rating-group">
        <span className="field-label">{t('ratingReadonlyLabel')}</span>
        <div className="rating-row">
          <div className="rating-stars rating-readonly" role="img" data-testid="rating-readonly"
            data-value={READONLY_RATING} aria-label={t('ratingValueText', { n: READONLY_RATING })}>
            {STAR_VALUES.map(n => (
              <span key={n} className="star" data-fill={starFill(READONLY_RATING, n)} aria-hidden="true">★</span>
            ))}
          </div>
          <span className="rating-count">{t('ratingReviews', { n: READONLY_RATING, count: 128 })}</span>
        </div>
      </div>
    </section>
  )
}

// ─── 26. Progress Bar ────────────────────────────────────────────────────────
// A determinate bar that fills in random steps (it can be set to stall at 60%
// and then fail), and an indeterminate bar with no aria-valuenow while it runs.
// Wait on aria-valuenow / data-state, never on a fixed sleep.
const PROGRESS_STATUS_KEYS = {
  idle:      'progressIdle',
  running:   'progressRunning',
  complete:  'progressComplete',
  failed:    'progressFailed',
  cancelled: 'progressCancelled',
}

function ProgressSection() {
  const { t } = useLang()
  const [pct, setPct]           = useState(0)
  const [state, setState]       = useState('idle')
  const [failAt60, setFailAt60] = useState(false)
  const [task, setTask]         = useState('idle')
  const timer     = useRef(null)
  const taskTimer = useRef(null)

  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(taskTimer.current) }, [])

  function step(value, fail) {
    if (value >= 100) { setState('complete'); return }
    if (fail && value >= 60) {
      timer.current = setTimeout(() => setState('failed'), 2000)
      return
    }
    timer.current = setTimeout(() => {
      let next = Math.min(100, value + 3 + Math.floor(Math.random() * 10))
      if (fail) next = Math.min(next, 60)
      setPct(next)
      step(next, fail)
    }, 150 + Math.floor(Math.random() * 150))
  }

  function start() {
    clearTimeout(timer.current)
    setPct(0)
    setState('running')
    step(0, failAt60)
  }

  function cancel() {
    clearTimeout(timer.current)
    setState('cancelled')
  }

  function startTask() {
    setTask('running')
    taskTimer.current = setTimeout(() => setTask('done'), 2000 + Math.floor(Math.random() * 2001))
  }

  const running = state === 'running'

  return (
    <section id="sec-progress" className="card">
      <SectionHeader num="26" title={t('sec26Title')} locator="role=progressbar / aria-valuenow" />
      <p className="desc">{t('sec26Desc')}</p>

      <div className="progress-block">
        <div className="progress-head">
          <span className="field-label" id="progress-upload-label">{t('progressUploadLabel')}</span>
          <span id="progress-upload-pct" className="progress-pct">{pct}%</span>
        </div>
        <div id="progress-upload" className="progress-track" role="progressbar"
          aria-labelledby="progress-upload-label" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={pct} data-state={state}>
          <div className="progress-fill" style={{ inlineSize: `${pct}%` }} />
        </div>
        <p id="progress-upload-status" className="progress-status" data-state={state} role="status">
          {t(PROGRESS_STATUS_KEYS[state])}
        </p>
      </div>

      <label className="checkbox-label" htmlFor="progress-fail-toggle">
        <input type="checkbox" id="progress-fail-toggle" checked={failAt60} disabled={running}
          onChange={e => setFailAt60(e.target.checked)} />
        {t('progressFailToggle')}
      </label>

      <div className="button-row">
        <button id="progress-start" className="btn-primary" disabled={running} onClick={start}>
          {state === 'idle' ? t('progressStart') : t('progressRestart')}
        </button>
        <button id="progress-cancel" className="btn-secondary" disabled={!running} onClick={cancel}>
          {t('progressCancel')}
        </button>
      </div>

      <div className="progress-block">
        <span className="field-label" id="progress-task-label">{t('progressTaskLabel')}</span>
        <div id="progress-indeterminate" className="progress-track progress-indeterminate"
          role="progressbar" aria-labelledby="progress-task-label"
          aria-valuemin={task === 'done' ? 0 : undefined}
          aria-valuemax={task === 'done' ? 100 : undefined}
          aria-valuenow={task === 'done' ? 100 : undefined}
          aria-busy={task === 'running'} data-state={task}>
          {task !== 'idle' && <div className="progress-fill" />}
        </div>
        <p id="progress-task-status" className="progress-status" data-state={task} role="status">
          {t(task === 'done' ? 'progressTaskDone' : task === 'running' ? 'progressTaskRunning' : 'progressIdle')}
        </p>
      </div>

      <div className="button-row">
        <button id="progress-task-start" className="btn-secondary" disabled={task === 'running'}
          onClick={startTask}>{t('progressTaskStart')}</button>
      </div>
    </section>
  )
}

// ─── 27. Stepper ─────────────────────────────────────────────────────────────
// A 4-step wizard. Next checks the current step before moving on; earlier steps
// stay clickable to go back, later ones are disabled. Values are kept when
// moving back and forth.
const STEPS = [
  { key: 'account', labelKey: 'stepAccount' },
  { key: 'address', labelKey: 'stepAddress' },
  { key: 'prefs',   labelKey: 'stepPrefs' },
  { key: 'review',  labelKey: 'stepReview' },
]
const STEPPER_COUNTRIES = ['in', 'ae', 'gb', 'us']
const STEPPER_EMPTY = { name: '', email: '', city: '', country: '', contact: '', newsletter: false }

function validateStep(step, v) {
  const errors = {}
  if (step === 0) {
    if (!v.name.trim()) errors.name = 'stepErrName'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'stepErrEmail'
  } else if (step === 1) {
    if (!v.city.trim()) errors.city = 'stepErrCity'
    if (!v.country)     errors.country = 'stepErrCountry'
  } else if (step === 2) {
    if (!v.contact) errors.contact = 'stepErrContact'
  }
  return errors
}

function StepperSection() {
  const { t } = useLang()
  const [step, setStep]           = useState(0)
  const [values, setValues]       = useState(STEPPER_EMPTY)
  const [errors, setErrors]       = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key, value) => setValues(v => ({ ...v, [key]: value }))

  function goTo(i) { setErrors({}); setStep(i) }

  function next() {
    const errs = validateStep(step, values)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep(step + 1)
  }

  function reset() {
    setValues(STEPPER_EMPTY)
    setErrors({})
    setSubmitted(false)
    setStep(0)
  }

  const err = key => errors[key] && (
    <span id={`stepper-error-${key}`} className="error-msg">{t(errors[key])}</span>
  )

  const review = [
    { key: 'name',       value: values.name },
    { key: 'email',      value: values.email },
    { key: 'city',       value: values.city },
    { key: 'country',    value: values.country && t(`country_${values.country}`) },
    { key: 'contact',    value: values.contact && t(`stepContact_${values.contact}`) },
    { key: 'newsletter', value: t(values.newsletter ? 'stepYes' : 'stepNo') },
  ]

  return (
    <section id="sec-stepper" className="card">
      <SectionHeader num="27" title={t('sec27Title')} locator="data-step / aria-current" />
      <p className="desc">{t('sec27Desc')}</p>

      <ol className="stepper" aria-label={t('stepperAria')}>
        {STEPS.map((s, i) => {
          const state = submitted || i < step ? 'complete' : i === step ? 'active' : 'upcoming'
          return (
            <li key={s.key} className="stepper-item" data-step={i + 1} data-state={state}>
              <button type="button" className="stepper-btn" data-testid={`stepper-step-${i + 1}`}
                aria-current={state === 'active' ? 'step' : undefined}
                disabled={submitted || i >= step} onClick={() => goTo(i)}>
                <span className="stepper-dot">{state === 'complete' ? '✓' : i + 1}</span>
                <span className="stepper-label">{t(s.labelKey)}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {submitted ? (
        <div className="stepper-panel">
          <p id="stepper-result" className="success-msg">{t('stepSubmitted', { name: values.name })}</p>
          <div className="button-row">
            <button id="stepper-reset" className="btn-secondary" onClick={reset}>{t('stepStartOver')}</button>
          </div>
        </div>
      ) : (
        <div className="stepper-panel" data-testid="stepper-panel" data-step={step + 1}>
          {step === 0 && (
            <>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-name">{t('stepName')}</label>
                <input id="stepper-name" type="text" value={values.name}
                  className={errors.name ? 'input-error' : ''}
                  onChange={e => set('name', e.target.value)} />
                {err('name')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-email">{t('stepEmail')}</label>
                <input id="stepper-email" type="text" value={values.email}
                  className={errors.email ? 'input-error' : ''}
                  onChange={e => set('email', e.target.value)} />
                {err('email')}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-city">{t('stepCity')}</label>
                <input id="stepper-city" type="text" value={values.city}
                  className={errors.city ? 'input-error' : ''}
                  onChange={e => set('city', e.target.value)} />
                {err('city')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-country">{t('stepCountry')}</label>
                <select id="stepper-country" value={values.country}
                  onChange={e => set('country', e.target.value)}>
                  <option value="">{t('stepCountryPh')}</option>
                  {STEPPER_COUNTRIES.map(c => <option key={c} value={c}>{t(`country_${c}`)}</option>)}
                </select>
                {err('country')}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-field">
                <span className="field-label">{t('stepContact')}</span>
                <div className="cond-radio-group">
                  {['email', 'sms'].map(c => (
                    <label key={c} className="cond-radio-label" htmlFor={`stepper-contact-${c}`}>
                      <input type="radio" name="stepper-contact" id={`stepper-contact-${c}`}
                        value={c} checked={values.contact === c}
                        onChange={() => set('contact', c)} />
                      {t(`stepContact_${c}`)}
                    </label>
                  ))}
                </div>
                {err('contact')}
              </div>
              <label className="checkbox-label" htmlFor="stepper-newsletter">
                <input type="checkbox" id="stepper-newsletter" checked={values.newsletter}
                  onChange={e => set('newsletter', e.target.checked)} />
                {t('stepNewsletter')}
              </label>
            </>
          )}

          {step === 3 && (
            <dl id="stepper-review" className="stepper-review">
              {review.map(r => (
                <div key={r.key} className="stepper-review-row">
                  <dt>{t(`stepReview_${r.key}`)}</dt>
                  <dd data-field={r.key}>{r.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="button-row">
            <button id="stepper-back" className="btn-secondary" disabled={step === 0}
              onClick={() => goTo(step - 1)}>{t('stepBack')}</button>
            {step < STEPS.length - 1
              ? <button id="stepper-next" className="btn-primary" onClick={next}>{t('stepNext')}</button>
              : <button id="stepper-submit" className="btn-success" onClick={() => setSubmitted(true)}>{t('stepSubmit')}</button>}
          </div>
        </div>
      )}
    </section>
  )
}

// ─── 28. Signature Pad ───────────────────────────────────────────────────────
// A canvas has no DOM content to assert on, so the pad exposes data-empty and
// data-strokes. Draws with pointer events (mouse, touch or pen). Save rejects
// ink shorter than SIGNATURE_MIN_LENGTH canvas px, so a single click is not a
// signature.
const SIGNATURE_MIN_LENGTH = 60

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

function inkLength(strokes) {
  let total = 0
  strokes.forEach(s => {
    for (let i = 1; i < s.length; i++) total += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1])
  })
  return total
}

function SignatureSection() {
  const { t } = useLang()
  const canvasRef = useRef(null)
  const current   = useRef(null)
  const [strokes, setStrokes] = useState([])
  const [saved, setSaved]     = useState(null)
  const [error, setError]     = useState('')

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

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'sec-text',        labelKey: 'navTextInput',        groupKey: 'navInputs' },
  { id: 'sec-password',    labelKey: 'navPasswordTextarea', groupKey: 'navInputs' },
  { id: 'sec-date',        labelKey: 'navDatePicker',       groupKey: 'navInputs' },
  { id: 'sec-slider',      labelKey: 'navSlider',           groupKey: 'navInputs' },
  { id: 'sec-file',        labelKey: 'navFileUpload',       groupKey: 'navInputs' },
  { id: 'sec-form',        labelKey: 'navFormValidation',   groupKey: 'navInputs' },
  { id: 'sec-checkbox',    labelKey: 'navCheckboxes',       groupKey: 'navSelection' },
  { id: 'sec-radio',       labelKey: 'navRadioGroup',       groupKey: 'navSelection' },
  { id: 'sec-dropdown',    labelKey: 'navDropdownTags',     groupKey: 'navSelection' },
  { id: 'sec-ratings',     labelKey: 'navRatings',          groupKey: 'navSelection' },
  { id: 'sec-counter',     labelKey: 'navClickCounter',     groupKey: 'navButtons' },
  { id: 'sec-dblclick',    labelKey: 'navDoubleClick',      groupKey: 'navButtons' },
  { id: 'sec-dynamic',     labelKey: 'navDynamicButtons',   groupKey: 'navButtons' },
  { id: 'sec-hover',       labelKey: 'navMouseHover',       groupKey: 'navEvents' },
  { id: 'sec-focus',       labelKey: 'navFocusBlur',        groupKey: 'navEvents' },
  { id: 'sec-dragdrop',    labelKey: 'navDragDrop',         groupKey: 'navEvents' },
  { id: 'sec-signature',   labelKey: 'navSignature',        groupKey: 'navEvents' },
  { id: 'sec-popups',      labelKey: 'navBrowserPopups',    groupKey: 'navWindows' },
  { id: 'sec-windows',     labelKey: 'navLinksWindows',     groupKey: 'navWindows' },
  { id: 'sec-popup-alerts',labelKey: 'navPopupAlerts',      groupKey: 'navWindows' },
  { id: 'sec-shadow',      labelKey: 'navShadowDOM',        groupKey: 'navAdvanced' },
  { id: 'sec-table',       labelKey: 'navPaginationTable',  groupKey: 'navAdvanced', subGroupKey: 'navDataTables' },
  { id: 'sec-toggle',      labelKey: 'navShowHide',         groupKey: 'navAdvanced' },
  { id: 'sec-conditional', labelKey: 'navConditionalFields', groupKey: 'navAdvanced' },
  { id: 'sec-delayed',     labelKey: 'navDelayedWidget',     groupKey: 'navAdvanced' },
  { id: 'sec-progress',    labelKey: 'navProgressBar',       groupKey: 'navAdvanced' },
  { id: 'sec-stepper',     labelKey: 'navStepper',           groupKey: 'navAdvanced' },
]

const GROUP_KEYS = ['navInputs', 'navSelection', 'navButtons', 'navEvents', 'navWindows', 'navAdvanced']

function Sidebar({ active, onPlaygroundItem }) {
  const { t, lang, toggleLang } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(GROUP_KEYS.map(g => [g, true]))
  )
  const [openSubGroups, setOpenSubGroups] = useState({})

  const toggleGroup = g => setOpenGroups(s => ({ ...s, [g]: !s[g] }))
  const toggleSubGroup = sg => setOpenSubGroups(s => ({ ...s, [sg]: !s[sg] }))

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">TP</span>
        <span>{t('appName')}</span>
      </div>
      <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language">
        {t('langToggle')}
      </button>

      <NavLink
        to="/petstore"
        className={({ isActive }) => `nav-petstore-cta ${isActive ? 'is-active' : ''}`}
        data-testid="nav-test-pet-store"
      >
        <span className="nav-petstore-icon" aria-hidden>🐾</span>
        <span className="nav-petstore-label">{t('navTestPetStore')}</span>
      </NavLink>

      <NavLink
        to="/media"
        className={({ isActive }) => `nav-petstore-cta nav-media-cta ${isActive ? 'is-active' : ''}`}
        data-testid="nav-media"
      >
        <span className="nav-petstore-icon" aria-hidden>🎬</span>
        <span className="nav-petstore-label">{t('navMedia')}</span>
      </NavLink>

      <NavLink
        to="/frames"
        className={({ isActive }) => `nav-petstore-cta nav-frames-cta ${isActive ? 'is-active' : ''}`}
        data-testid="nav-frames"
      >
        <span className="nav-petstore-icon" aria-hidden>🪟</span>
        <span className="nav-petstore-label">{t('navFrames')}</span>
      </NavLink>

      <NavLink
        to="/spreadsheet"
        className={({ isActive }) => `nav-petstore-cta nav-spreadsheet-cta ${isActive ? 'is-active' : ''}`}
        data-testid="nav-spreadsheet"
      >
        <span className="nav-petstore-icon" aria-hidden>📊</span>
        <span className="nav-petstore-label">{t('navSpreadsheet')}</span>
      </NavLink>

      <NavLink
        to="/verification"
        className={({ isActive }) => `nav-petstore-cta nav-verification-cta ${isActive ? 'is-active' : ''}`}
        data-testid="nav-verification"
      >
        <span className="nav-petstore-icon" aria-hidden>🛡️</span>
        <span className="nav-petstore-label">{t('navVerification')}</span>
      </NavLink>

      {GROUP_KEYS.map(gKey => {
        const groupItems  = NAV.filter(n => n.groupKey === gKey)
        const subGroupKeys = [...new Set(groupItems.filter(n => n.subGroupKey).map(n => n.subGroupKey))]
        const directItems  = groupItems.filter(n => !n.subGroupKey)
        const isOpen = openGroups[gKey]

        return (
          <div key={gKey} className="nav-group">
            <button className="nav-group-label" onClick={() => toggleGroup(gKey)}>
              <span>{t(gKey)}</span>
              <span className={`nav-chevron ${isOpen ? 'nav-chevron-open' : ''}`}>›</span>
            </button>
            {isOpen && (
              <>
                {directItems.map(n => (
                  <button key={n.id}
                    className={`nav-item ${active === n.id ? 'nav-active' : ''}`}
                    onClick={() => onPlaygroundItem(n.id)}>
                    {t(n.labelKey)}
                  </button>
                ))}
                {subGroupKeys.map(sgKey => {
                  const sgOpen = openSubGroups[sgKey]
                  return (
                    <div key={sgKey} className="nav-subgroup">
                      <button className="nav-subgroup-label" onClick={() => toggleSubGroup(sgKey)}>
                        <span className="nav-subgroup-icon">⊞</span>
                        <span>{t(sgKey)}</span>
                        <span className={`nav-chevron ${sgOpen ? 'nav-chevron-open' : ''}`}>›</span>
                      </button>
                      {sgOpen && groupItems
                        .filter(n => n.subGroupKey === sgKey)
                        .map(n => (
                          <button key={n.id}
                            className={`nav-item nav-item-nested ${active === n.id ? 'nav-active' : ''}`}
                            onClick={() => onPlaygroundItem(n.id)}>
                            <span className="nav-item-dot" />
                            {t(n.labelKey)}
                          </button>
                        ))
                      }
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )
      })}

      <div className="sidebar-account" data-testid="sidebar-account">
        {user ? (
          <>
            <NavLink to="/account" className="sidebar-account-user" data-testid="sidebar-account-link">
              <span className="sidebar-account-avatar" aria-hidden>
                {(user.name || '?').charAt(0).toUpperCase()}
              </span>
              <span className="sidebar-account-name">{user.name}</span>
            </NavLink>
            <button
              className="sidebar-account-logout"
              onClick={handleLogout}
              data-testid="sidebar-logout"
            >
              {t('authLogout')}
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="sidebar-account-login" data-testid="sidebar-login-link">
              {t('authLogin')}
            </NavLink>
            <NavLink to="/signup" className="sidebar-account-signup" data-testid="sidebar-signup-link">
              {t('authSignup')}
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

// ─── Playground (the original 22-section page) ────────────────────────────────
function Playground({ contentRef, setActive }) {
  const { t } = useLang()
  const location = useLocation()

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new IntersectionObserver(
      entries => {
        const hit = entries.find(e => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { root: content, threshold: 0.25, rootMargin: '-10% 0px -55% 0px' }
    )
    NAV.forEach(n => { const el = document.getElementById(n.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [contentRef, setActive])

  // Scroll to hash on mount (when navigated from another route with /#sec-id).
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  return (
    <>
      <div className="content-grid">
        <TextInputSection />
        <PasswordTextareaSection />
        <DatePickerSection />
        <SliderSection />
        <FileUploadSection />
        <FormValidationSection />
        <CheckboxSection />
        <RadioSection />
        <DropdownSection />
        <ClickCounterSection />
        <DoubleClickSection />
        <DynamicButtonsSection />
        <HoverSection />
        <FocusBlurSection />
        <DragDropSection />
        <PopupsSection />
        <LinksWindowsSection />
        <ShadowDOMSection />
        <PaginationTableSection />
        <ShowHideSection />
        <PopupAlertsSection />
        <ConditionalFieldsSection />
        <DelayedWidgetSection />
        <RatingsSection />
        <ProgressSection />
        <StepperSection />
        <SignatureSection />
      </div>
      <footer className="site-footer">
        <span className="footer-copy">© 2026 Srujana Deva · {t('footerRights')}</span>
        <span className="footer-wit">{t('footerWit')}</span>
      </footer>
    </>
  )
}

// ─── Shell (sidebar + routed main) ────────────────────────────────────────────
function Shell() {
  const { lang } = useLang()
  const [active, setActive] = useState('sec-text')
  const contentRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  function handlePlaygroundItem(id) {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate(`/#${id}`)
    }
  }

  return (
    <div className="layout" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar active={active} onPlaygroundItem={handlePlaygroundItem} />
      <main className="content" ref={contentRef}>
        <Routes>
          <Route index element={<Playground contentRef={contentRef} setActive={setActive} />} />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="petstore"
            element={
              <ProtectedRoute>
                <PetstorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="media"
            element={
              <ProtectedRoute>
                <MediaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="frames"
            element={
              <ProtectedRoute>
                <FramesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="spreadsheet"
            element={
              <ProtectedRoute>
                <SpreadsheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="verification"
            element={
              <ProtectedRoute>
                <VerificationPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Shell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </LanguageProvider>
  )
}
