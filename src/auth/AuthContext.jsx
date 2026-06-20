import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiFetch, ApiError } from '../api/client.js'

const STORAGE_KEY = 'tp-auth-token'

const AuthContext = createContext(null)

function readStoredToken() {
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || null
}

function writeToken(token, remember) {
  clearToken()
  if (!token) return
  if (remember) localStorage.setItem(STORAGE_KEY, token)
  else sessionStorage.setItem(STORAGE_KEY, token)
}

function clearToken() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    let cancelled = false
    async function rehydrate() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await apiFetch('/api/auth/me', { token })
        if (!cancelled) setUser(data.user)
      } catch (err) {
        if (!cancelled) {
          clearToken()
          setToken(null)
          setUser(null)
        }
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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
