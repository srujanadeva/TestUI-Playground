// The left navigation shared by every signed-in page, plus NAV: the list of
// Playground sections that both the sidebar and the Playground's scroll-spy use.
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

// ─── Sidebar ─────────────────────────────────────────────────────────────────
// The Playground's sections, in sidebar order. `id` must match the section's
// element id; it is used both to scroll there and to highlight the visible section.
export const NAV = [
  { id: 'sec-text',        labelKey: 'navTextInput',        groupKey: 'navInputs' },
  { id: 'sec-password',    labelKey: 'navPasswordTextarea', groupKey: 'navInputs' },
  { id: 'sec-date',        labelKey: 'navDatePicker',       groupKey: 'navInputs' },
  { id: 'sec-slider',      labelKey: 'navSlider',           groupKey: 'navInputs' },
  { id: 'sec-file',        labelKey: 'navFileUpload',       groupKey: 'navInputs' },
  { id: 'sec-form',        labelKey: 'navFormValidation',   groupKey: 'navInputs' },
  { id: 'sec-checkbox',    labelKey: 'navCheckboxes',       groupKey: 'navSelection' },
  { id: 'sec-radio',       labelKey: 'navRadioGroup',       groupKey: 'navSelection' },
  { id: 'sec-dropdown',    labelKey: 'navDropdownTags',     groupKey: 'navSelection' },
  { id: 'sec-ratings',     labelKey: 'navRatings',          groupKey: 'navSelection' },
  { id: 'sec-counter',     labelKey: 'navClickCounter',     groupKey: 'navButtons' },
  { id: 'sec-dblclick',    labelKey: 'navDoubleClick',      groupKey: 'navButtons' },
  { id: 'sec-dynamic',     labelKey: 'navDynamicButtons',   groupKey: 'navButtons' },
  { id: 'sec-hover',       labelKey: 'navMouseHover',       groupKey: 'navEvents' },
  { id: 'sec-focus',       labelKey: 'navFocusBlur',        groupKey: 'navEvents' },
  { id: 'sec-dragdrop',    labelKey: 'navDragDrop',         groupKey: 'navEvents' },
  { id: 'sec-signature',   labelKey: 'navSignature',        groupKey: 'navEvents' },
  { id: 'sec-popups',      labelKey: 'navBrowserPopups',    groupKey: 'navWindows' },
  { id: 'sec-windows',     labelKey: 'navLinksWindows',     groupKey: 'navWindows' },
  { id: 'sec-popup-alerts',labelKey: 'navPopupAlerts',      groupKey: 'navWindows' },
  { id: 'sec-shadow',      labelKey: 'navShadowDOM',        groupKey: 'navAdvanced' },
  { id: 'sec-table',       labelKey: 'navPaginationTable',  groupKey: 'navAdvanced', subGroupKey: 'navDataTables' },
  { id: 'sec-toggle',      labelKey: 'navShowHide',         groupKey: 'navAdvanced' },
  { id: 'sec-conditional', labelKey: 'navConditionalFields', groupKey: 'navAdvanced' },
  { id: 'sec-delayed',     labelKey: 'navDelayedWidget',     groupKey: 'navAdvanced' },
  { id: 'sec-progress',    labelKey: 'navProgressBar',       groupKey: 'navAdvanced' },
  { id: 'sec-stepper',     labelKey: 'navStepper',           groupKey: 'navAdvanced' },
]

const GROUP_KEYS = ['navInputs', 'navSelection', 'navButtons', 'navEvents', 'navWindows', 'navAdvanced']

// Feature pages, listed under the collapsible "Pages" group below the Test Pet Store entry.
const PAGE_LINKS = [
  { to: '/media',        icon: '🎬', labelKey: 'navMedia',        className: 'nav-media-cta',        testId: 'nav-media' },
  { to: '/frames',       icon: '🪟', labelKey: 'navFrames',       className: 'nav-frames-cta',       testId: 'nav-frames' },
  { to: '/spreadsheet',  icon: '📊', labelKey: 'navSpreadsheet',  className: 'nav-spreadsheet-cta',  testId: 'nav-spreadsheet' },
  { to: '/verification', icon: '🛡️', labelKey: 'navVerification', className: 'nav-verification-cta', testId: 'nav-verification' },
  { to: '/controls',     icon: '🎛️', labelKey: 'navControls',     className: 'nav-controls-cta',     testId: 'nav-controls' },
  { to: '/navigation',   icon: '🧭', labelKey: 'navNavigation',   className: 'nav-navigation-cta',   testId: 'nav-navigation' },
  { to: '/data',         icon: '🗂️', labelKey: 'navData',         className: 'nav-data-cta',         testId: 'nav-data' },
  { to: '/interactions', icon: '🖐️', labelKey: 'navInteractions', className: 'nav-interactions-cta', testId: 'nav-interactions' },
  { to: '/live',         icon: '⏱️', labelKey: 'navLive',         className: 'nav-live-cta',         testId: 'nav-live' },
  { to: '/browser',      icon: '🌐', labelKey: 'navBrowser',      className: 'nav-browser-cta',      testId: 'nav-browser' },
]

