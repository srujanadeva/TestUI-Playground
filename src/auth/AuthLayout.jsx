import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

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
