import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from './AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import PasswordInput from './PasswordInput.jsx'

export default function LoginPage() {
  const { t } = useLang()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password, remember)
      const dest = location.state?.from && location.state.from !== '/login'
        ? location.state.from
        : '/account'
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.status === 0) setError(t('authErrNetwork'))
      else setError(t('authErrInvalid'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={t('authLogin')}
      footer={
        <span>
          {t('authNoAccount')}{' '}
          <Link to="/signup" className="auth-link" data-testid="login-signup-link">
            {t('authSignup')}
          </Link>
        </span>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>{t('authEmail')}</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            data-testid="login-email"
          />
        </label>
        <label className="auth-field">
          <span>{t('authPassword')}</span>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            testIdPrefix="login-password"
          />
        </label>
        <div className="auth-row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              data-testid="login-remember"
            />
            <span>{t('authRememberMe')}</span>
          </label>
          <Link to="/forgot-password" className="auth-link" data-testid="login-forgot-link">
            {t('authForgotPassword')}
          </Link>
        </div>
        {error && (
          <div className="auth-error" role="alert" data-testid="login-error">
            {error}
          </div>
        )}
        <button type="submit" className="auth-submit" disabled={submitting} data-testid="login-submit">
          {submitting ? '…' : t('authLogin')}
        </button>
      </form>
    </AuthLayout>
  )
}
