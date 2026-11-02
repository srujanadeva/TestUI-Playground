// Playground sections 16, 17 and 22 (sidebar group "Windows"): native browser
// dialogs, links and new windows, and in-page modal alerts.
import { useState } from 'react'
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
/** An in-page anchor, a target="_blank" link, a download link, and window.open() as a tab and as a sized popup. */
export function LinksWindowsSection() {
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
