import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { apiFetch } from '../api/client.js'
import { SectionHeader, Output } from '../ui.jsx'
import sampleClean from '../testresources/ocr/id-clean.png'
import sampleBlurry from '../testresources/ocr/id-blurry.png'
import samplePartial from '../testresources/ocr/id-partial.png'

const API = '/api/verification'
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg']
const OTP_LENGTH = 6
// OCR fields below this confidence are flagged for the user to check.
const LOW_CONFIDENCE = 0.8

function formatTime(sec) {
  const s = Math.max(0, Math.ceil(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Seconds left until `deadline` (ms timestamp), updated every 250 ms. null when there is no deadline.
function useCountdown(deadline) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!deadline) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(timer)
  }, [deadline])
  return deadline ? Math.max(0, (deadline - now) / 1000) : null
}

// Builds "?a=1&b=2" from the entries that have a value.
function query(params) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  const s = q.toString()
  return s ? `?${s}` : ''
}

// ─── V1. Image CAPTCHA ───────────────────────────────────────────────────────
// The server draws the code as an image, so it is not in the DOM. Tests are
// not meant to read it: use ?captcha=test (fixed answer TEST42) or send the
// X-Captcha-Test-Key header. Each challenge can be answered once.
function ImageCaptchaSection({ params }) {
  const { t } = useLang()
  const { token } = useAuth()
  const testMode = params.get('captcha') === 'test'
  const ttl = params.get('captchaTtl')
  const [challenge, setChallenge] = useState(null) // { id, image, expiresAt }
  const [status, setStatus]       = useState('loading') // loading | ready | expired | verifying | passed | error
  const [answer, setAnswer]       = useState('')
  const [message, setMessage]     = useState('')
  const [error, setError]         = useState('')
  const [bypassed, setBypassed]   = useState(false)
  const left = useCountdown(challenge?.expiresAt)

  async function load(keepError = false) {
    setStatus('loading')
    setAnswer('')
    if (!keepError) setError('')
    try {
      const data = await apiFetch(`${API}/captcha${query({ mode: testMode ? 'test' : '', ttl })}`, { token })
      setChallenge({ id: data.id, image: data.image, expiresAt: Date.now() + data.expiresIn * 1000 })
      setStatus('ready')
    } catch (err) {
      setError(err.status ? err.message : t('verifyErrNetwork'))
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (status === 'ready' && left === 0) setStatus('expired')
  }, [status, left])

  async function submit(e) {
    e.preventDefault()
    if (!message.trim()) { setError(t('captchaErrMessage')); return }
    if (!answer.trim()) { setError(t('captchaErrAnswer')); return }
    setStatus('verifying')
    setError('')
    try {
      const data = await apiFetch(`${API}/captcha/verify`, {
        method: 'POST', token, body: { id: challenge.id, answer },
      })
      setBypassed(Boolean(data.bypassed))
      setStatus('passed')
    } catch (err) {
      // The server throws the challenge away after any attempt, so load a new one.
      setError(err.status ? err.message : t('verifyErrNetwork'))
      load(true)
    }
  }

  function reset() {
    setMessage('')
    setBypassed(false)
    load()
  }

  return (
    <section id="sec-verify-captcha" className="card" data-state={status}>
      <SectionHeader num="V1" title={t('secV1Title')} locator="id / data-state" />
      <p className="desc">{t('secV1Desc')}</p>

      {status === 'passed' ? (
        <>
          <p id="captcha-result" className="success-msg" role="status">
            {t(bypassed ? 'captchaPassedBypass' : 'captchaPassed')}
          </p>
          <div className="button-row">
            <button id="captcha-reset" className="btn-secondary" onClick={reset}>{t('captchaAgain')}</button>
          </div>
        </>
      ) : (
        <form className="verify-form" onSubmit={submit} noValidate>
          <div className="form-field">
            <label className="field-label" htmlFor="captcha-message">{t('captchaMessageLabel')}</label>
            <textarea id="captcha-message" value={message} rows={3}
              onChange={e => setMessage(e.target.value)} />
          </div>

          <div className="captcha-box">
            <div className="captcha-image-wrap" data-testid="captcha-image-wrap">
              {challenge && status !== 'loading'
                ? <img id="captcha-image" src={challenge.image} alt={t('captchaImageAlt')} width={180} height={60} />
                : <span className="skeleton captcha-skeleton" />}
              {status === 'expired' && <span className="captcha-expired">{t('captchaExpired')}</span>}
            </div>
            <button id="captcha-refresh" type="button" className="btn-secondary" aria-label={t('captchaRefresh')}
              title={t('captchaRefresh')} disabled={status === 'loading' || status === 'verifying'}
              onClick={() => load()}>↻</button>
            {testMode && <span id="captcha-test-badge" className="verify-badge">{t('captchaTestBadge')}</span>}
          </div>
          <p id="captcha-timer" className="drop-hint">
            {status === 'ready' && left != null ? t('captchaExpiresIn', { time: formatTime(left) }) : ' '}
          </p>

          <div className="form-field">
            <label className="field-label" htmlFor="captcha-answer">{t('captchaAnswerLabel')}</label>
            <input id="captcha-answer" type="text" autoComplete="off" spellCheck={false}
              value={answer} disabled={status !== 'ready'}
              onChange={e => setAnswer(e.target.value)} />
          </div>

          {error && <p id="captcha-error" className="error-msg" role="alert">{error}</p>}

          <div className="button-row">
            <button id="captcha-submit" type="submit" className="btn-primary" disabled={status !== 'ready'}>
              {status === 'verifying' ? t('verifyChecking') : t('captchaSubmit')}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

// ─── V2. Checkbox CAPTCHA (in an iframe) ─────────────────────────────────────
// Like the "I'm not a robot" widgets, the checkbox lives in its own frame and
// tells the page about the result with postMessage.
const ROBOT_MESSAGE = 'tp-robot-check'

function robotFrameDoc({ dir, label, checking, checked }) {
  return `<!DOCTYPE html><html dir="${dir}"><head><style>
  *{box-sizing:border-box;margin:0;font-family:-apple-system,'Segoe UI',Tahoma,sans-serif}
  body{padding:10px;background:#f8fafc}
  .box{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  #robot-checkbox{width:26px;height:26px;border:2px solid #94a3b8;border-radius:4px;background:#fff;cursor:pointer;display:grid;place-items:center;flex:none}
  #robot-checkbox:focus-visible{outline:2px solid #4f46e5;outline-offset:2px}
  #robot-checkbox[aria-checked="true"]{border-color:#059669;cursor:default}
  #robot-checkbox[aria-checked="true"]::after{content:'✓';color:#059669;font-weight:700;font-size:18px}
  #robot-checkbox[data-state="checking"]{border-color:#4f46e5;border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;cursor:default}
  @keyframes spin{to{transform:rotate(360deg)}}
  #robot-label{font-size:14px;color:#1e293b}
  #robot-status{margin-inline-start:auto;font-size:11px;color:#64748b}
</style></head><body>
  <div class="box">
    <div id="robot-checkbox" role="checkbox" aria-checked="false" aria-labelledby="robot-label" tabindex="0" data-state="unchecked"></div>
    <span id="robot-label">${label}</span>
    <span id="robot-status" aria-live="polite"></span>
  </div>
<script>
  var box = document.getElementById('robot-checkbox');
  var status = document.getElementById('robot-status');
  function check() {
    if (box.dataset.state !== 'unchecked') return;
    box.dataset.state = 'checking';
    status.textContent = ${JSON.stringify(checking)};
    setTimeout(function () {
      box.dataset.state = 'checked';
      box.setAttribute('aria-checked', 'true');
      status.textContent = ${JSON.stringify(checked)};
      var token = Math.random().toString(36).slice(2, 12);
      window.parent.postMessage({ type: '${ROBOT_MESSAGE}', token: token }, '*');
    }, 1200);
  }
  box.addEventListener('click', check);
  box.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); check(); } });
</script></body></html>`
}

function CheckboxCaptchaSection() {
  const { t, lang } = useLang()
  const frameRef = useRef(null)
  const [frameKey, setFrameKey] = useState(0)
  const [token, setToken]       = useState('')
  const [sent, setSent]         = useState(false)

  useEffect(() => {
    function onMessage(e) {
      if (e.source !== frameRef.current?.contentWindow || e.data?.type !== ROBOT_MESSAGE) return
      setToken(String(e.data.token))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function reset() {
    setToken('')
    setSent(false)
    setFrameKey(k => k + 1)
  }

  const doc = robotFrameDoc({
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    label: t('robotLabel'),
    checking: t('robotChecking'),
    checked: t('robotChecked'),
  })

  return (
    <section id="sec-verify-robot" className="card" data-state={sent ? 'sent' : token ? 'verified' : 'unchecked'}>
      <SectionHeader num="V2" title={t('secV2Title')} locator="iframe / role=checkbox" />
      <p className="desc">{t('secV2Desc')}</p>

      <iframe key={`${frameKey}-${lang}`} ref={frameRef} id="robot-frame" className="robot-frame"
        title={t('robotFrameTitle')} srcDoc={doc} />

      <div className="button-row">
        <button id="robot-submit" className="btn-primary" disabled={!token || sent}
          onClick={() => setSent(true)}>{t('robotSubmit')}</button>
        <button id="robot-reset" className="btn-secondary" onClick={reset}>{t('robotReset')}</button>
      </div>
      {sent && <Output id="robot-result">{t('robotResult', { token })}</Output>}
    </section>
  )
}

// ─── V3. OTP ─────────────────────────────────────────────────────────────────
// Six one-digit boxes: typing moves on, Backspace on an empty box moves back,
// pasting spreads the digits. The code is "sent" to the dev inbox below (also
// GET /api/verification/dev-inbox), the way tests read OTPs from a test SMS
// gateway. ?otpTtl= and ?otpCooldown= (seconds) shorten the timers.
function OtpBoxes({ digits, setDigits, disabled }) {
  const { t } = useLang()
  const refs = useRef([])

  function fillFrom(i, text) {
    const chars = text.replace(/\D/g, '').slice(0, OTP_LENGTH - i).split('')
    if (chars.length === 0) return
    setDigits(d => {
      const next = [...d]
      chars.forEach((c, k) => { next[i + k] = c })
      return next
    })
    refs.current[Math.min(i + chars.length, OTP_LENGTH - 1)]?.focus()
  }

  function onChange(i, value) {
    if (value === '') {
      setDigits(d => d.map((c, k) => (k === i ? '' : c)))
      return
    }
    // Typing into a filled box gives "old + new"; keep only the new digit(s).
    const fresh = digits[i] && value.length > 1 && value.startsWith(digits[i]) ? value.slice(1) : value
    fillFrom(i, fresh)
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault()
      setDigits(d => d.map((c, k) => (k === i - 1 ? '' : c)))
      refs.current[i - 1].focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      refs.current[i - 1].focus()
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      e.preventDefault()
      refs.current[i + 1].focus()
    }
  }

  return (
    // Codes read left to right in both languages.
    <div className="otp-boxes" dir="ltr" data-testid="otp-input" data-value={digits.join('')}
      role="group" aria-label={t('otpGroupLabel')}>
      {digits.map((d, i) => (
        <input key={i} ref={el => { refs.current[i] = el }} id={`otp-digit-${i + 1}`}
          className="otp-digit" type="text" inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={t('otpDigitLabel', { n: i + 1, total: OTP_LENGTH })}
          value={d} disabled={disabled}
          onFocus={e => e.target.select()}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          onPaste={e => { e.preventDefault(); fillFrom(i, e.clipboardData.getData('text')) }} />
      ))}
    </div>
  )
}

function OtpSection({ params }) {
  const { t } = useLang()
  const { token } = useAuth()
  const timers = { ttl: params.get('otpTtl'), cooldown: params.get('otpCooldown') }
  const [phone, setPhone]       = useState('')
  const [status, setStatus]     = useState('idle') // idle | sent | verifying | verified | locked | expired
  const [sending, setSending]   = useState(false)
  const [sentTo, setSentTo]     = useState('')
  const [expiresAt, setExpiresAt] = useState(null)
  const [resendAt, setResendAt] = useState(null)
  const [digits, setDigits]     = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError]       = useState('')
  const [inbox, setInbox]       = useState([])
  const expiresIn = useCountdown(expiresAt)
  const resendIn  = useCountdown(resendAt)

  async function loadInbox() {
    try {
      const data = await apiFetch(`${API}/dev-inbox`, { token })
      setInbox(data.messages)
    } catch { /* the inbox is a helper; leave it as it was */ }
  }

  useEffect(() => { loadInbox() }, [])

  useEffect(() => {
    if (status === 'sent' && expiresIn === 0) setStatus('expired')
  }, [status, expiresIn])

  async function send(e) {
    e?.preventDefault()
    setError('')
    setSending(true)
    try {
      const data = await apiFetch(`${API}/otp/send${query(timers)}`, { method: 'POST', token, body: { phone } })
      setSentTo(data.sentTo)
      setExpiresAt(Date.now() + data.expiresIn * 1000)
      setResendAt(Date.now() + data.resendIn * 1000)
      setDigits(Array(OTP_LENGTH).fill(''))
      setStatus('sent')
      loadInbox()
    } catch (err) {
      if (err.payload?.retryAfter) setResendAt(Date.now() + err.payload.retryAfter * 1000)
      setError(err.status ? err.message : t('verifyErrNetwork'))
    } finally {
      setSending(false)
    }
  }

  async function verify(e) {
    e.preventDefault()
    setError('')
    setStatus('verifying')
    try {
      await apiFetch(`${API}/otp/verify`, { method: 'POST', token, body: { code: digits.join('') } })
      setStatus('verified')
      setExpiresAt(null)
    } catch (err) {
      setError(err.status ? err.message : t('verifyErrNetwork'))
      if (err.status === 429) setStatus('locked')
      else if (err.status === 410) setStatus('expired')
      else setStatus('sent')
    }
  }

  function reset() {
    setStatus('idle')
    setSentTo('')
    setExpiresAt(null)
    setDigits(Array(OTP_LENGTH).fill(''))
    setError('')
  }

  async function clearInbox() {
    try {
      await apiFetch(`${API}/dev-inbox`, { method: 'DELETE', token })
      setInbox([])
    } catch { /* ignore */ }
  }

  const codeEntered = digits.every(Boolean)
  const canResend = !resendIn
  const hasCode = ['sent', 'verifying', 'locked', 'expired'].includes(status)

  return (
    <section id="sec-verify-otp" className="card media-wide" data-state={status}>
      <SectionHeader num="V3" title={t('secV3Title')} locator="id / data-state / data-code" />
      <p className="desc">{t('secV3Desc')}</p>

      <div className="otp-layout">
        <div className="otp-main">
          {status === 'verified' ? (
            <>
              <p id="otp-result" className="success-msg" role="status">{t('otpVerified', { phone: sentTo })}</p>
              <div className="button-row">
                <button id="otp-reset" className="btn-secondary" onClick={reset}>{t('otpStartOver')}</button>
              </div>
            </>
          ) : !hasCode ? (
            <form className="verify-form" onSubmit={send} noValidate>
              <div className="form-field">
                <label className="field-label" htmlFor="otp-phone">{t('otpPhoneLabel')}</label>
                <input id="otp-phone" type="tel" dir="ltr" placeholder="+971 50 123 4567" value={phone}
                  onChange={e => setPhone(e.target.value)} />
              </div>
              {error && <p id="otp-error" className="error-msg" role="alert">{error}</p>}
              <div className="button-row">
                <button id="otp-send" type="submit" className="btn-primary" disabled={sending}>
                  {sending ? t('otpSending') : t('otpSend')}
                </button>
              </div>
            </form>
          ) : (
            <form className="verify-form" onSubmit={verify} noValidate>
              <p id="otp-sent-to" className="otp-info">{t('otpSentTo')} <bdi>{sentTo}</bdi></p>
              <OtpBoxes digits={digits} setDigits={setDigits} disabled={status !== 'sent'} />
              <p id="otp-expiry" className="drop-hint">
                {status === 'expired' ? t('otpExpired') : t('otpExpiresIn', { time: formatTime(expiresIn ?? 0) })}
              </p>
              {error && <p id="otp-error" className="error-msg" role="alert">{error}</p>}
              <div className="button-row">
                <button id="otp-verify" type="submit" className="btn-primary"
                  disabled={status !== 'sent' || !codeEntered}>
                  {status === 'verifying' ? t('verifyChecking') : t('otpVerify')}
                </button>
                <button id="otp-resend" type="button" className="btn-secondary"
                  disabled={!canResend || sending || status === 'verifying'} onClick={() => send()}>
                  {t('otpResend')}
                </button>
                <button id="otp-change-phone" type="button" className="btn-secondary" onClick={reset}>
                  {t('otpChangePhone')}
                </button>
              </div>
              <p id="otp-resend-timer" className="drop-hint">
                {canResend ? ' ' : t('otpResendIn', { s: Math.ceil(resendIn) })}
              </p>
            </form>
          )}
        </div>

        <aside className="dev-inbox" aria-labelledby="dev-inbox-title">
          <div className="dev-inbox-head">
            <h3 id="dev-inbox-title">{t('inboxTitle')}</h3>
            <div className="button-row">
              <button id="inbox-refresh" className="btn-secondary" onClick={loadInbox}>{t('inboxRefresh')}</button>
              <button id="inbox-clear" className="btn-secondary" disabled={inbox.length === 0}
                onClick={clearInbox}>{t('inboxClear')}</button>
            </div>
          </div>
          <p className="drop-hint">{t('inboxHint')}</p>
          <ul id="dev-inbox" className="dev-inbox-list">
            {inbox.length === 0 && <li className="dev-inbox-empty">{t('inboxEmpty')}</li>}
            {inbox.map(m => (
              <li key={m.id} data-testid="inbox-message" data-message-id={m.id} data-code={m.code} data-to={m.to}>
                <div className="dev-inbox-meta">
                  <bdi>{m.to}</bdi> · {new Date(m.sentAt).toLocaleTimeString()}
                </div>
                <div className="dev-inbox-text" dir="ltr">{m.text}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}

// ─── V4. Selfie ──────────────────────────────────────────────────────────────
// Uses the camera through getUserMedia. Tests grant or deny the permission and
// feed a fake camera (see README). Without a camera, upload a photo instead.
function SelfieSection() {
  const { t } = useLang()
  const { token } = useAuth()
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus]   = useState('idle') // idle | requesting | live | captured | uploading | uploaded | denied | unavailable
  const [photo, setPhoto]     = useState(null)   // { blob, url, type }
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  useEffect(() => () => stopCamera(), [])
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url) }, [photo])

  // The <video> only exists while live, so attach the stream once it renders.
  useEffect(() => {
    if (status === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [status])

  async function startCamera() {
    setError('')
    setResult(null)
    setPhoto(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      setError(t('selfieErrUnsupported'))
      return
    }
    setStatus('requesting')
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      setStatus('live')
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setStatus('denied')
        setError(t('selfieErrDenied'))
      } else if (err.name === 'NotSupportedError') {
        // Headless Chromium answers this way when no camera permission was set.
        setStatus('unavailable')
        setError(t('selfieErrUnsupported'))
      } else {
        setStatus('unavailable')
        setError(t('selfieErrNoCamera'))
      }
    }
  }

  function capture() {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      stopCamera()
      setPhoto({ blob, url: URL.createObjectURL(blob), type: 'image/jpeg' })
      setStatus('captured')
    }, 'image/jpeg', 0.85)
  }

  function choose(file) {
    if (!file) return
    setResult(null)
    if (!IMAGE_TYPES.includes(file.type)) { setError(t('verifyErrImageType')); return }
    if (file.size > MAX_IMAGE_BYTES) { setError(t('verifyErrImageSize')); return }
    stopCamera()
    setError('')
    setPhoto({ blob: file, url: URL.createObjectURL(file), type: file.type })
    setStatus('captured')
  }

  async function submit() {
    setStatus('uploading')
    setError('')
    const body = new FormData()
    body.append('file', photo.blob, photo.type === 'image/png' ? 'selfie.png' : 'selfie.jpg')
    try {
      const data = await apiFetch(`${API}/selfie`, { method: 'POST', token, body })
      setResult(data)
      setStatus('uploaded')
    } catch (err) {
      setError(err.status ? err.message : t('verifyErrNetwork'))
      setStatus('captured')
    }
  }

  function retake() {
    setPhoto(null)
    setResult(null)
    startCamera()
  }

  return (
    <section id="sec-verify-selfie" className="card" data-state={status}>
      <SectionHeader num="V4" title={t('secV4Title')} locator="id / data-state" />
      <p className="desc">{t('secV4Desc')}</p>

      <div className="selfie-stage" data-testid="selfie-stage">
        {status === 'live' && (
          <video ref={videoRef} id="selfie-video" className="selfie-video" autoPlay playsInline muted />
        )}
        {photo && <img id="selfie-preview" className="selfie-img" src={photo.url} alt={t('selfiePreviewAlt')} />}
        {!photo && status !== 'live' && (
          <span className="selfie-placeholder">{status === 'requesting' ? t('selfieRequesting') : '🙂'}</span>
        )}
      </div>

      <div className="button-row">
        {status === 'live' ? (
          <button id="selfie-capture" className="btn-primary" onClick={capture}>{t('selfieCapture')}</button>
        ) : photo ? (
          <>
            <button id="selfie-submit" className="btn-primary"
              disabled={status === 'uploading' || status === 'uploaded'} onClick={submit}>
              {status === 'uploading' ? t('selfieUploading') : t('selfieSubmit')}
            </button>
            <button id="selfie-retake" className="btn-secondary" disabled={status === 'uploading'}
              onClick={retake}>{t('selfieRetake')}</button>
          </>
        ) : (
          <button id="selfie-start" className="btn-primary" disabled={status === 'requesting'}
            onClick={startCamera}>{t('selfieStart')}</button>
        )}
      </div>

      <div className="form-field">
        <label className="field-label" htmlFor="selfie-file">{t('selfieFileLabel')}</label>
        <input id="selfie-file" type="file" accept="image/png,image/jpeg" capture="user"
          disabled={status === 'uploading'}
          onChange={e => { choose(e.target.files[0]); e.target.value = '' }} />
      </div>

      {error && <p id="selfie-error" className="error-msg" role="alert">{error}</p>}
      {result && (
        <Output id="selfie-result">
          {t('selfieUploaded', { kb: (result.bytes / 1024).toFixed(1), type: result.type })}
        </Output>
      )}
    </section>
  )
}

// ─── V5. ID Card OCR (simulated) ─────────────────────────────────────────────
// The server recognises the three sample cards by content and returns preset
// fields with confidence scores; any other image is "unreadable". ?ocrDelay=<ms>
// sets the reading time (default 1.5 s).
const OCR_SAMPLES = [
  { key: 'clean',   url: sampleClean,   file: 'id-clean.png' },
  { key: 'blurry',  url: sampleBlurry,  file: 'id-blurry.png' },
  { key: 'partial', url: samplePartial, file: 'id-partial.png' },
]

function OcrSection({ params }) {
  const { t } = useLang()
  const { token } = useAuth()
  const inputRef = useRef(null)
  const delay = params.get('ocrDelay')
  const [status, setStatus]   = useState('idle') // idle | reading | done | confirmed | error
  const [preview, setPreview] = useState(null)
  const [fields, setFields]   = useState([])     // [{ key, read, value, confidence }]
  const [error, setError]     = useState('')
  const [missing, setMissing] = useState([])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  async function read(file) {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) { setError(t('verifyErrImageType')); setStatus('error'); return }
    if (file.size > MAX_IMAGE_BYTES) { setError(t('verifyErrImageSize')); setStatus('error'); return }
    setPreview(URL.createObjectURL(file))
    setFields([])
    setMissing([])
    setError('')
    setStatus('reading')
    const body = new FormData()
    body.append('file', file)
    try {
      const data = await apiFetch(`${API}/ocr${query({ delay })}`, { method: 'POST', token, body })
      setFields(data.fields.map(f => ({ ...f, read: f.value })))
      setStatus('done')
    } catch (err) {
      setError(err.status ? err.message : t('verifyErrNetwork'))
      setStatus('error')
    }
  }

  function edit(key, value) {
    setFields(fs => fs.map(f => (f.key === key ? { ...f, value } : f)))
    setMissing(m => m.filter(k => k !== key))
  }

  function confirm(e) {
    e.preventDefault()
    const empty = fields.filter(f => !f.value.trim()).map(f => f.key)
    setMissing(empty)
    if (empty.length === 0) setStatus('confirmed')
  }

  function clear() {
    setPreview(null)
    setFields([])
    setMissing([])
    setError('')
    setStatus('idle')
  }

  const value = key => fields.find(f => f.key === key)?.value

  return (
    <section id="sec-verify-ocr" className="card media-wide" data-state={status}>
      <SectionHeader num="V5" title={t('secV5Title')} locator="id / data-confidence / data-state" />
      <p className="desc">{t('secV5Desc')}</p>

      <div className="ocr-samples">
        <span className="field-label">{t('ocrSamples')}</span>
        {OCR_SAMPLES.map(s => (
          <a key={s.key} id={`ocr-sample-${s.key}`} href={s.url} download={s.file} className="ocr-sample">
            <img src={s.url} alt="" />
            <span>{t(`ocrSample_${s.key}`)}</span>
          </a>
        ))}
      </div>

      <div className="sheet-toolbar">
        <button id="ocr-upload-btn" onClick={() => inputRef.current.click()} disabled={status === 'reading'}>
          {t('ocrUpload')}
        </button>
        <input ref={inputRef} id="ocr-file" type="file" accept="image/png,image/jpeg" style={{ display: 'none' }}
          onChange={e => { read(e.target.files[0]); e.target.value = '' }} />
        <button id="ocr-clear" className="btn-secondary" onClick={clear}
          disabled={status === 'idle' || status === 'reading'}>{t('ocrClear')}</button>
      </div>
      <p className="drop-hint">{t('ocrHint')}</p>

      {error && <p id="ocr-error" className="error-msg" role="alert">{error}</p>}

      {(status === 'reading' || fields.length > 0) && (
        <div className="ocr-layout">
          {preview && <img id="ocr-preview" className="ocr-preview" src={preview} alt={t('ocrPreviewAlt')} />}
          {status === 'reading' ? (
            <div className="ocr-reading" role="status" aria-live="polite">
              <div className="spinner" />
              <span id="ocr-status">{t('ocrReading')}</span>
            </div>
          ) : status === 'confirmed' ? (
            <div className="ocr-confirmed">
              <p id="ocr-result" className="success-msg" role="status">
                {t('ocrConfirmed', { name: value('fullName'), id: value('idNumber') })}
              </p>
            </div>
          ) : (
            <form className="ocr-form" onSubmit={confirm} noValidate>
              {fields.map(f => {
                const low = f.confidence < LOW_CONFIDENCE
                const notFound = !f.read
                return (
                  <div key={f.key} className="form-field">
                    <label className="field-label" htmlFor={`ocr-field-${f.key}`}>{t(`ocrField_${f.key}`)}</label>
                    <input id={`ocr-field-${f.key}`} type="text" dir="ltr" value={f.value}
                      className={missing.includes(f.key) ? 'input-error' : low ? 'ocr-low' : ''}
                      data-confidence={f.confidence} data-low-confidence={low}
                      data-edited={f.value !== f.read}
                      onChange={e => edit(f.key, e.target.value)} />
                    {missing.includes(f.key)
                      ? <span id={`ocr-error-${f.key}`} className="error-msg">{t('ocrRequired')}</span>
                      : low && (
                        <span id={`ocr-hint-${f.key}`} className="ocr-hint">
                          {notFound ? t('ocrNotFound') : t('ocrLowConfidence', { pct: Math.round(f.confidence * 100) })}
                        </span>
                      )}
                  </div>
                )
              })}
              <div className="button-row">
                <button id="ocr-confirm" type="submit" className="btn-success">{t('ocrConfirm')}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function VerificationPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const params = new URLSearchParams(useLocation().search)
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero verification-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="verification-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('verificationHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('verificationHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🛡️</div>
      </header>

      <div className="content-grid media-grid">
        <ImageCaptchaSection params={params} />
        <CheckboxCaptchaSection />
        <OtpSection params={params} />
        <SelfieSection />
        <OcrSection params={params} />
      </div>
    </div>
  )
}
