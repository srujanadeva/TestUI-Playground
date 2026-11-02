import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output } from '../ui.jsx'

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// ─── B1. Nested Shadow DOM with a slot, plus a closed root ───────────────────
function NestedShadowSection() {
  const { t, lang } = useLang()
  const outerRef  = useRef(null)
  const closedRef = useRef(null)
  const [deep, setDeep]         = useState('')
  const [closedClicks, setClosedClicks] = useState(0)

  useEffect(() => {
    const host = outerRef.current
    const outer = host.shadowRoot || host.attachShadow({ mode: 'open' })
    outer.innerHTML = `
      <style>
        :host{display:block}
        .outer{border:2px solid #6366f1;border-radius:10px;padding:14px;background:#eef2ff;display:flex;flex-direction:column;gap:10px}
        .tag{font:600 10px/1 -apple-system,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#4338ca}
        ::slotted(*){font-weight:700;color:#1e293b}
      </style>
      <div class="outer" part="outer">
        <span class="tag">${esc(t('shadowOuterTag'))}</span>
        <slot name="title"></slot>
        <div id="inner-host" data-testid="inner-host"></div>
      </div>`
    const inner = outer.getElementById('inner-host').attachShadow({ mode: 'open' })
    inner.innerHTML = `
      <style>
        .inner{border:2px dashed #0d9488;border-radius:8px;padding:12px;background:#f0fdfa;display:flex;flex-direction:column;gap:8px}
        .tag{font:600 10px/1 -apple-system,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#0f766e}
        .row{display:flex;gap:8px}
        input{flex:1;min-width:0;padding:8px 10px;border:1px solid #99f6e4;border-radius:6px;font-size:14px}
        button{padding:8px 14px;background:#0d9488;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}
        #deep-output{padding:8px 10px;background:#fff;border:1px solid #99f6e4;border-radius:6px;font-size:14px;color:#0f766e;min-height:36px}
      </style>
      <div class="inner">
        <span class="tag">${esc(t('shadowInnerTag'))}</span>
        <div class="row">
          <input id="deep-input" type="text" placeholder="${esc(t('shadowDeepPh'))}"/>
          <button id="deep-btn">${esc(t('shadowRead'))}</button>
        </div>
        <div id="deep-output">${esc(t('shadowDeepInit'))}</div>
      </div>`
    inner.getElementById('deep-btn').addEventListener('click', () => {
      const v = inner.getElementById('deep-input').value
      inner.getElementById('deep-output').textContent = t('shadowDeepValue', { v })
      setDeep(v)
    })
  }, [lang])

  useEffect(() => {
    const host = closedRef.current
    if (!host._root) host._root = host.attachShadow({ mode: 'closed' })  // closed: host.shadowRoot is null
    const root = host._root
    root.innerHTML = `
      <style>
        button{width:100%;padding:12px;border:2px solid #475569;border-radius:8px;background:#1e293b;color:#e2e8f0;font-size:14px;cursor:pointer}
        button:hover{background:#334155}
      </style>
      <button id="closed-btn">${esc(t('shadowClosedBtn'))}</button>`
    root.getElementById('closed-btn').addEventListener('click', () => setClosedClicks(c => c + 1))
  }, [lang])

  return (
    <section id="sec-browser-shadow" className="card" data-deep-value={deep} data-closed-clicks={closedClicks}>
      <SectionHeader num="B1" title={t('secB1Title')} locator="shadow ▸ shadow / slot" />
      <p className="desc">{t('secB1Desc')}</p>
      <div ref={outerRef} data-testid="outer-host">
        <span slot="title" data-testid="slotted-title">{t('shadowSlotted')}</span>
      </div>
      <p className="lab-muted">{t('shadowClosedNote')}</p>
      <div ref={closedRef} data-testid="closed-host" />
      <Output id="shadow-status">
        {t('shadowStatus', { v: deep || t('browserNone'), n: closedClicks })}
      </Output>
    </section>
  )
}

// ─── B2. Permission prompts (geolocation + notifications) ────────────────────
function usePermission(name) {
  const [state, setState] = useState('unknown')
  useEffect(() => {
    let status, cancelled = false
    navigator.permissions?.query({ name }).then(s => {
      if (cancelled) return
      status = s
      setState(s.state)
      s.onchange = () => setState(s.state)
    }).catch(() => setState('unsupported'))
    return () => { cancelled = true; if (status) status.onchange = null }
  }, [name])
  return [state, setState]
}

