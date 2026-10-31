import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// Moves focus between the menu items in `list` (skipping nothing; disabled items stay focusable).
function focusItem(list, index) {
  const items = [...list.querySelectorAll(':scope > li > [role="menuitem"]')]
  if (!items.length) return
  items[(index + items.length) % items.length].focus()
}
const focusedIndex = list => [...list.querySelectorAll(':scope > li > [role="menuitem"]')].indexOf(document.activeElement)

// ─── N1. Accordion ───────────────────────────────────────────────────────────
const FAQ = ['shipping', 'returns', 'warranty', 'payments']

function AccordionSection() {
  const { t } = useLang()
  const [open, setOpen]   = useState(['shipping'])
  const [multi, setMulti] = useState(false)
  const headers = useRef({})

  const toggle = key => setOpen(o => {
    if (o.includes(key)) return o.filter(k => k !== key)
    return multi ? [...o, key] : [key]
  })
  const changeMulti = on => { setMulti(on); if (!on) setOpen(o => o.slice(-1)) }

  const onKeyDown = (e, i) => {
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: FAQ.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    headers.current[FAQ[(next + FAQ.length) % FAQ.length]]?.focus()
  }

  return (
    <section id="sec-nav-accordion" className="card" data-open={FAQ.filter(k => open.includes(k)).join(',')}>
      <SectionHeader num="N1" title={t('secN1Title')} locator="aria-expanded / aria-controls" />
      <p className="desc">{t('secN1Desc')}</p>
      <label className="lab-inline-check" htmlFor="acc-multi">
        <input id="acc-multi" type="checkbox" checked={multi} onChange={e => changeMulti(e.target.checked)} />
        {t('accMulti')}
      </label>
      <div className="lab-accordion">
        {FAQ.map((key, i) => {
          const isOpen = open.includes(key)
          return (
            <div key={key} className="lab-acc-item">
              <h3>
                <button ref={el => (headers.current[key] = el)} id={`acc-btn-${key}`} className="lab-acc-btn"
                  aria-expanded={isOpen} aria-controls={`acc-panel-${key}`}
                  onClick={() => toggle(key)} onKeyDown={e => onKeyDown(e, i)}>
                  <span>{t(`acc_${key}`)}</span>
                  <span className="lab-acc-icon" aria-hidden>{isOpen ? '−' : '+'}</span>
                </button>
              </h3>
              <div id={`acc-panel-${key}`} role="region" aria-labelledby={`acc-btn-${key}`}
                className="lab-acc-panel" hidden={!isOpen}>
                {t(`acc_${key}Body`)}
              </div>
            </div>
          )
        })}
      </div>
      <Output id="acc-status">
        {t('accOpen', { list: FAQ.filter(k => open.includes(k)).map(k => t(`acc_${k}`)).join(', ') || t('navNone') })}
      </Output>
    </section>
  )
}

// ─── N2. Breadcrumbs ─────────────────────────────────────────────────────────
const FOLDERS = {
  Home: {
    Projects: { Website: { Design: {}, Copy: {} }, 'Mobile app': { 'Release 2.4': {} } },
    Reports: { 'Q3 2026': {}, 'Q4 2026': {} },
    Settings: {},
  },
}
// "Home/Projects/Website" → ['Home', 'Projects', 'Website'], or ['Home'] if any part doesn't exist.
function parseFolder(param) {
  const parts = (param || 'Home').split('/')
  let node = FOLDERS
  for (const p of parts) {
    if (!node[p]) return ['Home']
    node = node[p]
  }
  return parts
}
const folderAt = path => path.reduce((n, p) => n[p], FOLDERS)
const folderLink = path => `?folder=${encodeURIComponent(path.join('/'))}`

