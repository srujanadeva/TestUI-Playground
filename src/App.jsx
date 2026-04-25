import { useState, useEffect, useRef } from 'react'

// ─── Shared UI ────────────────────────────────────────────────────────────────
function SectionHeader({ num, title, locator }) {
  return (
    <div className="section-header">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="locator-badge">{locator}</span>
    </div>
  )
}

function Output({ id, children }) {
  return <p id={id} className="output">{children}</p>
}

// ─── 01. Text Input ──────────────────────────────────────────────────────────
function TextInputSection() {
  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('')
  return (
    <section id="sec-text" className="card">
      <SectionHeader num="01" title="Text Input" locator="id" />
      <p className="desc">Type a name and click Greet.</p>
      <div className="input-row">
        <input id="first-name-input" type="text" placeholder="Enter your name"
          value={name} onChange={e => setName(e.target.value)} />
        <button id="greet-btn"
          onClick={() => setGreeting(`Hello, ${name || 'stranger'}!`)}>Greet</button>
      </div>
      {greeting && <Output id="greeting-output">{greeting}</Output>}
    </section>
  )
}

// ─── 02. Password & Textarea ─────────────────────────────────────────────────
function PasswordTextareaSection() {
  const [pass, setPass] = useState('')
  const [note, setNote] = useState('')
  const [shown, setShown] = useState(false)
  return (
    <section id="sec-password" className="card">
      <SectionHeader num="02" title="Password & Textarea" locator="id / className" />
      <p className="desc">Password with show/hide toggle. Textarea for multi-line input.</p>
      <div className="input-row">
        <input id="password-input" type={shown ? 'text' : 'password'}
          placeholder="Enter password" value={pass} onChange={e => setPass(e.target.value)} />
        <button className="btn-secondary" id="toggle-password-btn"
          onClick={() => setShown(s => !s)}>{shown ? 'Hide' : 'Show'}</button>
      </div>
      <textarea id="notes-textarea" className="notes-textarea"
        placeholder="Enter notes here…" rows={3}
        value={note} onChange={e => setNote(e.target.value)} />
      {note && <Output id="textarea-char-count">Characters: {note.length}</Output>}
    </section>
  )
}

// ─── 03. Date Picker ─────────────────────────────────────────────────────────
function DatePickerSection() {
  const [date, setDate] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  return (
    <section id="sec-date" className="card">
      <SectionHeader num="03" title="Date Picker" locator="id" />
      <p className="desc">Single date and date-range inputs.</p>
      <label className="field-label" htmlFor="single-date">Single date</label>
      <input id="single-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
      {date && <Output id="selected-date">Selected: {date}</Output>}
      <div className="date-range">
        <div>
          <label className="field-label" htmlFor="range-from">From</label>
          <input id="range-from" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="range-to">To</label>
          <input id="range-to" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>
      {from && to && <Output id="date-range-output">Range: {from} → {to}</Output>}
    </section>
  )
}

