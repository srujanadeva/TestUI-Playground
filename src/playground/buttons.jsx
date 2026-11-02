// Playground sections 10–12 (sidebar group "Buttons"): click counters, single /
// double / right clicks, and buttons that change or appear at runtime.
import { useState } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader } from '../ui.jsx'

// ─── 10. Click Counter ───────────────────────────────────────────────────────
/** Three buttons told apart only by class name, each with its own counter and a total. */
export function ClickCounterSection() {
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
/**
 * An area that logs single, double and right clicks (the browser menu is suppressed).
 * A double-click also logs the two single clicks before it, as browsers fire them.
 */
export function DoubleClickSection() {
  const { t } = useLang()
  const [log, setLog] = useState([])
  // Newest first, last 4 only.
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
/**
 * Buttons that change under a test: one that is disabled while "loading" for 2 s,
 * one that swaps with a different button, and an Add button whose new buttons get
 * an unpredictable data-dynamic-id (a timestamp) and remove themselves when clicked.
 */
export function DynamicButtonsSection() {
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
