import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output, numberParam } from '../ui.jsx'

// All timers here read Date.now() and use setInterval/setTimeout, so Playwright's
// page.clock (or any fake timer) can fast-forward them.

const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// ─── L1. Live feed ───────────────────────────────────────────────────────────
const CUSTOMERS = ['Aarav', 'Mia', 'Noah', 'Zara', 'Liam', 'Ines', 'Omar', 'Yuki']
const KEEP = 20
const makeOrder = n => ({
  id: `ORD-${5000 + n}`,
  customer: CUSTOMERS[n % CUSTOMERS.length],
  amount: (19 + ((n * 37) % 180)).toFixed(2),
})

function LiveFeedSection() {
  const { t } = useLang()
  const [count, setCount]   = useState(3)
  const [paused, setPaused] = useState(false)
  const [cleared, setCleared] = useState(0)  // orders up to this number are hidden

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setCount(c => c + 1), numberParam('feedInterval', 2000, 200, 60000))
    return () => clearInterval(id)
  }, [paused])

  const orders = []
  for (let n = count; n > Math.max(cleared, count - KEEP); n--) orders.push(makeOrder(n))

  return (
    <section id="sec-live-feed" className="card" data-state={paused ? 'paused' : 'live'} data-count={count}>
      <SectionHeader num="L1" title={t('secL1Title')} locator="data-order-id / data-count" />
      <p className="desc">{t('secL1Desc', { keep: KEEP })}</p>
      <ul className="lab-feed" data-testid="live-feed" aria-live="polite" aria-label={t('secL1Title')}>
        {orders.map((o, i) => (
          <li key={o.id} data-order-id={o.id} data-amount={o.amount} className={i === 0 && !paused ? 'is-new' : ''}>
            <span><strong>{o.id}</strong> · {o.customer}</span>
            <span className="lab-feed-amount">${o.amount}</span>
          </li>
        ))}
        {!orders.length && <li className="lab-feed-empty" id="feed-empty">{t('feedEmpty')}</li>}
      </ul>
      <div className="button-row">
        <button id="feed-toggle" className="btn-secondary" aria-pressed={paused} onClick={() => setPaused(p => !p)}>
          {paused ? t('feedResume') : t('feedPause')}
        </button>
        <button id="feed-clear" className="btn-secondary" onClick={() => setCleared(count)}>{t('liveClear')}</button>
      </div>
      <Output id="feed-status">{t('feedStatus', { n: count, id: makeOrder(count).id })}</Output>
    </section>
  )
}

// ─── L2. Countdown timer ─────────────────────────────────────────────────────
function CountdownSection() {
  const { t } = useLang()
  const total = useRef(numberParam('countdown', 30, 1, 3600)).current
  const [state, setState]     = useState('idle')  // idle | running | paused | done
  const [remaining, setRemaining] = useState(total)
  const endAt = useRef(0)

  useEffect(() => {
    if (state !== 'running') return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) setState('done')
    }
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [state])

  const start = () => { endAt.current = Date.now() + remaining * 1000; setState('running') }
  const pause = () => setState('paused')
  const reset = () => { setState('idle'); setRemaining(total) }

  return (
    <section id="sec-live-countdown" className="card" data-state={state} data-remaining={remaining}>
      <SectionHeader num="L2" title={t('secL2Title')} locator="data-remaining / data-state" />
      <p className="desc">{t('secL2Desc', { s: total })}</p>
      <div className={`lab-countdown ${state === 'done' ? 'is-done' : ''}`} data-testid="countdown"
        role="timer" aria-label={t('secL2Title')}>
        {mmss(remaining)}
      </div>
      <div className="button-row">
        <button id="countdown-start" className="btn-primary" disabled={state === 'running' || state === 'done'}
          onClick={start}>{state === 'paused' ? t('cdResume') : t('cdStart')}</button>
        <button id="countdown-pause" className="btn-secondary" disabled={state !== 'running'} onClick={pause}>
          {t('cdPause')}
        </button>
        <button id="countdown-reset" className="btn-secondary" onClick={reset}>{t('cdReset')}</button>
      </div>
      {state === 'done' && <p id="countdown-done" className="lab-alert" role="alert">{t('cdDone')}</p>}
      <Output id="countdown-status">{t('cdStatus', { state: t(`cd_${state}`), s: remaining })}</Output>
    </section>
  )
}

// ─── L3. Moving target and re-rendered rows ──────────────────────────────────
const PRODUCTS = ['Keyboard', 'Mouse', 'Monitor']