/**
 * The left navigation: language toggle, petstore and feature-page links, the
 * Playground's section groups (collapsible), and the account / logout area.
 * @param active Id of the Playground section currently on screen, highlighted in the list.
 * @param onPlaygroundItem Called with a section id when one of its links is clicked.
 */
export default function Sidebar({ active, onPlaygroundItem }) {
  const { t, lang, toggleLang } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(GROUP_KEYS.map(g => [g, true]))
  )
  const [openSubGroups, setOpenSubGroups] = useState({})
  const [pagesOpen, setPagesOpen] = useState(true)

  const toggleGroup = g => setOpenGroups(s => ({ ...s, [g]: !s[g] }))
  const toggleSubGroup = sg => setOpenSubGroups(s => ({ ...s, [sg]: !s[sg] }))

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">TP</span>
        <span>{t('appName')}</span>
      </div>
      <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language">
        {t('langToggle')}
      </button>

      <NavLink
        to="/petstore"
        className={({ isActive }) => `nav-petstore-cta ${isActive ? 'is-active' : ''}`}
        data-testid="nav-test-pet-store"
      >
        <span className="nav-petstore-icon" aria-hidden>🐾</span>
        <span className="nav-petstore-label">{t('navTestPetStore')}</span>
      </NavLink>

      <div className="nav-group nav-pages-group">
        <button className="nav-group-label" data-testid="nav-pages-toggle"
          aria-expanded={pagesOpen} aria-controls="nav-pages" onClick={() => setPagesOpen(o => !o)}>
          <span>{t('navPages')}</span>
          <span className={`nav-chevron ${pagesOpen ? 'nav-chevron-open' : ''}`}>›</span>
        </button>
      </div>
      {pagesOpen && (
        <div id="nav-pages" className="nav-pages">
          {PAGE_LINKS.map(p => (
            <NavLink key={p.to} to={p.to} data-testid={p.testId}
              className={({ isActive }) => `nav-petstore-cta ${p.className} ${isActive ? 'is-active' : ''}`}>
              <span className="nav-petstore-icon" aria-hidden>{p.icon}</span>
              <span className="nav-petstore-label">{t(p.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      )}

      {GROUP_KEYS.map(gKey => {
        const groupItems  = NAV.filter(n => n.groupKey === gKey)
        const subGroupKeys = [...new Set(groupItems.filter(n => n.subGroupKey).map(n => n.subGroupKey))]
        const directItems  = groupItems.filter(n => !n.subGroupKey)
        const isOpen = openGroups[gKey]

        return (
          <div key={gKey} className="nav-group">
            <button className="nav-group-label" onClick={() => toggleGroup(gKey)}>
              <span>{t(gKey)}</span>
              <span className={`nav-chevron ${isOpen ? 'nav-chevron-open' : ''}`}>›</span>
            </button>
            {isOpen && (
              <>
                {directItems.map(n => (
                  <button key={n.id}
                    className={`nav-item ${active === n.id ? 'nav-active' : ''}`}
                    onClick={() => onPlaygroundItem(n.id)}>
                    {t(n.labelKey)}
                  </button>
                ))}
                {subGroupKeys.map(sgKey => {
                  const sgOpen = openSubGroups[sgKey]
                  return (
                    <div key={sgKey} className="nav-subgroup">
                      <button className="nav-subgroup-label" onClick={() => toggleSubGroup(sgKey)}>
                        <span className="nav-subgroup-icon">⊞</span>
                        <span>{t(sgKey)}</span>
                        <span className={`nav-chevron ${sgOpen ? 'nav-chevron-open' : ''}`}>›</span>
                      </button>
                      {sgOpen && groupItems
                        .filter(n => n.subGroupKey === sgKey)
                        .map(n => (
                          <button key={n.id}
                            className={`nav-item nav-item-nested ${active === n.id ? 'nav-active' : ''}`}
                            onClick={() => onPlaygroundItem(n.id)}>
                            <span className="nav-item-dot" />
                            {t(n.labelKey)}
                          </button>
                        ))
                      }
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )
      })}

      <div className="sidebar-account" data-testid="sidebar-account">
        {user ? (
          <>
            <NavLink to="/account" className="sidebar-account-user" data-testid="sidebar-account-link">
              <span className="sidebar-account-avatar" aria-hidden>
                {(user.name || '?').charAt(0).toUpperCase()}
              </span>
              <span className="sidebar-account-name">{user.name}</span>
            </NavLink>
            <button
              className="sidebar-account-logout"
              onClick={handleLogout}
              data-testid="sidebar-logout"
            >
              {t('authLogout')}
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="sidebar-account-login" data-testid="sidebar-login-link">
              {t('authLogin')}
            </NavLink>
            <NavLink to="/signup" className="sidebar-account-signup" data-testid="sidebar-signup-link">
              {t('authSignup')}
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
