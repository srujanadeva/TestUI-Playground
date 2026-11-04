// Media page (/media): images and videos that load, break or load lazily (M1–M6),
// plus banners: a hero carousel (M7), a promo banner (M8), and an announcement bar
// and cookie consent whose dismissal is remembered in localStorage (M9).
import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output, numberParam } from '../ui.jsx'
import testImage from '../testresources/testimage.jpg'
import testVideo from '../testresources/testvideo.mp4'

// Paths that don't exist, so the browser fires an error event.
const MISSING_IMAGE = '/testresources/missing-image.jpg'
const MISSING_VIDEO = '/testresources/missing-video.mp4'

const ANNOUNCEMENT_KEY = 'tp-media-announcement-dismissed'
const COOKIE_KEY       = 'tp-media-cookie-consent'

/**
 * Reads a localStorage value. Storage can throw (private mode, blocked site
 * data), so that counts as "nothing stored".
 * @returns The stored string, or null.
 */
function readStore(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
/** Saves a localStorage value, or removes it when `value` is null; failures are ignored. */
function writeStore(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch { /* ignore */ }
}

/**
 * Becomes true once `targetRef` scrolls into view inside the scroll box `rootRef`,
 * and then stays true (the observer is dropped).
 * @returns Whether the target has been seen.
 */
function useRevealInBox(rootRef, targetRef) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const root = rootRef.current
    const target = targetRef.current
    if (!root || !target || visible) return
    const observer = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) setVisible(true) },
      { root, threshold: 0.1 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [rootRef, targetRef, visible])
  return visible
}

