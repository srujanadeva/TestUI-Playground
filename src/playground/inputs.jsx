// Playground sections 01–06 (sidebar group "Inputs"): text, password and textarea,
// date pickers, range sliders, file upload and form validation.
import { useState, useRef } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// ─── 01. Text Input ──────────────────────────────────────────────────────────
/** A name field and a Greet button that writes a greeting below. */
export function TextInputSection() {
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
/** A password field with show/hide, and a textarea with a live character count. */
export function PasswordTextareaSection() {
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
/** A single native date input and a from/to range; values are shown as YYYY-MM-DD. */
export function DatePickerSection() {
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
/** Two 0–100 range sliders; the second sets a preview box's opacity. */
export function SliderSection() {
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
/**
 * A drop zone (or click to browse) over a hidden multi-file input. Lists the chosen
 * files' names and sizes; nothing is uploaded.
 */
export function FileUploadSection() {
  const { t } = useLang()
  const [files, setFiles]         = useState([])
  const [draggingOver, setDraggingOver] = useState(false)
  const inputRef                  = useRef(null)

  // Each new pick or drop replaces the list rather than adding to it.
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
/**
 * Email, phone and password fields checked on Submit: the email needs an "@",
 * the phone exactly 10 digits, the password 8+ characters. Errors appear under each field.
 */
export function FormValidationSection() {
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

  // Returns the onChange handler for one field; any edit hides the success message.
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