// ─── 04. Range Slider ────────────────────────────────────────────────────────
function SliderSection() {
  const [qty, setQty]             = useState(50)
  const [brightness, setBrightness] = useState(70)
  return (
    <section id="sec-slider" className="card">
      <SectionHeader num="04" title="Range Slider" locator="id" />
      <p className="desc">Numeric sliders for continuous values.</p>
      <div className="slider-group">
        <label className="field-label" htmlFor="qty-slider">
          Quantity: <strong>{qty}</strong>
        </label>
        <input id="qty-slider" type="range" min={0} max={100} value={qty}
          onChange={e => setQty(Number(e.target.value))} />
      </div>
      <div className="slider-group">
        <label className="field-label" htmlFor="brightness-slider">
          Brightness: <strong>{brightness}%</strong>
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
      <SectionHeader num="05" title="File Upload" locator="id" />
      <p className="desc">Click to browse or drag-and-drop files onto the zone.</p>
      <div
        className={`drop-zone ${draggingOver ? 'drop-active' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDraggingOver(true) }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={e => { e.preventDefault(); setDraggingOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <div className="drop-icon">&#8679;</div>
        <p>Drop files here or <span className="link-text">browse</span></p>
        <p className="drop-hint">Accepts: PDF, PNG, JPG, CSV, XLSX</p>
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
  const [form, setForm]   = useState({ email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [ok, setOk]       = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.includes('@'))         e.email    = 'Enter a valid email address'
    if (!/^\d{10}$/.test(form.phone))      e.phone    = 'Phone must be exactly 10 digits'
    if (form.password.length < 8)          e.password = 'Password must be at least 8 characters'
    return e
  }

  const submit = () => {
    const e = validate()
    setErrors(e)
    setOk(Object.keys(e).length === 0)
  }

  const set = key => e => { setForm(f => ({ ...f, [key]: e.target.value })); setOk(false) }

  return (
    <section id="sec-form" className="card">
      <SectionHeader num="06" title="Form Validation" locator="placeholder / aria-label" />
      <p className="desc">Multi-field form with inline validation messages.</p>
      {[
        { key: 'email',    label: 'Email',    id: 'val-email',    type: 'text',     ph: 'your@email.com',   aria: 'Email address' },
        { key: 'phone',    label: 'Phone',    id: 'val-phone',    type: 'text',     ph: '10-digit number',  aria: 'Phone number' },
        { key: 'password', label: 'Password', id: 'val-password', type: 'password', ph: 'Min 8 characters', aria: 'Password' },
      ].map(f => (
        <div key={f.key} className="form-field">
          <label className="field-label" htmlFor={f.id}>{f.label}</label>
          <input id={f.id} type={f.type} placeholder={f.ph} aria-label={f.aria}
            value={form[f.key]} onChange={set(f.key)}
            className={errors[f.key] ? 'input-error' : ''} />
          {errors[f.key] && <span id={`${f.key}-error`} className="error-msg">{errors[f.key]}</span>}
        </div>
      ))}
      <button id="validate-submit-btn" onClick={submit}>Submit</button>
      {ok && <span id="form-success" className="success-msg">Form submitted successfully!</span>}
    </section>
  )
}

// ─── 07. Checkboxes ──────────────────────────────────────────────────────────
const SKILLS = ['JavaScript', 'Python', 'Java', 'Rust', 'Go', 'TypeScript']

function CheckboxSection() {
  const [selected, setSelected] = useState([])
  const toggle = v => setSelected(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])
  return (
    <section id="sec-checkbox" className="card">
      <SectionHeader num="07" title="Checkboxes" locator="label[for]" />
      <p className="desc">Multi-select using labeled checkboxes.</p>
      <div className="checkbox-grid">
        {SKILLS.map(s => (
          <label key={s} className="checkbox-label" htmlFor={`cb-${s.toLowerCase()}`}>
            <input type="checkbox" id={`cb-${s.toLowerCase()}`}
              checked={selected.includes(s)} onChange={() => toggle(s)} />
            {s}
          </label>
        ))}
      </div>
      <Output id="checkbox-summary">
        {selected.length === 0 ? 'Nothing selected' : `Selected: ${selected.join(', ')}`}
      </Output>
    </section>
  )
}

// ─── 08. Radio Group ─────────────────────────────────────────────────────────
const PLANS = [
  { id: 'plan-free',       value: 'Free',       price: '$0/mo',  desc: 'Basic features' },
  { id: 'plan-pro',        value: 'Pro',        price: '$12/mo', desc: 'Advanced tools' },
  { id: 'plan-enterprise', value: 'Enterprise', price: '$49/mo', desc: 'Full access' },
]

function RadioSection() {
  const [plan, setPlan] = useState('')
  return (
    <section id="sec-radio" className="card">
      <SectionHeader num="08" title="Radio Group" locator="name" />
      <p className="desc">Single selection via radio buttons.</p>
      <div className="radio-cards">
        {PLANS.map(p => (
          <label key={p.id} htmlFor={p.id}
            className={`radio-card ${plan === p.value ? 'radio-selected' : ''}`}>
            <input type="radio" id={p.id} name="plan-type" value={p.value}
              checked={plan === p.value} onChange={() => setPlan(p.value)} />
            <div className="radio-card-body">
              <strong>{p.value}</strong>
              <span className="radio-price">{p.price}</span>
              <small>{p.desc}</small>
            </div>
          </label>
        ))}
      </div>
      {plan && <Output id="selected-plan">Selected: <strong>{plan}</strong></Output>}
    </section>
  )
}

// ─── 09. Dropdown & Multi-Select ─────────────────────────────────────────────
const COUNTRIES = ['Australia', 'Germany', 'India', 'Japan', 'United Kingdom', 'United States']
const TAG_LIST  = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Testing', 'Design']

function DropdownSection() {
  const [country, setCountry] = useState('')
  const [tags, setTags]       = useState([])
  const toggleTag = t => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  return (
    <section id="sec-dropdown" className="card">
      <SectionHeader num="09" title="Dropdown & Tags" locator="id" />
      <p className="desc">Native select and a custom tag multi-select.</p>
      <label className="field-label" htmlFor="country-select">Country</label>
      <select id="country-select" value={country} onChange={e => setCountry(e.target.value)}>
        <option value="">-- Select a country --</option>
        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {country && <Output id="selected-country">Country: <strong>{country}</strong></Output>}
      <label className="field-label">Skills (multi-select)</label>
      <div id="tag-selector" className="tag-selector">
        {TAG_LIST.map(t => (
          <button key={t} type="button" data-tag={t}
            className={`tag-btn ${tags.includes(t) ? 'tag-active' : ''}`}
            onClick={() => toggleTag(t)}>{t}</button>
        ))}
      </div>
      {tags.length > 0 && <Output id="selected-tags">Tags: {tags.join(', ')}</Output>}
    </section>
  )
}

// ─── 10. Click Counter ───────────────────────────────────────────────────────
function ClickCounterSection() {
  const [counts, setCounts] = useState({ primary: 0, success: 0, danger: 0 })
  const inc = key => setCounts(c => ({ ...c, [key]: c[key] + 1 }))
  const reset = () => setCounts({ primary: 0, success: 0, danger: 0 })
  const total = counts.primary + counts.success + counts.danger
  return (
    <section id="sec-counter" className="card">
      <SectionHeader num="10" title="Button Click Counter" locator="className" />
      <p className="desc">Three independently tracked buttons. Verify counts in assertions.</p>
      <div className="button-row">
        <button className="btn-primary"   onClick={() => inc('primary')}>Primary</button>
        <button className="btn-success"   onClick={() => inc('success')}>Success</button>
        <button className="btn-danger"    onClick={() => inc('danger')}>Danger</button>
        <button className="btn-secondary" onClick={reset}>Reset</button>
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
  const [log, setLog] = useState([])
  const add = msg => setLog(l => [msg, ...l].slice(0, 4))
  return (
    <section id="sec-dblclick" className="card">
      <SectionHeader num="11" title="Double Click" locator="data-testid" />
      <p className="desc">Single-click, double-click, and right-click are distinct events.</p>
      <div
        className="click-area"
        data-testid="click-area"
        onClick={() => add('single click')}
        onDoubleClick={() => add('double click')}
        onContextMenu={e => { e.preventDefault(); add('right click') }}
      >
        <span className="click-area-text">Click · Double-Click · Right-Click here</span>
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
      <SectionHeader num="12" title="Dynamic Buttons" locator="id / data-dynamic-id" />
      <p className="desc">Buttons that change state, appear, and disappear at runtime.</p>
      <div className="button-row">
        <button id="btn-load" onClick={simulateLoad} disabled={loading}
          className={loadDone ? 'btn-success' : 'btn-primary'}>
          {loading ? 'Loading…' : loadDone ? 'Done!' : 'Start Loading'}
        </button>
        {visible
          ? <button id="btn-disappear" className="btn-warning" onClick={() => setVisible(false)}>Disappear</button>
          : <button id="btn-reappear"  className="btn-success" onClick={() => setVisible(true)}>Reappear</button>
        }
        <button id="btn-add-dynamic" className="btn-secondary"
          onClick={() => setExtras(e => [...e, Date.now()])}>Add Button</button>
      </div>
      {extras.length > 0 && (
        <div className="extra-buttons">
          {extras.map(id => (
            <button key={id} data-dynamic-id={id} className="btn-extra"
              onClick={() => setExtras(e => e.filter(x => x !== id))}>
              × Remove ({String(id).slice(-4)})
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 13. Mouse Hover ─────────────────────────────────────────────────────────
const HOVER_CARDS = [
  { id: 'hover-info',    label: 'Info',    tip: 'Tooltip: information message',  color: '#3b82f6' },
  { id: 'hover-warn',    label: 'Warning', tip: 'Tooltip: something needs attention', color: '#f59e0b' },
  { id: 'hover-success', label: 'Success', tip: 'Tooltip: action was successful', color: '#10b981' },
  { id: 'hover-danger',  label: 'Danger',  tip: 'Tooltip: destructive action',   color: '#ef4444' },
]

function HoverSection() {
  const [active, setActive] = useState(null)
  return (
    <section id="sec-hover" className="card">
      <SectionHeader num="13" title="Mouse Hover" locator="data-testid" />
      <p className="desc">Hover over a card to reveal its tooltip.</p>
      <div className="hover-cards">
        {HOVER_CARDS.map(c => (
          <div key={c.id} data-testid={c.id} className="hover-card"
            style={{ '--hc': c.color }}
            onMouseEnter={() => setActive(c.id)}
            onMouseLeave={() => setActive(null)}>
            <span className="hover-card-label">{c.label}</span>
            {active === c.id && (
              <div data-testid={`${c.id}-tooltip`} className="hover-tooltip">{c.tip}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 14. Focus / Blur ────────────────────────────────────────────────────────
function FocusBlurSection() {
  const [events, setEvents] = useState([])
  const [active, setActive] = useState('')
  const log = (field, type) => {
    setEvents(e => [`${field} → ${type}`, ...e].slice(0, 5))
    setActive(type === 'focus' ? field : '')
  }
  return (
    <section id="sec-focus" className="card">
      <SectionHeader num="14" title="Focus / Blur" locator="id" />
      <p className="desc">Tab through fields — focus and blur events are captured.</p>
      {['Username', 'Email', 'Comment'].map(f => (
        <div key={f} className="form-field">
          <label className="field-label" htmlFor={`focus-${f.toLowerCase()}`}>{f}</label>
          <input id={`focus-${f.toLowerCase()}`} type="text"
            placeholder={`Click to focus ${f}`}
            className={active === f ? 'input-focused' : ''}
            onFocus={() => log(f, 'focus')}
            onBlur={() => log(f, 'blur')} />
        </div>
      ))}
      {events.length > 0 && (
        <div id="focus-event-log" className="event-log">
          {events.map((e, i) => <div key={i} className="event-entry">{e}</div>)}
        </div>
      )}
    </section>
  )
}

// ─── 15. Drag & Drop ─────────────────────────────────────────────────────────
const DRAG_ITEMS = [
  { id: 'drag-1', label: 'Alpha Task',   color: '#6366f1' },
  { id: 'drag-2', label: 'Beta Task',    color: '#ec4899' },
  { id: 'drag-3', label: 'Gamma Task',   color: '#10b981' },
  { id: 'drag-4', label: 'Delta Task',   color: '#f59e0b' },
  { id: 'drag-5', label: 'Epsilon Task', color: '#ef4444' },
]

function DragDropSection() {
  const [items, setItems]   = useState(DRAG_ITEMS)
  const [dragging, setDragging] = useState(null)
  const [log, setLog]       = useState('')

  const onDrop = targetId => {
    if (!dragging || dragging === targetId) return
    const from = items.findIndex(i => i.id === dragging)
    const to   = items.findIndex(i => i.id === targetId)
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)
    setLog(`Moved "${moved.label}" → position ${to + 1}`)
    setDragging(null)
  }

  return (
    <section id="sec-dragdrop" className="card">
      <SectionHeader num="15" title="Drag & Drop" locator="data-drag-id" />
      <p className="desc">Drag items to reorder the list.</p>
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
            <span className="drag-label">{item.label}</span>
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
  const [result, setResult] = useState('')
  return (
    <section id="sec-popups" className="card">
      <SectionHeader num="16" title="Browser Popups" locator="id" />
      <p className="desc">Native browser alert, prompt, and confirm dialogs.</p>
      <div className="button-row">
        <button id="btn-alert" className="btn-warning"
          onClick={() => { window.alert('This is a browser alert!'); setResult('Alert was dismissed') }}>
          Alert
        </button>
        <button id="btn-prompt" className="btn-primary"
          onClick={() => {
            const v = window.prompt('What is your name?')
            setResult(v !== null ? `Prompt returned: "${v}"` : 'Prompt was cancelled')
          }}>
          Prompt
        </button>
        <button id="btn-confirm" className="btn-success"
          onClick={() => {
            const ok = window.confirm('Do you confirm this action?')
            setResult(ok ? 'Confirmed: OK clicked' : 'Cancelled: Cancel clicked')
          }}>
          Confirm
        </button>
      </div>
      {result && <Output id="popup-result">{result}</Output>}
    </section>
  )
}

// ─── 17. Links & New Windows ─────────────────────────────────────────────────
function LinksWindowsSection() {
  const [log, setLog] = useState('')
  return (
    <section id="sec-windows" className="card">
      <SectionHeader num="17" title="Links & New Windows" locator="id / href / target" />
      <p className="desc">Anchor links, JS-opened tabs and windows.</p>
      <div className="links-grid">
        <a id="link-anchor"  href="#sec-text" className="link-chip">Anchor (same page)</a>
        <a id="link-newtab"  href="https://example.com" target="_blank" rel="noreferrer" className="link-chip">
          External (new tab)
        </a>
        <a id="link-download" href="data:text/plain,Hello" download="sample.txt" className="link-chip">
          Download link
        </a>
        <button id="btn-js-newtab" className="btn-secondary"
          onClick={() => { window.open('https://example.com', '_blank'); setLog('New tab opened via JS') }}>
          JS New Tab
        </button>
        <button id="btn-js-newwindow" className="btn-secondary"
          onClick={() => {
            window.open('https://example.com', 'popup', 'width=700,height=500,left=200,top=100')
            setLog('New window opened via JS')
          }}>
          JS New Window
        </button>
      </div>
      {log && <Output id="window-log">{log}</Output>}
    </section>
  )
}

// ─── 18. iFrame ──────────────────────────────────────────────────────────────
const IFRAME_HTML = `<!DOCTYPE html><html><head><style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,sans-serif}
  body{padding:20px;background:linear-gradient(135deg,#ede9fe,#dbeafe);height:100%}
  .badge{display:inline-block;background:#4f46e5;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em}
  h3{color:#4f46e5;margin-bottom:12px;font-size:14px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  input{flex:1;padding:8px 12px;border:1px solid #c4b5fd;border-radius:6px;font-size:14px;background:#fff;outline:none}
  input:focus{border-color:#4f46e5}
  button{padding:8px 16px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}
  button:hover{background:#4338ca}
  #iframe-result{margin-top:10px;padding:10px 12px;background:#fff;border-radius:6px;color:#4f46e5;font-size:14px;border:1px solid #c4b5fd;min-height:38px}
</style></head><body>
  <span class="badge">Inside iFrame</span>
  <h3>Iframe Content Area</h3>
  <div class="row">
    <input id="iframe-input" type="text" placeholder="Type inside the iframe…"/>
    <button id="iframe-btn" onclick="document.getElementById('iframe-result').textContent='Value: '+document.getElementById('iframe-input').value">Read</button>
  </div>
  <div id="iframe-result">Result will appear here</div>
</body></html>`

function IFrameSection() {
  return (
    <section id="sec-iframe" className="card">
      <SectionHeader num="18" title="iFrame" locator="id (within frame)" />
      <p className="desc">Embedded page in an iframe. Elements live in a separate DOM context.</p>
      <iframe id="practice-iframe" title="Practice iFrame"
        srcDoc={IFRAME_HTML} className="practice-iframe" />
    </section>
  )
}

// ─── 19. Shadow DOM ──────────────────────────────────────────────────────────
function ShadowDOMSection() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || host.shadowRoot) return
    const shadow = host.attachShadow({ mode: 'open' })
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
        <span class="badge">Shadow DOM</span>
        <p>Encapsulated from the main document. Use element.shadowRoot to reach inside.</p>
        <div class="row">
          <input id="shadow-input" type="text" placeholder="Shadow DOM input…"/>
          <button id="shadow-btn">Read</button>
        </div>
        <div id="shadow-output">Value will appear here</div>
      </div>`
    shadow.getElementById('shadow-btn').addEventListener('click', () => {
      const val = shadow.getElementById('shadow-input').value
      shadow.getElementById('shadow-output').textContent =
        val ? `Value: "${val}"` : 'Enter something first'
    })
  }, [])

  return (
    <section id="sec-shadow" className="card">
      <SectionHeader num="19" title="Shadow DOM" locator="data-testid / shadowRoot" />
      <p className="desc">Elements encapsulated in a shadow root. Use <code>locator.shadowRoot()</code> in Playwright.</p>
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
      <SectionHeader num="20" title="Pagination Table" locator="id / data-row-id" />
      <p className="desc">25 rows, 5 per page. Filter by name, department, or ID.</p>
      <input id="employee-search" placeholder="Search name, dept, or ID…"
        value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      <div className="table-wrap">
        <table id="employee-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Status</th></tr>
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
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} id="no-results" className="no-results">No matching records</td></tr>
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
        Showing {rows.length} of {filtered.length} records — Page {page} of {totalPages}
      </p>
    </section>
  )
}

// ─── 21. Show / Hide & Tabs ──────────────────────────────────────────────────
const TABS = ['Details', 'Settings', 'Preview']
const TAB_CONTENT = [
  'This is the Details tab. Assert it is visible using toBeVisible().',
  'Settings tab is active. Toggle state and verify the update.',
  'Preview tab shows the final rendered output for inspection.',
]

function ShowHideSection() {
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState(0)
  return (
    <section id="sec-toggle" className="card">
      <SectionHeader num="21" title="Show / Hide & Tabs" locator="className / role" />
      <p className="desc">Collapsible panel and tab switching for visibility assertions.</p>
      <button className="toggle-btn" id="toggle-panel-btn" onClick={() => setOpen(o => !o)}>
        {open ? 'Collapse Panel' : 'Expand Panel'}
      </button>
      {open && (
        <div id="collapsible-content" className="collapsible-panel">
          <p>Panel is now <strong>visible</strong>.</p>
          <code data-testid="secret-value">Secret: PANEL-XYZ-789</code>
        </div>
      )}
      <div className="tab-bar" role="tablist">
        {TABS.map((t, i) => (
          <button key={t} role="tab" id={`tab-${t.toLowerCase()}`}
            className={`tab-btn ${tab === i ? 'tab-active' : ''}`}
            onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      <div id="tab-content" className="tab-content" role="tabpanel">
        {TAB_CONTENT[tab]}
      </div>
    </section>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'sec-text',     label: 'Text Input',         group: 'Inputs' },
  { id: 'sec-password', label: 'Password & Textarea', group: 'Inputs' },
  { id: 'sec-date',     label: 'Date Picker',         group: 'Inputs' },
  { id: 'sec-slider',   label: 'Slider',              group: 'Inputs' },
  { id: 'sec-file',     label: 'File Upload',         group: 'Inputs' },
  { id: 'sec-form',     label: 'Form Validation',     group: 'Inputs' },
  { id: 'sec-checkbox', label: 'Checkboxes',          group: 'Selection' },
  { id: 'sec-radio',    label: 'Radio Group',         group: 'Selection' },
  { id: 'sec-dropdown', label: 'Dropdown & Tags',     group: 'Selection' },
  { id: 'sec-counter',  label: 'Click Counter',       group: 'Buttons' },
  { id: 'sec-dblclick', label: 'Double Click',        group: 'Buttons' },
  { id: 'sec-dynamic',  label: 'Dynamic Buttons',     group: 'Buttons' },
  { id: 'sec-hover',    label: 'Mouse Hover',         group: 'Events' },
  { id: 'sec-focus',    label: 'Focus / Blur',        group: 'Events' },
  { id: 'sec-dragdrop', label: 'Drag & Drop',         group: 'Events' },
  { id: 'sec-popups',   label: 'Browser Popups',      group: 'Windows' },
  { id: 'sec-windows',  label: 'Links & Windows',     group: 'Windows' },
  { id: 'sec-iframe',   label: 'iFrame',              group: 'Advanced' },
  { id: 'sec-shadow',   label: 'Shadow DOM',          group: 'Advanced' },
  { id: 'sec-table',    label: 'Pagination Table',    group: 'Advanced', subGroup: 'Data & Tables' },
  { id: 'sec-toggle',   label: 'Show / Hide & Tabs',  group: 'Advanced' },
]

function Sidebar({ active }) {
  const groups = [...new Set(NAV.map(n => n.group))]
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(groups.map(g => [g, true]))
  )
  const [openSubGroups, setOpenSubGroups] = useState({})

  const scrollTo = id =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const toggleGroup = g => setOpenGroups(s => ({ ...s, [g]: !s[g] }))
  const toggleSubGroup = sg => setOpenSubGroups(s => ({ ...s, [sg]: !s[sg] }))

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">TP</span>
        <span>Test Playground</span>
      </div>
      {groups.map(g => {
        const groupItems = NAV.filter(n => n.group === g)
        const subGroups  = [...new Set(groupItems.filter(n => n.subGroup).map(n => n.subGroup))]
        const directItems = groupItems.filter(n => !n.subGroup)
        const isOpen = openGroups[g]

        return (
          <div key={g} className="nav-group">
            <button className="nav-group-label" onClick={() => toggleGroup(g)}>
              <span>{g}</span>
              <span className={`nav-chevron ${isOpen ? 'nav-chevron-open' : ''}`}>›</span>
            </button>
            {isOpen && (
              <>
                {directItems.map(n => (
                  <button key={n.id}
                    className={`nav-item ${active === n.id ? 'nav-active' : ''}`}
                    onClick={() => scrollTo(n.id)}>
                    {n.label}
                  </button>
                ))}
                {subGroups.map(sg => {
                  const sgOpen = openSubGroups[sg]
                  return (
                    <div key={sg} className="nav-subgroup">
                      <button className="nav-subgroup-label" onClick={() => toggleSubGroup(sg)}>
                        <span className="nav-subgroup-icon">⊞</span>
                        <span>{sg}</span>
                        <span className={`nav-chevron ${sgOpen ? 'nav-chevron-open' : ''}`}>›</span>
                      </button>
                      {sgOpen && groupItems
                        .filter(n => n.subGroup === sg)
                        .map(n => (
                          <button key={n.id}
                            className={`nav-item nav-item-nested ${active === n.id ? 'nav-active' : ''}`}
                            onClick={() => scrollTo(n.id)}>
                            <span className="nav-item-dot" />
                            {n.label}
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
    </nav>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState('sec-text')
  const contentRef = useRef(null)

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
  }, [])

  return (
    <div className="layout">
      <Sidebar active={active} />
      <main className="content" ref={contentRef}>
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
          <IFrameSection />
          <ShadowDOMSection />
          <PaginationTableSection />
          <ShowHideSection />
        </div>
      </main>
    </div>
  )
}