/** Seconds → "m:ss"; "0:00" while the duration is still unknown (NaN). */
function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00'
  const s = Math.floor(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ─── M1. Image — Loads ───────────────────────────────────────────────────────
/** An image that loads; data-state and the status line report its natural size. */
function ImageLoadedSection() {
  const { t } = useLang()
  const [state, setState] = useState('loading')
  const [size, setSize]   = useState(null)
  return (
    <section id="sec-media-image-loaded" className="card">
      <SectionHeader num="M1" title={t('secM1Title')} locator="data-testid / data-state" />
      <p className="desc">{t('secM1Desc')}</p>
      <div className="media-frame">
        <img src={testImage} alt={t('imgAlt')} className="media-img"
          data-testid="image-loaded" data-state={state}
          onLoad={e => { setSize([e.target.naturalWidth, e.target.naturalHeight]); setState('loaded') }}
          onError={() => setState('broken')} />
      </div>
      <Output id="image-loaded-status">
        {state === 'loaded' ? t('imgLoaded', { w: size[0], h: size[1] })
          : state === 'broken' ? t('imgBroken') : t('imgLoading')}
      </Output>
    </section>
  )
}

// ─── M2. Image — Broken ──────────────────────────────────────────────────────
/** An image whose file doesn't exist: it is hidden and replaced by a fallback once the error fires. */
function ImageBrokenSection() {
  const { t } = useLang()
  const [state, setState] = useState('loading')
  return (
    <section id="sec-media-image-broken" className="card">
      <SectionHeader num="M2" title={t('secM2Title')} locator="data-testid / data-state" />
      <p className="desc">{t('secM2Desc')}</p>
      <div className="media-frame">
        <img src={MISSING_IMAGE} alt={t('imgBrokenAlt')}
          className={`media-img ${state === 'broken' ? 'media-hidden' : ''}`}
          data-testid="image-broken" data-state={state}
          onLoad={() => setState('loaded')}
          onError={() => setState('broken')} />
        {state === 'broken' && (
          <div className="media-fallback" data-testid="image-broken-fallback">
            <span aria-hidden>🖼️</span>
            <span>{t('imgBrokenFallback')}</span>
          </div>
        )}
      </div>
      <Output id="image-broken-status">
        {state === 'broken' ? t('imgBroken') : state === 'loaded' ? t('imgUnexpectedLoad') : t('imgLoading')}
      </Output>
    </section>
  )
}

// ─── M3. Image — Lazy Load ───────────────────────────────────────────────────
/**
 * An image at the bottom of a scroll box that gets no src until it is scrolled
 * into view, so its data-state goes idle → loading → loaded at a moment tests control.
 */
function ImageLazySection() {
  const { t } = useLang()
  const boxRef    = useRef(null)
  const targetRef = useRef(null)
  const visible   = useRevealInBox(boxRef, targetRef)
  const [loaded, setLoaded] = useState(null)
  const state = !visible ? 'idle' : loaded ? 'loaded' : 'loading'

  return (
    <section id="sec-media-image-lazy" className="card">
      <SectionHeader num="M3" title={t('secM3Title')} locator="data-testid / data-state" />
      <p className="desc">{t('secM3Desc')}</p>
      <div ref={boxRef} className="lazy-box" data-testid="image-lazy-scroll">
        <div className="lazy-spacer">{t('lazyScrollHint')}</div>
        <div ref={targetRef} className="media-frame">
          <img src={visible ? testImage : undefined} alt={t('imgAlt')} loading="lazy"
            className="media-img" data-testid="image-lazy" data-state={state}
            onLoad={e => setLoaded([e.target.naturalWidth, e.target.naturalHeight])} />
        </div>
      </div>
      <Output id="image-lazy-status">
        {state === 'idle' ? t('lazyIdle')
          : state === 'loading' ? t('imgLoading')
          : t('imgLoaded', { w: loaded[0], h: loaded[1] })}
      </Output>
    </section>
  )
}

// ─── Video player (shared by M4–M6) ──────────────────────────────────────────
/**
 * A video with no native controls: custom Play/Pause + Mute buttons, and data-state /
 * data-muted on the wrapper so tests can assert what the video is doing.
 * data-state: idle (no src) | loading | ready | playing | paused | ended | error.
 * @param src Video URL; leave undefined to show an idle player.
 * @param testid Prefix for every data-testid inside the player.
 */
function VideoPlayer({ src, testid }) {
  const { t } = useLang()
  const videoRef = useRef(null)
  const [state, setState]       = useState(src ? 'loading' : 'idle')
  const [muted, setMuted]       = useState(false)
  const [time, setTime]         = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    const v = videoRef.current
    // play() rejects if the browser blocks playback or a pause interrupts it; the
    // play/pause events already keep the state right, so the rejection is ignored.
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }
  // Set state right away — volumechange fires asynchronously, so tests would race it.
  const toggleMute = () => {
    const v = videoRef.current
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const playing  = state === 'playing'
  const disabled = state === 'idle' || state === 'loading' || state === 'error'

  return (
    <div className="video-player" data-testid={testid} data-state={state} data-muted={muted}>
      <div className="media-frame video-frame">
        <video ref={videoRef} src={src} preload="metadata" playsInline
          className={`media-video ${state === 'error' ? 'media-hidden' : ''}`}
          data-testid={`${testid}-element`}
          onLoadedMetadata={e => { setDuration(e.target.duration); setState('ready') }}
          onPlay={() => setState('playing')}
          // A pause event also fires when the video ends; keep "ended" in that case.
          onPause={e => { if (!e.target.ended) setState('paused') }}
          onEnded={() => setState('ended')}
          onTimeUpdate={e => setTime(e.target.currentTime)}
          onVolumeChange={e => setMuted(e.target.muted)}
          onError={() => setState('error')} />
        {state === 'error' && (
          <div className="media-fallback" data-testid={`${testid}-fallback`}>
            <span aria-hidden>🎞️</span>
            <span>{t('videoUnavailable')}</span>
          </div>
        )}
      </div>
      <div className="video-controls">
        <button className={playing ? 'btn-warning' : 'btn-primary'} data-testid={`${testid}-play`}
          disabled={disabled} onClick={togglePlay}>
          {playing ? t('videoPause') : t('videoPlay')}
        </button>
        <button className="btn-secondary" data-testid={`${testid}-mute`}
          disabled={disabled} onClick={toggleMute} aria-pressed={muted}>
          {muted ? t('videoUnmute') : t('videoMute')}
        </button>
        <span className="video-time" data-testid={`${testid}-time`}>
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
      <Output id={`${testid}-status`}>{t(`videoStatus_${state}`)}</Output>
    </div>
  )
}

// ─── M4. Video — Plays ───────────────────────────────────────────────────────
/** A working video in the custom player. */
function VideoPlayingSection() {
  const { t } = useLang()
  return (
    <section id="sec-media-video-playing" className="card">
      <SectionHeader num="M4" title={t('secM4Title')} locator="data-testid / data-state" />
      <p className="desc">{t('secM4Desc')}</p>
      <VideoPlayer src={testVideo} testid="video-playing" />
    </section>
  )
}

// ─── M5. Video — Broken ──────────────────────────────────────────────────────
/** A video whose file doesn't exist: the player goes to "error" and shows a fallback. */
function VideoBrokenSection() {
  const { t } = useLang()
  return (
    <section id="sec-media-video-broken" className="card">
      <SectionHeader num="M5" title={t('secM5Title')} locator="data-testid / data-state" />
      <p className="desc">{t('secM5Desc')}</p>
      <VideoPlayer src={MISSING_VIDEO} testid="video-broken" />
    </section>
  )
}

// ─── M6. Video — Lazy Load ───────────────────────────────────────────────────
/** A video at the bottom of a scroll box that only gets its src once scrolled into view. */
function VideoLazySection() {
  const { t } = useLang()
  const boxRef    = useRef(null)
  const targetRef = useRef(null)
  const visible   = useRevealInBox(boxRef, targetRef)
  return (
    <section id="sec-media-video-lazy" className="card">
      <SectionHeader num="M6" title={t('secM6Title')} locator="data-testid / data-state" />
      <p className="desc">{t('secM6Desc')}</p>
      <div ref={boxRef} className="lazy-box lazy-box-video" data-testid="video-lazy-scroll">
        <div className="lazy-spacer">{t('lazyScrollHint')}</div>
        <div ref={targetRef}>
          {/* Remount once revealed so the player starts fresh in 'loading'. */}
          <VideoPlayer key={visible ? 'revealed' : 'idle'}
            src={visible ? testVideo : undefined} testid="video-lazy" />
        </div>
      </div>
    </section>
  )
}

// ─── M7. Hero Carousel ───────────────────────────────────────────────────────
const HERO_SLIDES = [
  { titleKey: 'heroSlide1Title', textKey: 'heroSlide1Text', image: true },
  { titleKey: 'heroSlide2Title', textKey: 'heroSlide2Text', bg: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { titleKey: 'heroSlide3Title', textKey: 'heroSlide3Text', bg: 'linear-gradient(135deg, #10b981, #0f766e)' },
]

const HERO_INTERVAL = numberParam('carouselInterval', 4000, 500, 60000)  // ms per slide while playing

/**
 * A three-slide carousel with prev/next arrows and dots; hidden slides stay in the DOM
 * with the `hidden` attribute. Autoplay is off until Play is pressed. While playing it
 * pauses whenever the mouse or keyboard focus is inside it, as WCAG asks, so a test
 * that hovers to click an arrow doesn't see the slide change under it.
 */
function HeroCarouselSection() {
  const { t } = useLang()
  const [index, setIndex]       = useState(0)
  const [playing, setPlaying]   = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [focused, setFocused]   = useState(false)
  const total = HERO_SLIDES.length
  const paused = playing && (hovered || focused)
  // Wraps around in both directions.
  const go = i => setIndex((i + total) % total)

  // Re-armed on every slide change, so a manual click also restarts the full interval.
  useEffect(() => {
    if (!playing || paused) return
    const timer = setTimeout(() => setIndex(i => (i + 1) % total), HERO_INTERVAL)
    return () => clearTimeout(timer)
  }, [playing, paused, index, total])

  // focusout also fires when focus moves between two buttons inside, so only count
  // it as leaving when the newly focused element is outside the carousel.
  const onBlur = e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }

  return (
    <section id="sec-media-hero" className="card media-wide">
      <SectionHeader num="M7" title={t('secM7Title')} locator="data-testid / data-active-slide" />
      <p className="desc">{t('secM7Desc')}</p>
      <div className="hero-carousel" data-testid="hero-carousel" data-active-slide={index + 1}
        data-autoplay={playing ? 'on' : 'off'} data-paused={paused}
        role="region" aria-roledescription="carousel" aria-label={t('secM7Title')}
        // Screen readers announce slide changes only when the user caused them.
        aria-live={playing ? 'off' : 'polite'}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)} onBlur={onBlur}>
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className="hero-slide" data-slide={i + 1} hidden={i !== index}
            aria-roledescription="slide" aria-label={t('heroStatus', { n: i + 1, total })}
            style={{ backgroundImage: s.image
              ? `linear-gradient(90deg, rgba(15,23,42,.75), rgba(15,23,42,.1)), url(${testImage})`
              : s.bg }}>
            <h3 className="hero-slide-title">{t(s.titleKey)}</h3>
            <p className="hero-slide-text">{t(s.textKey)}</p>
          </div>
        ))}
        <button className="hero-arrow hero-arrow-prev" data-testid="hero-prev"
          aria-label={t('heroPrev')} onClick={() => go(index - 1)}>‹</button>
        <button className="hero-arrow hero-arrow-next" data-testid="hero-next"
          aria-label={t('heroNext')} onClick={() => go(index + 1)}>›</button>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === index ? 'hero-dot-active' : ''}`}
              data-testid={`hero-dot-${i + 1}`} aria-current={i === index}
              aria-label={t('heroDot', { n: i + 1 })} onClick={() => go(i)} />
          ))}
        </div>
      </div>
      <div className="button-row">
        <button className="btn-secondary" data-testid="hero-autoplay" aria-pressed={playing}
          onClick={() => setPlaying(p => !p)}>
          {playing ? t('heroPause') : t('heroPlay')}
        </button>
      </div>
      <Output id="hero-status">
        {t('heroStatus', { n: index + 1, total })}
        {playing && ` · ${paused ? t('heroPausedNote') : t('heroPlayingNote', { s: HERO_INTERVAL / 1000 })}`}
      </Output>
    </section>
  )
}

// ─── M8. Promo Banner ────────────────────────────────────────────────────────
/** A closable promo banner whose button reveals a discount code. Not remembered across reloads. */
function PromoBannerSection() {
  const { t } = useLang()
  const [open, setOpen]       = useState(true)
  const [claimed, setClaimed] = useState(false)
  return (
    <section id="sec-media-promo" className="card">
      <SectionHeader num="M8" title={t('secM8Title')} locator="data-testid" />
      <p className="desc">{t('secM8Desc')}</p>
      {open ? (
        <div className="promo-banner" data-testid="promo-banner" role="region" aria-label={t('promoTitle')}>
          <div className="promo-body">
            <strong className="promo-title">{t('promoTitle')}</strong>
            <span className="promo-text">{t('promoText')}</span>
          </div>
          <button className="promo-cta" data-testid="promo-cta" onClick={() => setClaimed(true)}>
            {t('promoCta')}
          </button>
          <button className="banner-close" data-testid="promo-close" aria-label={t('promoClose')}
            onClick={() => setOpen(false)}>✕</button>
        </div>
      ) : (
        <div className="button-row">
          <button className="btn-secondary" data-testid="promo-show"
            onClick={() => { setOpen(true); setClaimed(false) }}>{t('promoShowAgain')}</button>
        </div>
      )}
      <Output id="promo-status">
        {!open ? t('promoClosed') : claimed ? t('promoCode', { code: 'TEST20' }) : t('promoShown')}
      </Output>
    </section>
  )
}

// ─── M9. Announcement Bar & Cookie Consent ───────────────────────────────────
/**
 * Status of the page-level announcement bar and cookie banner, with a button that
 * clears their saved choices so both appear again.
 * @param cookieChoice "accepted" | "rejected", or null if not chosen yet.
 */
function BannerStatusSection({ announcementOpen, cookieChoice, onReset }) {
  const { t } = useLang()
  const cookieLabel = cookieChoice === 'accepted' ? t('cookieAccepted')
    : cookieChoice === 'rejected' ? t('cookieRejected') : t('cookieNone')
  return (
    <section id="sec-media-banners" className="card">
      <SectionHeader num="M9" title={t('secM9Title')} locator="data-testid / localStorage" />
      <p className="desc">{t('secM9Desc')}</p>
      <p className="output" data-testid="announcement-status">
        {t('announcementStatus', { state: announcementOpen ? t('annShown') : t('annDismissed') })}
      </p>
      <p className="output" data-testid="cookie-status">
        {t('cookieStatus', { state: cookieLabel })}
      </p>
      <div className="button-row">
        <button className="btn-secondary" id="btn-reset-banners" data-testid="reset-banners"
          onClick={onReset}>{t('btnResetBanners')}</button>
      </div>
    </section>
  )
}

/** The dismissible bar at the top of the Media page. */
function AnnouncementBar({ onClose }) {
  const { t } = useLang()
  return (
    <div className="announcement-bar" data-testid="announcement-bar" role="status">
      <span className="announcement-text">{t('announcementText')}</span>
      <button className="banner-close" data-testid="announcement-close"
        aria-label={t('announcementClose')} onClick={onClose}>✕</button>
    </div>
  )
}

/**
 * A modal cookie-consent banner over the whole page; it blocks clicks on the
 * page until Accept or Reject is chosen.
 * @param onChoose Called with "accepted" or "rejected".
 */
function CookieBanner({ onChoose }) {
  const { t } = useLang()
  return (
    <div className="cookie-backdrop" data-testid="cookie-backdrop">
      <div className="cookie-banner" data-testid="cookie-banner"
        role="dialog" aria-modal="true" aria-labelledby="cookie-title">
        <div className="cookie-body">
          <strong id="cookie-title">🍪 {t('cookieTitle')}</strong>
          <p>{t('cookieText')}</p>
        </div>
        <div className="button-row">
          <button className="btn-secondary" data-testid="cookie-reject"
            onClick={() => onChoose('rejected')}>{t('cookieReject')}</button>
          <button className="btn-primary" data-testid="cookie-accept"
            onClick={() => onChoose('accepted')}>{t('cookieAccept')}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
/**
 * The Media page. It owns the announcement and cookie state (saved in localStorage),
 * because the bar and banner sit outside the M9 card that reports them.
 */
export default function MediaPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [announcementOpen, setAnnouncementOpen] = useState(() => readStore(ANNOUNCEMENT_KEY) !== 'true')
  const [cookieChoice, setCookieChoice]         = useState(() => readStore(COOKIE_KEY))

  const closeAnnouncement = () => {
    writeStore(ANNOUNCEMENT_KEY, 'true')
    setAnnouncementOpen(false)
  }
  const chooseCookies = choice => {
    writeStore(COOKIE_KEY, choice)
    setCookieChoice(choice)
  }
  const resetBanners = () => {
    writeStore(ANNOUNCEMENT_KEY, null)
    writeStore(COOKIE_KEY, null)
    setAnnouncementOpen(true)
    setCookieChoice(null)
  }

  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {announcementOpen && <AnnouncementBar onClose={closeAnnouncement} />}

      <header className="pet-hero media-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="media-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('mediaHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('mediaHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🎬</div>
      </header>

      <h2 className="media-group-title">{t('mediaGroupImages')}</h2>
      <div className="content-grid media-grid">
        <ImageLoadedSection />
        <ImageBrokenSection />
        <ImageLazySection />
      </div>

      <h2 className="media-group-title">{t('mediaGroupVideos')}</h2>
      <div className="content-grid media-grid">
        <VideoPlayingSection />
        <VideoBrokenSection />
        <VideoLazySection />
      </div>

      <h2 className="media-group-title">{t('mediaGroupBanners')}</h2>
      <div className="content-grid media-grid">
        <HeroCarouselSection />
        <PromoBannerSection />
        <BannerStatusSection announcementOpen={announcementOpen}
          cookieChoice={cookieChoice} onReset={resetBanners} />
      </div>

      {!cookieChoice && <CookieBanner onChoose={chooseCookies} />}
    </div>
  )
}
