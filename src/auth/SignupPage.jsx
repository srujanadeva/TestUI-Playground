import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from './AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import PasswordInput from './PasswordInput.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignupPage() {
  const { t } = useLang()
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = t('authErrInvalid')
    if (!EMAIL_RE.test(email)) errs.email = t('authErrInvalid')
    if (password.length < 8) errs.password = t('authErrShort')
    if (password !== confirm) errs.confirm = t('authErrMismatch')
    if (!terms) errs.terms = t('authErrTerms')
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      await signup(name.trim(), email.trim(), password, true)
      navigate('/account', { replace: true })
    } catch (err) {
      if (err.status === 409) setErrors({ email: t('authErrEmailTaken') })
      else if (err.status === 0) setErrors({ form: t('authErrNetwork') })
      else setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={t('authSignup')}
      footer={
        <span>
          {t('authHaveAccount')}{' '}
          <Link to="/login" className="auth-link" data-testid="signup-login-link">
            {t('authLogin')}
          </Link>
        </span>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>{t('authName')}</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            data-testid="signup-name"
          />
          {errors.name && <span className="auth-field-error" data-testid="signup-name-error">{errors.name}</span>}
        </label>
        <label className="auth-field">
          <span>{t('authEmail')}</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            data-testid="signup-email"
          />
          {errors.email && <span className="auth-field-error" data-testid="signup-email-error">{errors.email}</span>}
        </label>
        <label className="auth-field">
          <span>{t('authPassword')}</span>
          <PasswordInput
            id="signup-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            testIdPrefix="signup-password"
          />
          {errors.password && <span className="auth-field-error" data-testid="signup-password-error">{errors.password}</span>}
        </label>
        <label className="auth-field">
          <span>{t('authConfirmPassword')}</span>
          <PasswordInput
            id="signup-confirm"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            testIdPrefix="signup-confirm"
          />
          {errors.confirm && <span className="auth-field-error" data-testid="signup-confirm-error">{errors.confirm}</span>}
        </label>
        <label className="auth-check">
          <input
            type="checkbox"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            data-testid="signup-terms"
          />
          <span>{t('authTerms')}</span>
        </label>
        {errors.terms && <span className="auth-field-error" data-testid="signup-terms-error">{errors.terms}</span>}
        {errors.form && (
          <div className="auth-error" role="alert" data-testid="signup-error">
            {errors.form}
          </div>
        )}
        <button type="submit" className="auth-submit" disabled={submitting} data-testid="signup-submit">
          {submitting ? '…' : t('authSignup')}
        </button>
      </form>
    </AuthLayout>
  )
}
