import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// A srcdoc attribute value is HTML-decoded once, so escape each nesting level.
function escapeAttr(html) {
  return html.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

// Message a frame posts to the top page when it is pressed.
const FRAME_CLICK = 'tp-frame-click'

// One self-contained frame page: badge, title, input + button, result line,
// and optionally a child iframe. Ids are `${prefix}-input/-btn/-result`.
// With `card`, any press inside the frame tells the top page about it (see FrameCard).
function frameDoc({ dir, prefix, badge, title, placeholder, btn, init, card,
  resultPrefix = 'Value: ', accent = '#4f46e5', bg = 'linear-gradient(135deg,#ede9fe,#dbeafe)', child = '' }) {
  const label = resultPrefix.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const reportClicks = card
    ? `<script>document.addEventListener('pointerdown',function(){window.top.postMessage({type:'${FRAME_CLICK}',card:'${card}'},'*')})</script>`
    : ''
  return `<!DOCTYPE html><html dir="${dir}"><head><style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,sans-serif}
  html,body{height:100%}
  body{padding:16px;background:${bg};display:flex;flex-direction:column;gap:10px}
  .badge{align-self:flex-start;background:${accent};color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em}
  h3{color:${accent};font-size:14px}
  .row{display:flex;gap:8px}
  input{flex:1;min-width:0;padding:8px 12px;border:1px solid #c4b5fd;border-radius:6px;font-size:14px;background:#fff;outline:none}
  input:focus{border-color:${accent}}
  button{padding:8px 16px;background:${accent};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}
  button:hover{filter:brightness(.92)}
  .result{padding:10px 12px;background:#fff;border-radius:6px;color:${accent};font-size:14px;border:1px solid #c4b5fd;min-height:38px}
  .child{flex:1;min-height:150px;width:100%;border:2px dashed ${accent};border-radius:8px;background:#fff}
</style></head><body>
  <span class="badge">${badge}</span>
  <h3>${title}</h3>
  <div class="row">
    <input id="${prefix}-input" type="text" placeholder="${placeholder}"/>
    <button id="${prefix}-btn" onclick="document.getElementById('${prefix}-result').textContent='${label}'+document.getElementById('${prefix}-input').value">${btn}</button>
  </div>
  <div id="${prefix}-result" class="result">${init}</div>
  ${child}
  ${reportClicks}
</body></html>`
}

// Same idea as the Delayed Widget: 1–6 s, or ?delay=<ms> for deterministic runs.
function pickDelay() {
  const override = Number.parseInt(new URLSearchParams(window.location.search).get('delay'), 10)
  if (Number.isFinite(override) && override >= 0) return override
  return 1000 + Math.floor(Math.random() * 5001)
}

// ─── Expandable card ─────────────────────────────────────────────────────────
// expandOn="click": a press inside any of its frames (reported via postMessage,
// since frame events never bubble to the page) or a click on the card itself
// blows it up into an overlay. expandOn="button": only the Expand button does.
// The section is restyled in place rather than re-rendered elsewhere, so the
// iframes never reload and whatever was typed inside them survives.
function FrameCard({ id, num, title, locator, desc, wide, expandOn = 'click', children }) {
  const { t } = useLang()
  const cardRef = useRef(null)
  const [expanded, setExpanded]     = useState(false)
  const [holdHeight, setHoldHeight] = useState(0)

  const open = () => {
    setHoldHeight(cardRef.current.offsetHeight)
    setExpanded(true)
  }
  const close = () => setExpanded(false)

  useEffect(() => {
    if (!expanded) return
    const onKey = e => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const clickToExpand = expandOn === 'click'

  useEffect(() => {
    if (!clickToExpand || expanded) return
    const onMessage = e => {
      if (e.data?.type === FRAME_CLICK && e.data.card === id) open()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [clickToExpand, expanded, id])

  const onCardClick = e => {
    if (!clickToExpand || expanded || e.target.closest('button, a, input, select, textarea, label')) return
    open()
  }

  return (
    <>
      {/* Holds the card's grid cell while it is lifted out, so the page doesn't jump. */}
      {expanded && <div className={`frame-card-spacer ${wide ? 'media-wide' : ''}`}
        style={{ height: holdHeight }} aria-hidden />}
      {expanded && <div className="frame-backdrop" data-testid="frame-backdrop" onClick={close} />}
      <section ref={cardRef} id={id}
        className={`card frame-card ${wide ? 'media-wide' : ''} ${clickToExpand ? '' : 'frame-card-button-only'} ${expanded ? 'frame-card-expanded' : ''}`}
        data-expanded={expanded} data-expand-on={expandOn} onClick={onCardClick}
        role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined}
        aria-label={expanded ? title : undefined}>
        <div className="frame-card-head">
          <SectionHeader num={num} title={title} locator={locator} />
          <button className="btn-secondary frame-toggle" data-testid={`${id}-toggle`}
            aria-expanded={expanded} onClick={() => (expanded ? close() : open())}>
            {expanded ? `✕ ${t('frameCollapse')}` : `⤢ ${t('frameExpand')}`}
          </button>
        </div>
        <p className="desc">{desc}</p>
        {children}
      </section>
    </>
  )
}

// ─── F1. Basic iFrame (moved from the main page, locators unchanged) ─────────
function BasicFrameSection() {
  const { t, lang } = useLang()
  const doc = frameDoc({
    dir: lang === 'ar' ? 'rtl' : 'ltr', prefix: 'iframe', card: 'sec-frames-basic',
    badge: t('iframeBadge'), title: t('iframeTitle'), placeholder: t('iframePlaceholder'),
    btn: t('iframeBtnRead'), init: t('iframeResultInit'),
  })
  return (
    <FrameCard id="sec-frames-basic" num="F1" title={t('secF1Title')} locator="id (within frame)"
      desc={t('secF1Desc')}>
      <div className="frame-stage">
        <iframe id="practice-iframe" title="Practice iFrame" srcDoc={doc}
          className="practice-iframe frame-fill" />
      </div>
    </FrameCard>
  )
}

// ─── F2. Nested iFrames (3 levels) ───────────────────────────────────────────
const NESTED_LEVELS = [
  { accent: '#4f46e5', bg: 'linear-gradient(135deg,#ede9fe,#dbeafe)' },
  { accent: '#0f766e', bg: 'linear-gradient(135deg,#ccfbf1,#e0f2fe)' },
  { accent: '#c2410c', bg: 'linear-gradient(135deg,#ffedd5,#fef9c3)' },
]

function NestedFrameSection() {
  const { t, lang } = useLang()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // Build innermost first, wrapping each level's page into its parent's srcdoc.
  const doc = NESTED_LEVELS.reduceRight((child, style, i) => {
    const n = i + 1
    const childTag = child
      ? `<iframe id="nested-level-${n + 1}" class="child" title="${t('nestedFrameTitle', { n: n + 1 })}" srcdoc="${escapeAttr(child)}"></iframe>`
      : ''
    return frameDoc({
      dir, prefix: `level${n}`, ...style, child: childTag, card: 'sec-frames-nested',
      badge: t('nestedBadge', { n }), title: t(`nestedTitle${n}`),
      placeholder: t('nestedPlaceholder', { n }), btn: t('iframeBtnRead'),
      init: t('iframeResultInit'), resultPrefix: t('nestedResult', { n }),
    })
  }, '')

  return (
    <FrameCard id="sec-frames-nested" num="F2" title={t('secF2Title')} locator="id → id → id"
      desc={t('secF2Desc')}>
      <div className="frame-stage">
        <iframe id="nested-level-1" title={t('nestedFrameTitle', { n: 1 })} srcDoc={doc}
          className="practice-iframe frame-fill frame-tall" />
      </div>
    </FrameCard>
  )
}

// ─── F3. Late-loading iFrame ─────────────────────────────────────────────────
function LateFrameSection() {
  const { t, lang } = useLang()
  const [run, setRun]     = useState(0)
  const [delay, setDelay] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    const ms = pickDelay()
    setDelay(ms)
    setState('loading')
    const timer = setTimeout(() => setState('loaded'), ms)
    return () => clearTimeout(timer)
  }, [run])

  const loading = state === 'loading'
  const doc = frameDoc({
    dir: lang === 'ar' ? 'rtl' : 'ltr', prefix: 'late', card: 'sec-frames-late',
    accent: '#0284c7', bg: 'linear-gradient(135deg,#e0f2fe,#f0f9ff)',
    badge: t('lateBadge'), title: t('lateTitle'), placeholder: t('iframePlaceholder'),
    btn: t('iframeBtnRead'), init: t('iframeResultInit'),
  })

  return (
    <FrameCard id="sec-frames-late" num="F3" title={t('secF3Title')} locator="data-state / id"
      desc={t('secF3Desc')}>
      <div className="frame-stage">
        <div className="frame-slot" data-testid="late-frame-slot" data-state={state}
          data-delay-ms={delay ?? undefined} aria-busy={loading}>
          {loading ? (
            <div className="frame-placeholder" role="status" aria-live="polite">
              <div className="spinner" />
              <span>{t('lateLoading')}</span>
            </div>
          ) : (
            <iframe id="late-iframe" title={t('lateTitle')} srcDoc={doc}
              className="practice-iframe frame-fill" />
          )}
        </div>
      </div>
      <div className="button-row">
        <button id="btn-reload-frame" className="btn-secondary" disabled={loading}
          onClick={() => setRun(r => r + 1)}>{t('btnReloadFrame')}</button>
      </div>
      <Output id="late-frame-status">
        {loading ? t('lateLoading') : t('lateLoadedIn', { seconds: (delay / 1000).toFixed(1) })}
      </Output>
    </FrameCard>
  )
}

// ─── F4. Multiple iFrames without ids ────────────────────────────────────────
// Every frame reuses the same inner ids, so a test has to pick the right frame
// first. Each is findable a different way: by name, by title, or by index only.
const MULTI_FRAMES = [
  { key: 'orders',   attrs: { name: 'orders-frame' },     hint: 'name="orders-frame"',
    accent: '#7c3aed', bg: 'linear-gradient(135deg,#ede9fe,#faf5ff)' },
  { key: 'payments', attrs: { title: 'Payments frame' },  hint: 'title="Payments frame"',
    accent: '#059669', bg: 'linear-gradient(135deg,#d1fae5,#f0fdf4)' },
  { key: 'reviews',  attrs: {},                           hint: null,
    accent: '#db2777', bg: 'linear-gradient(135deg,#fce7f3,#fff1f2)' },
]

function MultipleFramesSection() {
  const { t, lang } = useLang()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <FrameCard id="sec-frames-multiple" num="F4" title={t('secF4Title')} locator="name / title / index"
      desc={t('secF4Desc')} wide>
      <div className="frame-stage">
        <div className="frame-row">
          {MULTI_FRAMES.map((f, i) => {
            const label = t(`multi_${f.key}`)
            return (
              <figure key={f.key} className="frame-tile">
                <figcaption className="frame-hint">
                  <code dir="ltr">{f.hint ?? t('multiIndexOnly', { i })}</code>
                </figcaption>
                <iframe {...f.attrs} className="practice-iframe frame-fill" srcDoc={frameDoc({
                  dir, prefix: 'frame', accent: f.accent, bg: f.bg, card: 'sec-frames-multiple',
                  badge: t('multiBadge', { n: i + 1 }), title: label,
                  placeholder: t('iframePlaceholder'), btn: t('iframeBtnRead'),
                  init: t('iframeResultInit'), resultPrefix: `${label}: `,
                })} />
              </figure>
            )
          })}
        </div>
      </div>
    </FrameCard>
  )
}

// ─── F5. Expand-button only ──────────────────────────────────────────────────
// No `card` passed to frameDoc, so this frame never reports presses: only the
// Expand button opens the card.
function ButtonOnlyFrameSection() {
  const { t, lang } = useLang()
  const doc = frameDoc({
    dir: lang === 'ar' ? 'rtl' : 'ltr', prefix: 'button-only',
    accent: '#b45309', bg: 'linear-gradient(135deg,#fef3c7,#fff7ed)',
    badge: t('buttonOnlyBadge'), title: t('buttonOnlyTitle'), placeholder: t('iframePlaceholder'),
    btn: t('iframeBtnRead'), init: t('iframeResultInit'),
  })
  return (
    <FrameCard id="sec-frames-button-only" num="F5" title={t('secF5Title')} locator="id / Expand button"
      desc={t('secF5Desc')} expandOn="button">
      <div className="frame-stage">
        <iframe id="button-only-iframe" title={t('buttonOnlyTitle')} srcDoc={doc}
          className="practice-iframe frame-fill" />
      </div>
    </FrameCard>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function FramesPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero frames-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="frames-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('framesHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('framesHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🪟</div>
      </header>

      <div className="content-grid media-grid">
        <BasicFrameSection />
        <NestedFrameSection />
        <LateFrameSection />
        <MultipleFramesSection />
        <ButtonOnlyFrameSection />
      </div>
    </div>
  )
}
