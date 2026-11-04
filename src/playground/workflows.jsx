// Playground sections 26 and 27 (also under "Advanced" in the sidebar, kept in
// their own file for size): progress bars and a 4-step wizard.
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader } from '../ui.jsx'

// ─── 26. Progress Bar ────────────────────────────────────────────────────────
// A determinate bar that fills in random steps (it can be set to stall at 60%
// and then fail), and an indeterminate bar with no aria-valuenow while it runs.
// Wait on aria-valuenow / data-state, never on a fixed sleep.
const PROGRESS_STATUS_KEYS = {
  idle:      'progressIdle',
  running:   'progressRunning',
  complete:  'progressComplete',
  failed:    'progressFailed',
  cancelled: 'progressCancelled',
}

/** The determinate and indeterminate progress bars described above. */
export function ProgressSection() {
  const { t } = useLang()
  const [pct, setPct]           = useState(0)
  const [state, setState]       = useState('idle')
  const [failAt60, setFailAt60] = useState(false)
  const [task, setTask]         = useState('idle')
  const timer     = useRef(null)
  const taskTimer = useRef(null)

  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(taskTimer.current) }, [])

  /**
   * Advances the bar by 3–12% every 150–300 ms until 100%. In fail mode it is
   * capped at 60%, sits there for 2 s, then fails.
   * Each step schedules the next with setTimeout, so cancel() only has to clear one timer.
   */
  function step(value, fail) {
    if (value >= 100) { setState('complete'); return }
    if (fail && value >= 60) {
      timer.current = setTimeout(() => setState('failed'), 2000)
      return
    }
    timer.current = setTimeout(() => {
      let next = Math.min(100, value + 3 + Math.floor(Math.random() * 10))
      if (fail) next = Math.min(next, 60)
      setPct(next)
      step(next, fail)
    }, 150 + Math.floor(Math.random() * 150))
  }

  function start() {
    clearTimeout(timer.current)
    setPct(0)
    setState('running')
    step(0, failAt60)
  }

  function cancel() {
    clearTimeout(timer.current)
    setState('cancelled')
  }

  /** Runs the indeterminate task for a random 2–4 s. */
  function startTask() {
    setTask('running')
    taskTimer.current = setTimeout(() => setTask('done'), 2000 + Math.floor(Math.random() * 2001))
  }

  const running = state === 'running'

  return (
    <section id="sec-progress" className="card">
      <SectionHeader num="26" title={t('sec26Title')} locator="role=progressbar / aria-valuenow" tip="tip26" />
      <p className="desc">{t('sec26Desc')}</p>

      <div className="progress-block">
        <div className="progress-head">
          <span className="field-label" id="progress-upload-label">{t('progressUploadLabel')}</span>
          <span id="progress-upload-pct" className="progress-pct">{pct}%</span>
        </div>
        <div id="progress-upload" className="progress-track" role="progressbar"
          aria-labelledby="progress-upload-label" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={pct} data-state={state}>
          <div className="progress-fill" style={{ inlineSize: `${pct}%` }} />
        </div>
        <p id="progress-upload-status" className="progress-status" data-state={state} role="status">
          {t(PROGRESS_STATUS_KEYS[state])}
        </p>
      </div>

      <label className="checkbox-label" htmlFor="progress-fail-toggle">
        <input type="checkbox" id="progress-fail-toggle" checked={failAt60} disabled={running}
          onChange={e => setFailAt60(e.target.checked)} />
        {t('progressFailToggle')}
      </label>

      <div className="button-row">
        <button id="progress-start" className="btn-primary" disabled={running} onClick={start}>
          {state === 'idle' ? t('progressStart') : t('progressRestart')}
        </button>
        <button id="progress-cancel" className="btn-secondary" disabled={!running} onClick={cancel}>
          {t('progressCancel')}
        </button>
      </div>

      <div className="progress-block">
        <span className="field-label" id="progress-task-label">{t('progressTaskLabel')}</span>
        {/* ARIA: an indeterminate progressbar has no value attributes; they appear only once it is done. */}
        <div id="progress-indeterminate" className="progress-track progress-indeterminate"
          role="progressbar" aria-labelledby="progress-task-label"
          aria-valuemin={task === 'done' ? 0 : undefined}
          aria-valuemax={task === 'done' ? 100 : undefined}
          aria-valuenow={task === 'done' ? 100 : undefined}
          aria-busy={task === 'running'} data-state={task}>
          {task !== 'idle' && <div className="progress-fill" />}
        </div>
        <p id="progress-task-status" className="progress-status" data-state={task} role="status">
          {t(task === 'done' ? 'progressTaskDone' : task === 'running' ? 'progressTaskRunning' : 'progressIdle')}
        </p>
      </div>

      <div className="button-row">
        <button id="progress-task-start" className="btn-secondary" disabled={task === 'running'}
          onClick={startTask}>{t('progressTaskStart')}</button>
      </div>
    </section>
  )
}

// ─── 27. Stepper ─────────────────────────────────────────────────────────────
// A 4-step wizard. Next checks the current step before moving on; earlier steps
// stay clickable to go back, later ones are disabled. Values are kept when
// moving back and forth.
const STEPS = [
  { key: 'account', labelKey: 'stepAccount' },
  { key: 'address', labelKey: 'stepAddress' },
  { key: 'prefs',   labelKey: 'stepPrefs' },
  { key: 'review',  labelKey: 'stepReview' },
]
const STEPPER_COUNTRIES = ['in', 'ae', 'gb', 'us']
const STEPPER_EMPTY = { name: '', email: '', city: '', country: '', contact: '', newsletter: false }

