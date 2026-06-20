import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from './AuthContext.jsx'

export default function AccountPage() {
  const { t, lang } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="account-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="account-card">
        <div className="account-avatar" aria-hidden>
          {(user?.name || '?').charAt(0).toUpperCase()}
        </div>
        <h1 className="account-welcome" data-testid="account-welcome">
          {t('accountWelcome', { name: user?.name || '' })}
        </h1>
        <dl className="account-meta">
          <div>
            <dt>{t('authEmail')}</dt>
            <dd data-testid="account-email">{user?.email}</dd>
          </div>
          <div>
            <dt>{t('accountMemberSince')}</dt>
            <dd data-testid="account-member-since">{memberSince}</dd>
          </div>
        </dl>
        <div className="account-actions">
          <button
            className="account-cta"
            onClick={() => navigate('/petstore')}
            data-testid="account-goto-petstore"
          >
            🐾 {t('accountGoToPetstore')}
          </button>
          <button
            className="account-logout"
            onClick={handleLogout}
            data-testid="account-logout"
          >
            {t('authLogout')}
          </button>
        </div>
      </div>
    </div>
  )
}
