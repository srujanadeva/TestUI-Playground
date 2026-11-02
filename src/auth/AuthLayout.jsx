// Shared frame for the login, signup and forgot-password pages.
import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

/**
 * Centred card with the brand link, a language toggle and the page title.
 * @param footer Optional content under the card body, e.g. a link to the other auth page.
 */
export default function AuthLayout({ title, children, footer }) {
  const { t, lang, toggleLang } = useLang()
  return (
    <div className="auth-layout" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button className="auth-lang-toggle" onClick={toggleLang} aria-label="Toggle language">
        {t('langToggle')}
      </button>
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="logo-mark">TP</span>
          <span>{t('appName')}</span>
        </Link>
        <h1 className="auth-title">{title}</h1>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  )
}