/**
 * Checks the fields of one wizard step.
 * @param step 0-based step index; the review step (3) has nothing to check.
 * @param v All the wizard's values.
 * @returns Translation keys of the errors, keyed by field; empty if the step is valid.
 */
function validateStep(step, v) {
  const errors = {}
  if (step === 0) {
    if (!v.name.trim()) errors.name = 'stepErrName'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'stepErrEmail'
  } else if (step === 1) {
    if (!v.city.trim()) errors.city = 'stepErrCity'
    if (!v.country)     errors.country = 'stepErrCountry'
  } else if (step === 2) {
    if (!v.contact) errors.contact = 'stepErrContact'
  }
  return errors
}

/** The 4-step wizard described above. */
export function StepperSection() {
  const { t } = useLang()
  const [step, setStep]           = useState(0)
  const [values, setValues]       = useState(STEPPER_EMPTY)
  const [errors, setErrors]       = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key, value) => setValues(v => ({ ...v, [key]: value }))

  function goTo(i) { setErrors({}); setStep(i) }

  function next() {
    const errs = validateStep(step, values)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep(step + 1)
  }

  function reset() {
    setValues(STEPPER_EMPTY)
    setErrors({})
    setSubmitted(false)
    setStep(0)
  }

  const err = key => errors[key] && (
    <span id={`stepper-error-${key}`} className="error-msg">{t(errors[key])}</span>
  )

  const review = [
    { key: 'name',       value: values.name },
    { key: 'email',      value: values.email },
    { key: 'city',       value: values.city },
    { key: 'country',    value: values.country && t(`country_${values.country}`) },
    { key: 'contact',    value: values.contact && t(`stepContact_${values.contact}`) },
    { key: 'newsletter', value: t(values.newsletter ? 'stepYes' : 'stepNo') },
  ]

  return (
    <section id="sec-stepper" className="card card-acting">
      <SectionHeader num="27" title={t('sec27Title')} locator="data-step / aria-current" tip="tip27" />
      <p className="desc">{t('sec27Desc')}</p>

      <ol className="stepper" aria-label={t('stepperAria')}>
        {STEPS.map((s, i) => {
          const state = submitted || i < step ? 'complete' : i === step ? 'active' : 'upcoming'
          return (
            <li key={s.key} className="stepper-item" data-step={i + 1} data-state={state}>
              <button type="button" className="stepper-btn" data-testid={`stepper-step-${i + 1}`}
                aria-current={state === 'active' ? 'step' : undefined}
                disabled={submitted || i >= step} onClick={() => goTo(i)}>
                <span className="stepper-dot">{state === 'complete' ? '✓' : i + 1}</span>
                <span className="stepper-label">{t(s.labelKey)}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {submitted ? (
        <div className="stepper-panel">
          <p id="stepper-result" className="success-msg">{t('stepSubmitted', { name: values.name })}</p>
          <div className="button-row">
            <button id="stepper-reset" className="btn-secondary" onClick={reset}>{t('stepStartOver')}</button>
          </div>
        </div>
      ) : (
        <div className="stepper-panel" data-testid="stepper-panel" data-step={step + 1}>
          {step === 0 && (
            <>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-name">{t('stepName')}</label>
                <input id="stepper-name" type="text" value={values.name}
                  className={errors.name ? 'input-error' : ''}
                  onChange={e => set('name', e.target.value)} />
                {err('name')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-email">{t('stepEmail')}</label>
                <input id="stepper-email" type="text" value={values.email}
                  className={errors.email ? 'input-error' : ''}
                  onChange={e => set('email', e.target.value)} />
                {err('email')}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-city">{t('stepCity')}</label>
                <input id="stepper-city" type="text" value={values.city}
                  className={errors.city ? 'input-error' : ''}
                  onChange={e => set('city', e.target.value)} />
                {err('city')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="stepper-country">{t('stepCountry')}</label>
                <select id="stepper-country" value={values.country}
                  onChange={e => set('country', e.target.value)}>
                  <option value="">{t('stepCountryPh')}</option>
                  {STEPPER_COUNTRIES.map(c => <option key={c} value={c}>{t(`country_${c}`)}</option>)}
                </select>
                {err('country')}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-field">
                <span className="field-label">{t('stepContact')}</span>
                <div className="cond-radio-group">
                  {['email', 'sms'].map(c => (
                    <label key={c} className="cond-radio-label" htmlFor={`stepper-contact-${c}`}>
                      <input type="radio" name="stepper-contact" id={`stepper-contact-${c}`}
                        value={c} checked={values.contact === c}
                        onChange={() => set('contact', c)} />
                      {t(`stepContact_${c}`)}
                    </label>
                  ))}
                </div>
                {err('contact')}
              </div>
              <label className="checkbox-label" htmlFor="stepper-newsletter">
                <input type="checkbox" id="stepper-newsletter" checked={values.newsletter}
                  onChange={e => set('newsletter', e.target.checked)} />
                {t('stepNewsletter')}
              </label>
            </>
          )}

          {step === 3 && (
            <dl id="stepper-review" className="stepper-review">
              {review.map(r => (
                <div key={r.key} className="stepper-review-row">
                  <dt>{t(`stepReview_${r.key}`)}</dt>
                  <dd data-field={r.key}>{r.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="button-row">
            <button id="stepper-back" className="btn-secondary" disabled={step === 0}
              onClick={() => goTo(step - 1)}>{t('stepBack')}</button>
            {step < STEPS.length - 1
              ? <button id="stepper-next" className="btn-primary" onClick={next}>{t('stepNext')}</button>
              : <button id="stepper-submit" className="btn-success" onClick={() => setSubmitted(true)}>{t('stepSubmit')}</button>}
          </div>
        </div>
      )}
    </section>
  )
}
