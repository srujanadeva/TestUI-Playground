// Route guard for pages that need a signed-in user.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

/**
 * Renders `children` for a signed-in user. Shows a spinner while the stored
 * session is still being checked, and otherwise redirects to /login, passing the
 * current path in `state.from` so the login page can send the user back.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="spinner" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
