// Playground sections 19, 20, 21, 23 and 24 (sidebar group "Advanced"): Shadow DOM,
// a paginated table, show/hide and tabs, conditional fields and a delayed widget.
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// ─── 19. Shadow DOM ──────────────────────────────────────────────────────────
/**
 * An input and button inside an open shadow root. The shadow content is plain DOM
 * built by hand (React doesn't render into it), so it is rebuilt when the language changes.
 * The Browser page (B1) has the harder nested and closed versions.
 */
export function ShadowDOMSection() {
  const { t, lang } = useLang()
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // A host can only be given one shadow root, so reuse it when the effect runs again.
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
      <SectionHeader num="19" title={t('sec19Title')} locator="data-testid / shadowRoot" tip="tip19" />
      <p className="desc">{t('sec19Desc')}</p>
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

/**
 * A 25-row employee table, 5 rows per page, with a search over name, department and id.
 * Searching goes back to page 1.
 */
export function PaginationTableSection() {
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
    <section id="sec-table" className="card card-acting-search">
      <SectionHeader num="20" title={t('sec20Title')} locator="id / data-row-id" tip="tip20" />
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
const TAB_KEYS = ['details', 'settings', 'preview']

/**
 * A collapsible panel that is removed from the DOM when closed, and a three-tab bar
 * that follows the ARIA tabs pattern: aria-selected on the chosen tab, only that tab
 * in the Tab order, and arrow keys / Home / End to move (which also selects).
 */
export function ShowHideSection() {
  const { t, tArr, lang } = useLang()
  const tabs       = tArr('tabs')
  const tabContent = tArr('tabContent')
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState(0)
  const tabRefs = useRef([])

  function select(i) {
    const next = (i + TAB_KEYS.length) % TAB_KEYS.length
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  // Left and right swap in RTL, where the first tab is on the right.
  function onTabKey(e) {
    const forward  = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const backward = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    if (e.key === forward)       select(tab + 1)
    else if (e.key === backward) select(tab - 1)
    else if (e.key === 'Home')   select(0)
    else if (e.key === 'End')    select(TAB_KEYS.length - 1)
    else return
    e.preventDefault()
  }

  return (
    <section id="sec-toggle" className="card">
      <SectionHeader num="21" title={t('sec21Title')} locator="className / role" tip="tip21" />
      <p className="desc">{t('sec21Desc')}</p>
      <button className="toggle-btn" id="toggle-panel-btn" aria-expanded={open}
        onClick={() => setOpen(o => !o)}>
        {open ? t('btnCollapsePanel') : t('btnExpandPanel')}
      </button>
      {open && (
        <div id="collapsible-content" className="collapsible-panel">
          <p>{t('panelVisible')} <strong>{t('panelVisibleBold')}</strong>.</p>
          <code data-testid="secret-value">Secret: PANEL-XYZ-789</code>
        </div>
      )}
      <div className="tab-bar" role="tablist" aria-label={t('sec21Title')} onKeyDown={onTabKey}>
        {tabs.map((label, i) => (
          <button key={i} ref={el => { tabRefs.current[i] = el }} role="tab" id={`tab-${TAB_KEYS[i]}`}
            className={`tab-btn ${tab === i ? 'tab-active' : ''}`}
            aria-selected={tab === i} aria-controls="tab-content" tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>
      <div id="tab-content" className="tab-content" role="tabpanel"
        aria-labelledby={`tab-${TAB_KEYS[tab]}`} tabIndex={0}>
        {tabContent[tab]}
      </div>
    </section>
  )
}

// ─── 23. Conditional Fields ──────────────────────────────────────────────────
/**
 * A checkbox that reveals a text field, a dropdown and a radio group. Values are
 * kept while the fields are hidden, so they come back when it is ticked again.
 */
export function ConditionalFieldsSection() {
  const { t } = useLang()
  const [enabled, setEnabled] = useState(false)
  const [text, setText]       = useState('')
  const [chosen, setChosen]   = useState('')
  const [radio, setRadio]     = useState('')

  return (
    <section id="sec-conditional" className="card">
      <SectionHeader num="23" title={t('sec23Title')} locator="id / data-testid" tip="tip23" />
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
/**
 * How long the widget takes to "load".
 * Loads 1–6 s after the page renders, like a slow backend call. ?delay=<ms>
 * in the URL fixes the delay for deterministic test runs.
 * @returns Milliseconds.
 */
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

/**
 * Stat cards that show skeletons until pickDelay() has passed. Wait on
 * data-state="loaded", not a fixed sleep. Reload runs it again with a new delay.
 */
export function DelayedWidgetSection() {
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
      <SectionHeader num="24" title={t('sec24Title')} locator="data-state / data-testid" tip="tip24" />
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
