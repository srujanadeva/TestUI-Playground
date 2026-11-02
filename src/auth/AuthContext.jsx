// Auth state for the whole app: the JWT, the signed-in user, and the login,
// signup and logout actions. Components read it with useAuth().
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiFetch, ApiError } from '../api/client.js'

const STORAGE_KEY = 'tp-auth-token'

const AuthContext = createContext(null)

/** The saved token from either storage (see writeToken), or null. */
function readStoredToken() {
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || null
}

/**
 * Saves the token, replacing any older one.
 * "Remember me" keeps it in localStorage so it survives closing the browser;
 * otherwise sessionStorage, which is cleared when the tab closes.
 */
function writeToken(token, remember) {
  clearToken()
  if (!token) return
  if (remember) localStorage.setItem(STORAGE_KEY, token)
  else sessionStorage.setItem(STORAGE_KEY, token)
}

/** Removes the token from both storages. */
function clearToken() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * Provides auth state to the app. On load it restores the session from a stored
 * token; `loading` stays true until that check finishes, so protected pages wait
 * instead of bouncing to the login page.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    // Ignores the answer if the token changed (or the provider unmounted) while it was in flight.
    let cancelled = false
    /** Loads the user for the current token. */
    async function rehydrate() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await apiFetch('/api/auth/me', { token })
        if (!cancelled) setUser(data.user)
      } catch (err) {
        if (cancelled) return
        // Only a 401 means the token is bad. A network error (status 0) also covers a
        // request the browser aborted because the page was reloading or navigating;
        // deleting the token then would log the user out of the page they're loading.
        if (err.status === 401) {
          clearToken()
          setToken(null)
        }
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    rehydrate()
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password, remember) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    writeToken(data.token, remember)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (name, email, password, remember) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    })
    writeToken(data.token, remember)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST', token })
      } catch {
        // ignore; client side clear is what matters
      }
    }
    clearToken()
    setToken(null)
    setUser(null)
  }, [token])

  const requestPasswordReset = useCallback(async (email) => {
    await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email } })
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    requestPasswordReset,
    ApiError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * The auth state and actions from AuthProvider.
 * @returns `{ user, token, loading, login, signup, logout, requestPasswordReset, ApiError }`.
 * @throws If used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
