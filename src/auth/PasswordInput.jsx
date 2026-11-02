// Password field with a show/hide toggle, used by the login and signup pages.
import { useState } from 'react'
import { useLang } from '../i18n.jsx'

/**
 * Controlled password input with an eye button that switches it to plain text.
 * @param onChange Called with the new string value, not the change event.
 * @param testIdPrefix data-testid of the input; the toggle gets `<prefix>-toggle`.
 */
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  testIdPrefix,
}) {
  const { t } = useLang()
  const [shown, setShown] = useState(false)
  return (
    <div className="password-wrap">
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        data-testid={testIdPrefix}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShown(s => !s)}
        aria-label={shown ? t('authHidePassword') : t('authShowPassword')}
        data-testid={`${testIdPrefix}-toggle`}
      >
        {shown ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