function PermissionsSection({ onLocated }) {
  const { t } = useLang()
  const [geoPerm] = usePermission('geolocation')
  const [geo, setGeo] = useState({ state: 'idle' })  // idle | requesting | granted | denied | unavailable | error
  const notifySupported = typeof window.Notification === 'function'
  const [notify, setNotify] = useState(notifySupported ? Notification.permission : 'unsupported')
  const [sent, setSent] = useState(0)

  const locate = () => {
    if (!navigator.geolocation) { setGeo({ state: 'unavailable' }); return }
    setGeo({ state: 'requesting' })
    navigator.geolocation.getCurrentPosition(
      p => {
        const lat = p.coords.latitude.toFixed(4), lng = p.coords.longitude.toFixed(4)
        setGeo({ state: 'granted', lat, lng })
        onLocated?.({ lat, lng })
      },
      err => setGeo({ state: err.code === err.PERMISSION_DENIED ? 'denied' : 'error' }),
      { timeout: 10000 }
    )
  }
  const askNotify = async () => {
    if (!notifySupported) return
    setNotify(await Notification.requestPermission())
  }
  const sendNotify = () => {
    try {
      new Notification(t('notifyTitle'), { body: t('notifyBody') })
      setSent(n => n + 1)
    } catch { setNotify('error') }
  }

  return (
    <section id="sec-browser-permissions" className="card" data-geo-state={geo.state} data-notify-permission={notify}>
      <SectionHeader num="B2" title={t('secB2Title')} locator="grantPermissions / data-*-state" />
      <p className="desc">{t('secB2Desc')}</p>

      <div className="lab-perm" data-permission="geolocation" data-state={geoPerm}>
        <div className="lab-perm-head">
          <strong>{t('geoTitle')}</strong>
          <span className={`lab-pill lab-pill-${geoPerm}`} id="geo-permission">{geoPerm}</span>
        </div>
        <button id="geo-btn" className="btn-primary" disabled={geo.state === 'requesting'} onClick={locate}>
          {t('geoBtn')}
        </button>
        <p id="geo-result" className="lab-muted" data-lat={geo.lat || ''} data-lng={geo.lng || ''}>
          {geo.state === 'granted' ? t('geoAt', { lat: geo.lat, lng: geo.lng }) : t(`geo_${geo.state}`)}
        </p>
      </div>

      <div className="lab-perm" data-permission="notifications" data-state={notify}>
        <div className="lab-perm-head">
          <strong>{t('notifyHeading')}</strong>
          <span className={`lab-pill lab-pill-${notify}`} id="notify-permission">{notify}</span>
        </div>
        <div className="button-row">
          <button id="notify-request" className="btn-secondary" disabled={!notifySupported || notify !== 'default'}
            onClick={askNotify}>{t('notifyAsk')}</button>
          <button id="notify-send" className="btn-primary" disabled={notify !== 'granted'} onClick={sendNotify}>
            {t('notifySend')}
          </button>
        </div>
      </div>
      <Output id="permissions-status">
        {t('permStatus', { geo: geo.state, notify, n: sent })}
      </Output>
    </section>
  )
}