function BreadcrumbsSection() {
  const { t } = useLang()
  const [params] = useSearchParams()
  const path = parseFolder(params.get('folder'))
  const children = Object.keys(folderAt(path))
  return (
    <section id="sec-nav-breadcrumbs" className="card" data-path={path.join('/')}>
      <SectionHeader num="N2" title={t('secN2Title')} locator="aria-current / ?folder=" />
      <p className="desc">{t('secN2Desc')}</p>
      <nav aria-label={t('crumbsLabel')}>
        <ol className="lab-crumbs" dir="ltr">
          {path.map((p, i) => (
            <li key={p + i}>
              {i === path.length - 1
                ? <span aria-current="page" data-crumb-depth={i}>{p}</span>
                : <Link to={folderLink(path.slice(0, i + 1))} data-crumb-depth={i}>{p}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <div className="lab-folders">
        {children.length
          ? children.map(c => (
            <Link key={c} to={folderLink([...path, c])} className="lab-folder" data-folder={c}>📁 {c}</Link>
          ))
          : <span className="lab-muted" id="crumbs-empty">{t('crumbsEmpty')}</span>}
      </div>
      <Output id="crumbs-status">{t('crumbsPath', { path: '/' + path.join('/') })}</Output>
    </section>
  )
}

// ─── N3. Custom context menu ─────────────────────────────────────────────────
const CTX_ITEMS = ['open', 'copy', 'paste', 'rename', 'delete']

function ContextMenuSection() {
  const { t } = useLang()
  const wrapRef = useRef(null)
  const zoneRef = useRef(null)
  const menuRef = useRef(null)
  const [menu, setMenu]       = useState(null)  // { x, y } inside the wrapper
  const [copied, setCopied]   = useState(false)
  const [action, setAction]   = useState(null)

  const openAt = (x, y) => {
    const r = wrapRef.current.getBoundingClientRect()
    setMenu({ x: Math.min(Math.max(0, x - r.left), r.width - 190), y: y - r.top })
  }
  const close = (refocus = true) => { setMenu(null); if (refocus) zoneRef.current?.focus() }

  useEffect(() => { if (menu) focusItem(menuRef.current, 0) }, [menu])
  useEffect(() => {
    if (!menu) return
    const onDown = e => { if (!menuRef.current?.contains(e.target)) close(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  const run = key => {
    if (key === 'paste' && !copied) return
    if (key === 'copy') setCopied(true)
    setAction(key)
    close()
  }
  const onMenuKey = e => {
    const i = focusedIndex(menuRef.current)
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(menuRef.current, i + 1) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusItem(menuRef.current, i - 1) }
    if (e.key === 'Home')      { e.preventDefault(); focusItem(menuRef.current, 0) }
    if (e.key === 'End')       { e.preventDefault(); focusItem(menuRef.current, -1) }
    if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close() }
  }

  return (
    <section id="sec-nav-context" className="card" data-menu-open={!!menu}>
      <SectionHeader num="N3" title={t('secN3Title')} locator="contextmenu / role=menuitem" />
      <p className="desc">{t('secN3Desc')}</p>
      <div ref={wrapRef} className="lab-field-wrap">
        <div ref={zoneRef} className="lab-ctx-zone" data-testid="context-zone" tabIndex={0}
          aria-haspopup="menu" aria-label={t('ctxZone')}
          onContextMenu={e => { e.preventDefault(); openAt(e.clientX, e.clientY) }}
          onKeyDown={e => {
            if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
              e.preventDefault()
              const r = zoneRef.current.getBoundingClientRect()
              openAt(r.left + 16, r.top + 24)
            }
          }}>
          <span className="lab-ctx-file" aria-hidden>📄</span>
          <span><strong>report-q4.pdf</strong><br /><span className="lab-muted">{t('ctxHint')}</span></span>
        </div>
        {menu && (
          <ul ref={menuRef} id="context-menu" className="lab-menu" role="menu" aria-label={t('ctxMenu')}
            style={{ left: menu.x, top: menu.y }} onKeyDown={onMenuKey}>
            {CTX_ITEMS.map(key => {
              const disabled = key === 'paste' && !copied
              return (
                <li key={key} role="none">
                  <button role="menuitem" tabIndex={-1} data-action={key} aria-disabled={disabled}
                    className={`lab-menuitem ${key === 'delete' ? 'lab-menuitem-danger' : ''}`}
                    onClick={() => run(key)}>
                    {t(`ctx_${key}`)}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <Output id="context-status">{t('ctxLast', { action: action || t('navNone') })}</Output>
    </section>
  )
}

// ─── N4. Dropdown menu with a submenu ────────────────────────────────────────
const MENU_ITEMS = [
  { key: 'duplicate' }, { key: 'archive' },
  { key: 'export', sub: ['csv', 'pdf', 'json'] },
  { key: 'share' },
]

function DropdownMenuSection() {
  const { t, lang } = useLang()
  const btnRef  = useRef(null)
  const menuRef = useRef(null)
  const subRef  = useRef(null)
  const [open, setOpen]       = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [chosen, setChosen]   = useState(null)
  const openSubKey  = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
  const closeSubKey = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'

  const close = (refocus = true) => { setOpen(false); setSubOpen(false); if (refocus) btnRef.current?.focus() }
  const choose = (key, sub) => { setChosen({ key, sub }); close() }
  const openMenu = (last = false) => { setOpen(true); setSubOpen(false); setTimeout(() => focusItem(menuRef.current, last ? -1 : 0)) }
  const openSub = () => { setSubOpen(true); setTimeout(() => focusItem(subRef.current, 0)) }

  useEffect(() => {
    if (!open) return
    const onDown = e => { if (!btnRef.current.parentElement.contains(e.target)) close(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const onMenuKey = e => {
    e.stopPropagation()
    const i = focusedIndex(menuRef.current)
    const item = MENU_ITEMS[i]
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(menuRef.current, i + 1); setSubOpen(false) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusItem(menuRef.current, i - 1); setSubOpen(false) }
    if (e.key === openSubKey && item?.sub) { e.preventDefault(); openSub() }
    if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close() }
  }
  const onSubKey = e => {
    e.stopPropagation()
    const i = focusedIndex(subRef.current)
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(subRef.current, i + 1) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusItem(subRef.current, i - 1) }
    if (e.key === closeSubKey || e.key === 'Escape') {
      e.preventDefault(); setSubOpen(false); document.getElementById('menu-item-export')?.focus()
    }
    if (e.key === 'Tab') { e.preventDefault(); close() }
  }

  return (
    <section id="sec-nav-menu" className="card" data-open={open} data-submenu-open={subOpen}>
      <SectionHeader num="N4" title={t('secN4Title')} locator="aria-haspopup / role=menu" />
      <p className="desc">{t('secN4Desc')}</p>
      <div className="lab-field-wrap lab-menu-wrap">
        <button ref={btnRef} id="menu-btn" className="btn-primary" aria-haspopup="menu" aria-expanded={open}
          aria-controls="menu-list" onClick={() => (open ? close() : openMenu())}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); openMenu() }
            if (e.key === 'ArrowUp')   { e.preventDefault(); openMenu(true) }
          }}>
          {t('menuActions')} ▾
        </button>
        {open && (
          <ul ref={menuRef} id="menu-list" className="lab-menu lab-menu-below" role="menu"
            aria-labelledby="menu-btn" onKeyDown={onMenuKey}>
            {MENU_ITEMS.map(item => (
              <li key={item.key} role="none" className={item.sub ? 'lab-has-sub' : ''}
                onMouseEnter={() => (item.sub ? setSubOpen(true) : setSubOpen(false))}
                onMouseLeave={() => item.sub && setSubOpen(false)}>
                <button role="menuitem" tabIndex={-1} id={`menu-item-${item.key}`} data-action={item.key}
                  className="lab-menuitem" aria-haspopup={item.sub ? 'menu' : undefined}
                  aria-expanded={item.sub ? subOpen : undefined}
                  onClick={() => (item.sub ? openSub() : choose(item.key))}>
                  <span>{t(`menu_${item.key}`)}</span>
                  {item.sub && <span aria-hidden>{lang === 'ar' ? '◂' : '▸'}</span>}
                </button>
                {item.sub && subOpen && (
                  <ul ref={subRef} id="menu-sub-export" className="lab-menu lab-submenu" role="menu"
                    aria-labelledby="menu-item-export" onKeyDown={onSubKey}>
                    {item.sub.map(s => (
                      <li key={s} role="none">
                        <button role="menuitem" tabIndex={-1} id={`menu-item-export-${s}`}
                          data-action={`export-${s}`} className="lab-menuitem" onClick={() => choose(item.key, s)}>
                          {s.toUpperCase()}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Output id="menu-status">
        {t('menuChosen', {
          value: !chosen ? t('navNone')
            : chosen.sub ? `${t(`menu_${chosen.key}`)} → ${chosen.sub.toUpperCase()}` : t(`menu_${chosen.key}`),
        })}
      </Output>
    </section>
  )
}

// ─── N5. Side drawer ─────────────────────────────────────────────────────────
const DRAWER_MS = 250

function DrawerSection() {
  const { t } = useLang()
  const openBtnRef  = useRef(null)
  const closeBtnRef = useRef(null)
  const [state, setState]     = useState('closed')  // closed | opening | open | closing
  const [form, setForm]       = useState({ active: true, archived: false, owner: '' })
  const [applied, setApplied] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const open = () => {
    setState('opening')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setState('open'); closeBtnRef.current?.focus() }, DRAWER_MS)
  }
  const close = () => {
    setState('closing')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setState('closed'); openBtnRef.current?.focus() }, DRAWER_MS)
  }
  const apply = () => { setApplied(form); close() }

  useEffect(() => {
    if (state !== 'open' && state !== 'opening') return
    const onKey = e => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])

  const visible = state === 'opening' || state === 'open'
  const statusList = [form.active && 'active', form.archived && 'archived'].filter(Boolean)
  const appliedText = applied && t('drawerApplied', {
    status: [applied.active && t('drawerActive'), applied.archived && t('drawerArchived')].filter(Boolean).join(' + ') || t('drawerAny'),
    owner: applied.owner || t('drawerAnyone'),
  })

  return (
    <section id="sec-nav-drawer" className="card">
      <SectionHeader num="N5" title={t('secN5Title')} locator="data-testid=drawer / data-state" />
      <p className="desc">{t('secN5Desc')}</p>
      <div className="button-row">
        <button ref={openBtnRef} id="drawer-open" className="btn-primary" aria-expanded={visible}
          aria-controls="drawer" onClick={open}>{t('drawerOpen')}</button>
      </div>
      <Output id="drawer-status">
        {t('drawerState', { state: t(`drawer_${state}`) })}{appliedText ? ` · ${appliedText}` : ''}
      </Output>

      {state !== 'closed' && (
        <div className={`lab-overlay lab-drawer-backdrop ${visible ? 'is-visible' : ''}`}
          data-testid="drawer-backdrop" onClick={close} />
      )}
      <aside id="drawer" className={`lab-drawer ${visible ? 'is-open' : ''}`} data-testid="drawer"
        data-state={state} role="dialog" aria-modal="true" aria-labelledby="drawer-title"
        aria-hidden={state === 'closed'} {...(state === 'closed' ? { inert: '' } : {})}
        data-filters={statusList.join(',')}>
        <div className="lab-drawer-head">
          <h3 id="drawer-title">{t('drawerTitle')}</h3>
          <button ref={closeBtnRef} id="drawer-close" className="popup-close" aria-label={t('drawerClose')}
            onClick={close}>✕</button>
        </div>
        <fieldset className="lab-fieldset">
          <legend className="field-label">{t('drawerStatus')}</legend>
          <label className="lab-inline-check" htmlFor="drawer-active">
            <input id="drawer-active" type="checkbox" checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> {t('drawerActive')}
          </label>
          <label className="lab-inline-check" htmlFor="drawer-archived">
            <input id="drawer-archived" type="checkbox" checked={form.archived}
              onChange={e => setForm(f => ({ ...f, archived: e.target.checked }))} /> {t('drawerArchived')}
          </label>
        </fieldset>
        <div className="form-field">
          <label className="field-label" htmlFor="drawer-owner">{t('drawerOwner')}</label>
          <input id="drawer-owner" type="text" placeholder={t('drawerAnyone')} value={form.owner}
            onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
        </div>
        <button id="drawer-apply" className="btn-primary" onClick={apply}>{t('drawerApply')}</button>
      </aside>
    </section>
  )
}

// ─── N6. Unsaved-changes guard ───────────────────────────────────────────────
const SAVED_NOTE = { title: 'Q4 roadmap', notes: 'Ship the Data and Controls pages.' }

function UnsavedGuardSection() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [saved, setSaved]     = useState(SAVED_NOTE)
  const [draft, setDraft]     = useState(SAVED_NOTE)
  const [pending, setPending] = useState(null)  // where the blocked link was going
  const [status, setStatus]   = useState('guardClean')
  const stayRef = useRef(null)
  const dirty = draft.title !== saved.title || draft.notes !== saved.notes

  // Closing or reloading the tab: the browser shows its own "Leave site?" dialog.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // In-app links (this card's link and the sidebar's): stop them and ask first.
  useEffect(() => {
    if (!dirty) return
    const onClick = e => {
      const a = e.target.closest?.('a[href]')
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (a.target && a.target !== '_self') return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return  // same page (e.g. breadcrumbs) isn't leaving
      e.preventDefault()
      e.stopPropagation()
      setPending(url.pathname + url.search + url.hash)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [dirty])

  useEffect(() => { if (pending) stayRef.current?.focus() }, [pending])

  const save = () => { setSaved(draft); setStatus('guardSaved') }
  const leave = () => { const to = pending; setPending(null); setDraft(saved); navigate(to) }
  const saveAndLeave = () => { const to = pending; setSaved(draft); setPending(null); navigate(to) }

  return (
    <section id="sec-nav-guard" className="card" data-dirty={dirty}>
      <SectionHeader num="N6" title={t('secN6Title')} locator="data-dirty / beforeunload" />
      <p className="desc">{t('secN6Desc')}</p>
      <div className="form-field">
        <label className="field-label" htmlFor="guard-title">{t('guardTitle')}</label>
        <input id="guard-title" type="text" value={draft.title}
          onChange={e => { setDraft(d => ({ ...d, title: e.target.value })); setStatus('guardEditing') }} />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="guard-notes">{t('guardNotes')}</label>
        <textarea id="guard-notes" rows={3} value={draft.notes}
          onChange={e => { setDraft(d => ({ ...d, notes: e.target.value })); setStatus('guardEditing') }} />
      </div>
      <div className="button-row lab-row-center">
        <button id="guard-save" className="btn-primary" disabled={!dirty} onClick={save}>{t('guardSave')}</button>
        <Link id="guard-leave-link" to="/data" className="lab-link">{t('guardLeaveLink')}</Link>
      </div>
      <Output id="guard-status">{t(dirty ? 'guardDirty' : status)}</Output>

      {pending && (
        <>
          <div className="lab-overlay" onClick={() => setPending(null)} />
          <div className="lab-dialog lab-dialog-warn" role="alertdialog" aria-modal="true"
            aria-labelledby="leave-title" aria-describedby="leave-desc" data-testid="leave-dialog"
            data-target={pending}>
            <h3 id="leave-title">{t('leaveTitle')}</h3>
            <p id="leave-desc">{t('leaveDesc')}</p>
            <div className="button-row">
              <button ref={stayRef} id="leave-stay" className="btn-secondary" onClick={() => setPending(null)}>
                {t('leaveStay')}
              </button>
              <button id="leave-save" className="btn-primary" onClick={saveAndLeave}>{t('leaveSave')}</button>
              <button id="leave-discard" className="btn-danger" onClick={leave}>{t('leaveDiscard')}</button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function NavigationPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero navigation-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="navigation-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('navigationHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('navigationHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🧭</div>
      </header>

      <h2 className="media-group-title">{t('navigationGroupMenus')}</h2>
      <div className="content-grid media-grid">
        <AccordionSection />
        <BreadcrumbsSection />
        <ContextMenuSection />
        <DropdownMenuSection />
      </div>

      <h2 className="media-group-title">{t('navigationGroupLeaving')}</h2>
      <div className="content-grid media-grid">
        <DrawerSection />
        <UnsavedGuardSection />
      </div>
    </div>
  )
}
