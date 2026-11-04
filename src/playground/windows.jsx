// Playground sections 16, 17, 22 and 29 (sidebar group "Windows"): native browser
// dialogs, links and new windows, in-page modal alerts, and snackbars.
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// ─── 16. Browser Popups ──────────────────────────────────────────────────────
/**
 * Native alert / prompt / confirm dialogs. They block the page, so a test must
 * handle the dialog event before clicking; the result line shows what came back.
 */
export function PopupsSection() {
  const { t } = useLang()
  const [result, setResult] = useState('')
  return (
    <section id="sec-popups" className="card">
      <SectionHeader num="16" title={t('sec16Title')} locator="id" tip="tip16" />
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
/** An in-page anchor, a target="_blank" link, a download link, and window.open() as a tab and as a sized popup. */
export function LinksWindowsSection() {
  const { t } = useLang()
  const [log, setLog] = useState('')
  return (
    <section id="sec-windows" className="card">
      <SectionHeader num="17" title={t('sec17Title')} locator="id / href / target" tip="tip17" />
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

/**
 * In-page modal dialogs (role="dialog") in three styles, unlike the native ones in 16.
 * Closed by ✕, Dismiss, or a click on the overlay.
 */
export function PopupAlertsSection() {
  const { t } = useLang()
  const [active, setActive] = useState(null)
  const popup = active ? POPUP_TYPES[active] : null

  return (
    <section id="sec-popup-alerts" className="card">
      <SectionHeader num="22" title={t('sec22Title')} locator="id / role" tip="tip22" />
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

// ─── 29. Snackbar ────────────────────────────────────────────────────────────
// Short messages that appear at the bottom corner of the screen. Each auto-closing
// one stays for a random 3–7 s, picked when it opens and shown in data-duration-ms,
// so a test can't rely on a fixed sleep. There is deliberately no URL override.
const SNACK_MIN_MS = 3000
const SNACK_MAX_MS = 7000
const SNACK_ITEMS  = 5

/** A random time on screen for one snackbar, in ms. */
const snackDuration = () => SNACK_MIN_MS + Math.floor(Math.random() * (SNACK_MAX_MS - SNACK_MIN_MS + 1))

/**
 * Buttons that raise snackbars: a plain message, a delete with Undo, an error
 * that stays until closed, and three at once. They stack, newest at the bottom.
 * The last way one closed (timed out, ✕, Undo) is shown under the buttons.
 */
export function SnackbarSection() {
  const { t } = useLang()
  const [snacks, setSnacks] = useState([])   // { id, kind, msgKey, duration }
  const [items, setItems]   = useState(SNACK_ITEMS)
  const [log, setLog]       = useState(null)   // { reasonKey, msgKey }, worded at render time
  const timers = useRef(new Map())           // snack id -> its auto-close timeout
  const nextId = useRef(1)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /** Removes a snackbar and records why, so a test can tell a timeout from a click. */
  function close(snack, reasonKey) {
    clearTimeout(timers.current.get(snack.id))
    timers.current.delete(snack.id)
    setSnacks(list => list.filter(s => s.id !== snack.id))
    setLog({ reasonKey, msgKey: snack.msgKey })
  }

  /** Adds snackbars; every kind except an error closes itself after its own random duration. */
  function show(...specs) {
    const added = specs.map(([kind, msgKey]) => ({
      id: nextId.current++, kind, msgKey,
      duration: kind === 'error' ? null : snackDuration(),
    }))
    added.forEach(snack => {
      if (snack.duration) timers.current.set(snack.id, setTimeout(() => close(snack, 'snackLogTimedOut'), snack.duration))
    })
    setSnacks(list => [...list, ...added])
  }

  function deleteItem() {
    setItems(n => n - 1)
    show(['undo', 'snackItemDeleted'])
  }

  function undo(snack) {
    setItems(n => n + 1)
    close(snack, 'snackLogUndone')
  }

  function reset() {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    setSnacks([])
    setItems(SNACK_ITEMS)
    setLog(null)
  }

  return (
    <section id="sec-snackbar" className="card">
      <SectionHeader num="29" title={t('sec29Title')} locator="data-testid / data-duration-ms" tip="tip29" />
      <p className="desc">{t('sec29Desc')}</p>
      <div className="button-row">
        <button id="snack-info" className="btn-primary" onClick={() => show(['info', 'snackSaved'])}>{t('btnSnackInfo')}</button>
        <button id="snack-delete" className="btn-danger" disabled={items === 0} onClick={deleteItem}>{t('btnSnackDelete')}</button>
        <button id="snack-error" className="btn-warning" onClick={() => show(['error', 'snackError'])}>{t('btnSnackError')}</button>
        <button id="snack-burst" className="btn-secondary"
          onClick={() => show(['info', 'snackBurst1'], ['info', 'snackBurst2'], ['info', 'snackBurst3'])}>{t('btnSnackBurst')}</button>
        <button id="snack-reset" className="btn-secondary btn-row-end" onClick={reset}>{t('btnReset')}</button>
      </div>
      <Output id="snack-items">{t('snackItems', { n: items })}</Output>
      {log && <Output id="snackbar-log">{t(log.reasonKey, { msg: t(log.msgKey) })}</Output>}

      {/* Always in the DOM (empty when nothing shows), so tests can scope to it. */}
      <div id="snackbar-stack" className="snackbar-stack">
        {snacks.map(snack => (
          <div key={snack.id} className={`snackbar snackbar-${snack.kind}`} data-testid="snackbar"
            data-kind={snack.kind} data-snack-id={snack.id} data-duration-ms={snack.duration ?? undefined}
            role={snack.kind === 'error' ? 'alert' : 'status'}>
            <span className="snackbar-text">{t(snack.msgKey)}</span>
            {snack.kind === 'undo' && (
              <button className="snackbar-action" data-testid="snackbar-action" onClick={() => undo(snack)}>{t('snackUndo')}</button>
            )}
            <button className="snackbar-close" data-testid="snackbar-close" aria-label={t('snackClose')}
              onClick={() => close(snack, 'snackLogClosed')}>✕</button>
          </div>
        ))}
      </div>
    </section>
  )
}