// ─── B3. Full screen ─────────────────────────────────────────────────────────
function FullscreenSection() {
  const { t } = useLang()
  const boxRef = useRef(null)
  const [on, setOn]       = useState(false)
  const [error, setError] = useState(false)
  const [changes, setChanges] = useState(0)

  useEffect(() => {
    const onChange = () => { setOn(document.fullscreenElement === boxRef.current); setChanges(c => c + 1) }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const enter = async () => {
    setError(false)
    try { await boxRef.current.requestFullscreen() } catch { setError(true) }
  }
  const exit = () => { if (document.fullscreenElement) document.exitFullscreen() }

  return (
    <section id="sec-browser-fullscreen" className="card" data-fullscreen={on} data-changes={changes}>
      <SectionHeader num="B3" title={t('secB3Title')} locator="document.fullscreenElement" />
      <p className="desc">{t('secB3Desc')}</p>
      <div ref={boxRef} id="fs-box" className="lab-fs-box" data-testid="fs-box" data-fullscreen={on}>
        <strong>{t('fsBoxTitle')}</strong>
        <span className="lab-muted">{on ? t('fsBoxOn') : t('fsBoxOff')}</span>
        {on && <button id="fs-exit" className="btn-secondary" onClick={exit}>{t('fsExit')}</button>}
      </div>
      <div className="button-row">
        <button id="fs-enter" className="btn-primary" disabled={on} onClick={enter}>{t('fsEnter')}</button>
      </div>
      {error && <p id="fs-error" className="error-msg" role="alert">{t('fsBlocked')}</p>}
      <Output id="fs-status">{t('fsStatus', { state: t(on ? 'fsOn' : 'fsOff'), n: changes })}</Output>
    </section>
  )
}

// ─── B4. Embedded Google map ─────────────────────────────────────────────────
// Google's keyless embed URL (output=embed). It isn't an official API; the official
// route is the Maps Embed API, which needs a key. The frame is cross-origin.
// Privacy: B2's location only goes to Google when the user presses "Show my location",
// and it is rounded to 3 decimals (about 110 m) first.
const DEFAULT_PLACE = { lat: '51.5074', lng: '-0.1278' }  // London
const ZOOM_MIN = 3
const ZOOM_MAX = 20
const roundPlace = p => ({ lat: Number(p.lat).toFixed(3), lng: Number(p.lng).toFixed(3) })
const mapSrc = (place, zoom, lang) =>
  `https://maps.google.com/maps?q=${place.lat},${place.lng}&z=${zoom}&hl=${lang}&output=embed`

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

function MapSection({ located }) {
  const { t, lang } = useLang()
  const online = useOnline()
  const [zoom, setZoom]   = useState(14)
  const [state, setState] = useState('loading')  // loading | loaded
  const [shown, setShown] = useState(null)       // the rounded location the user chose to share, or null
  const available = located ? roundPlace(located) : null
  const alreadyShown = !!(available && shown && available.lat === shown.lat && available.lng === shown.lng)
  const place = shown || DEFAULT_PLACE
  const src = mapSrc(place, zoom, lang)

  useEffect(() => { setState('loading') }, [src])

  return (
    <section id="sec-browser-map" className="card" data-lat={place.lat} data-lng={place.lng} data-zoom={zoom}
      data-source={shown ? 'geolocation' : 'default'} data-location-available={!!available}>
      <SectionHeader num="B4" title={t('secB4Title')} locator="iframe src / data-lat" />
      <p className="desc">{t('secB4Desc')}</p>
      {!online && <p id="map-offline" className="error-msg" role="alert">{t('mapOffline')}</p>}
      <div className="lab-map">
        {/* sandbox: Google's scripts and its own links still work, but the frame can't
            move this tab elsewhere or open dialogs. no-referrer: Google isn't told which page embeds it. */}
        <iframe id="map-iframe" title={t('mapFrameTitle')} src={src} data-state={state}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer" allowFullScreen onLoad={() => setState('loaded')} />
      </div>
      <p className="lab-muted" id="map-share-note">
        {available ? t('mapShareNote', { lat: available.lat, lng: available.lng }) : t('mapShareHint')}
      </p>
      <div className="button-row lab-row-center">
        <button id="map-show-location" className="btn-primary" disabled={!available || alreadyShown}
          onClick={() => setShown(available)}>{t('mapShowLocation')}</button>
        <button id="map-zoom-out" className="btn-secondary" aria-label={t('mapZoomOut')}
          disabled={zoom <= ZOOM_MIN} onClick={() => setZoom(z => z - 1)}>−</button>
        <button id="map-zoom-in" className="btn-secondary" aria-label={t('mapZoomIn')}
          disabled={zoom >= ZOOM_MAX} onClick={() => setZoom(z => z + 1)}>+</button>
        <button id="map-reset" className="btn-secondary" disabled={!shown && zoom === 14}
          onClick={() => { setZoom(14); setShown(null) }}>{t('mapReset')}</button>
        <a id="map-open-link" className="lab-link" target="_blank" rel="noopener noreferrer"
          href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}>{t('mapOpen')} ↗</a>
      </div>
      <Output id="map-status">
        {t('mapStatus', {
          lat: place.lat, lng: place.lng, zoom,
          source: t(shown ? 'mapFromLocation' : 'mapFromDefault'),
        })}
      </Output>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BrowserPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [located, setLocated] = useState(null)  // B2's last position; B4 shows it only when asked
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero browser-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="browser-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('browserHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('browserHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🌐</div>
      </header>

      <div className="content-grid media-grid lab-first-grid">
        <NestedShadowSection />
        <PermissionsSection onLocated={setLocated} />
        <FullscreenSection />
        <MapSection located={located} />
      </div>
    </div>
  )
}