function MovingTargetSection() {
  const { t } = useLang()
  const arenaRef = useRef(null)
  const btnRef   = useRef(null)
  const [pos, setPos]         = useState({ x: 10, y: 10 })
  const [moving, setMoving]   = useState(true)
  const [caught, setCaught]   = useState(0)
  const [version, setVersion] = useState(1)
  const [bought, setBought]   = useState(null)

  useEffect(() => {
    if (!moving) return
    const id = setInterval(() => {
      const a = arenaRef.current, b = btnRef.current
      if (!a || !b) return
      setPos({
        x: Math.round(Math.random() * Math.max(0, a.clientWidth - b.offsetWidth)),
        y: Math.round(Math.random() * Math.max(0, a.clientHeight - b.offsetHeight)),
      })
    }, numberParam('moveInterval', 1500, 200, 10000))
    return () => clearInterval(id)
  }, [moving])

  // The rows keep the same text, but React builds brand-new DOM nodes for them every 3 s.
  useEffect(() => {
    const id = setInterval(() => setVersion(v => v + 1), numberParam('rerenderInterval', 3000, 200, 60000))
    return () => clearInterval(id)
  }, [])

  return (
    <section id="sec-live-moving" className="card" data-clicks={caught} data-moving={moving}>
      <SectionHeader num="L3" title={t('secL3Title')} locator="data-testid / data-version" />
      <p className="desc">{t('secL3Desc')}</p>
      <div ref={arenaRef} className="lab-arena">
        <button ref={btnRef} className="btn-primary lab-mover" data-testid="moving-button" data-clicks={caught}
          style={{ left: pos.x, top: pos.y }} onClick={() => setCaught(c => c + 1)}>{t('moverCatch')}</button>
      </div>
      <div className="button-row">
        <button id="mover-toggle" className="btn-secondary" aria-pressed={!moving} onClick={() => setMoving(m => !m)}>
          {moving ? t('moverPause') : t('moverResume')}
        </button>
      </div>
      <ul className="lab-rerender" data-testid="rerender-list" data-version={version}>
        {PRODUCTS.map(p => (
          <li key={`${p}-${version}`} data-product={p}>
            <span>{p}</span>
            <button className="btn-secondary" data-testid={`buy-${p.toLowerCase()}`}
              onClick={() => setBought(p)}>{t('buyBtn')}</button>
          </li>
        ))}
      </ul>
      <Output id="mover-status">
        {t('moverStatus', { n: caught })} · {t('boughtStatus', { item: bought || t('liveNone') })}
      </Output>
    </section>
  )
}

// ─── L4. Session-timeout warning ─────────────────────────────────────────────
function SessionSection() {
  const { t } = useLang()
  const length = useRef(numberParam('sessionLength', 12, 3, 600)).current
  const warnAt = useRef(Math.min(numberParam('sessionWarn', 6, 1, 600), length - 1)).current
  const [state, setState]   = useState('idle')  // idle | active | warning | expired | signed-out
  const [left, setLeft]     = useState(length)
  const [extended, setExtended] = useState(0)
  const endAt = useRef(0)
  const stayRef = useRef(null)
  const startRef = useRef(null)

  const running = state === 'active' || state === 'warning'
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setLeft(s)
      setState(s === 0 ? 'expired' : s <= warnAt ? 'warning' : 'active')
    }, 200)
    return () => clearInterval(id)
  }, [running, warnAt])

  useEffect(() => { if (state === 'warning') stayRef.current?.focus() }, [state])
  useEffect(() => { if (state === 'expired' || state === 'signed-out') startRef.current?.focus() }, [state])

  const start = () => { endAt.current = Date.now() + length * 1000; setLeft(length); setExtended(0); setState('active') }
  const stay = () => { endAt.current = Date.now() + length * 1000; setLeft(length); setExtended(n => n + 1); setState('active') }
  const signOut = () => setState('signed-out')

  return (
    <section id="sec-live-session" className="card" data-session-state={state} data-remaining={left}>
      <SectionHeader num="L4" title={t('secL4Title')} locator="data-session-state / alertdialog" />
      <p className="desc">{t('secL4Desc', { length, warn: warnAt })}</p>
      <div className="lab-session" data-testid="session-panel">
        <span className={`lab-dot lab-dot-${state}`} aria-hidden />
        <span>{t(`session_${state}`, { s: left })}</span>
      </div>
      <div className="button-row">
        <button ref={startRef} id="session-start" className="btn-primary" disabled={running} onClick={start}>
          {state === 'idle' ? t('sessionStart') : t('sessionStartAgain')}
        </button>
      </div>
      <Output id="session-status">
        {t('sessionStatus', { state: t(`sessionState_${state}`) })}
        {extended > 0 && ` · ${t('sessionExtended', { n: extended })}`}
      </Output>

      {state === 'warning' && (
        <>
          <div className="lab-overlay" />
          <div className="lab-dialog lab-dialog-warn" role="alertdialog" aria-modal="true"
            aria-labelledby="session-title" aria-describedby="session-desc" data-testid="session-modal">
            <h3 id="session-title">{t('sessionWarnTitle')}</h3>
            <p id="session-desc">{t('sessionWarnDesc', { s: left })}</p>
            <div className="lab-countdown lab-countdown-sm" id="session-remaining" data-remaining={left}>{mmss(left)}</div>
            <div className="button-row">
              <button ref={stayRef} id="session-stay" className="btn-primary" onClick={stay}>{t('sessionStay')}</button>
              <button id="session-signout" className="btn-secondary" onClick={signOut}>{t('sessionSignOut')}</button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LivePage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero live-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="live-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('liveHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('liveHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>⏱️</div>
      </header>

      <div className="content-grid media-grid lab-first-grid">
        <LiveFeedSection />
        <CountdownSection />
        <MovingTargetSection />
        <SessionSection />
      </div>
    </div>
  )
}
