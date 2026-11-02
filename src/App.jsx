// The app's routes and signed-in layout. Every page except login, signup and
// forgot-password needs a signed-in user. The home page's practice sections live in
// src/playground/, the sidebar in src/layout/, and each themed page in its own folder.
import { useState, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LanguageProvider, useLang } from './i18n.jsx'
import LoginPage from './auth/LoginPage.jsx'
import SignupPage from './auth/SignupPage.jsx'
import ForgotPasswordPage from './auth/ForgotPasswordPage.jsx'
import AccountPage from './auth/AccountPage.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Sidebar from './layout/Sidebar.jsx'
import Playground from './playground/PlaygroundPage.jsx'
import PetstorePage from './petstore/PetstorePage.jsx'
import MediaPage from './media/MediaPage.jsx'
import FramesPage from './frames/FramesPage.jsx'
import SpreadsheetPage from './spreadsheet/SpreadsheetPage.jsx'
import VerificationPage from './verification/VerificationPage.jsx'
import DataPage from './data/DataPage.jsx'
import BrowserPage from './browser/BrowserPage.jsx'
import LivePage from './live/LivePage.jsx'
import InteractionsPage from './interactions/InteractionsPage.jsx'
import NavigationPage from './navigation/NavigationPage.jsx'
import ControlsPage from './controls/ControlsPage.jsx'

// Pages shown inside the Shell, next to the sidebar. They need no guard of their own:
// the whole Shell is behind ProtectedRoute (see App below).
const PAGES = [
  { path: 'account',      Page: AccountPage },
  { path: 'petstore',     Page: PetstorePage },
  { path: 'media',        Page: MediaPage },
  { path: 'frames',       Page: FramesPage },
  { path: 'spreadsheet',  Page: SpreadsheetPage },
  { path: 'verification', Page: VerificationPage },
  { path: 'data',         Page: DataPage },
  { path: 'controls',     Page: ControlsPage },
  { path: 'navigation',   Page: NavigationPage },
  { path: 'interactions', Page: InteractionsPage },
  { path: 'live',         Page: LivePage },
  { path: 'browser',      Page: BrowserPage },
]

// ─── Shell (sidebar + routed main) ────────────────────────────────────────────
/** The signed-in layout: the sidebar plus the routed page. */
function Shell() {
  const { lang } = useLang()
  const [active, setActive] = useState('sec-text')
  const contentRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  /**
   * Goes to a Playground section: scrolls to it when already on the home page,
   * otherwise navigates to /#id and lets Playground scroll once it has mounted.
   */
  function handlePlaygroundItem(id) {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate(`/#${id}`)
    }
  }

  return (
    <div className="layout" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar active={active} onPlaygroundItem={handlePlaygroundItem} />
      <main className="content" ref={contentRef}>
        <Routes>
          <Route index element={<Playground contentRef={contentRef} setActive={setActive} />} />
          {PAGES.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />)}
          {/* Unknown paths go back to the home page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

/**
 * Root component: the auth pages stand alone (no sidebar); everything else is the
 * Shell, which needs a signed-in user.
 */
export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Shell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </LanguageProvider>
  )
}
