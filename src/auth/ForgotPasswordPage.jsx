import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from './AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'

export default function ForgotPasswordPage() {
  const { t } = useLang()
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
    } catch {
      // stub: never reveal errors
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthLayout
      title={t('authForgotPassword')}
      footer={
        <Link to="/login" className="auth-link" data-testid="forgot-login-link">
          {t('authLogin')}
        </Link>
      }
    >
      {submitted ? (
        <p className="auth-confirm" data-testid="forgot-confirm">
          {t('authForgotConfirm')}
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="auth-prompt">{t('authForgotPrompt')}</p>
          <label className="auth-field">
            <span>{t('authEmail')}</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              data-testid="forgot-email"
            />
          </label>
          <button type="submit" className="auth-submit" disabled={submitting} data-testid="forgot-submit">
            {submitting ? '…' : t('authForgotPassword')}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
