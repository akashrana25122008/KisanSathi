import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  ApiClientError,
  fetchSession,
  logoutSession,
  requestOtp,
  saveProfile,
  verifyOtp,
  type AuthUser,
  type OtpRequestResult,
  type ProfileInput,
} from '@/lib/api'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  initialError: string | null
  requestCode: (phone: string, language: 'en' | 'hi') => Promise<OtpRequestResult>
  verifyCode: (
    phone: string,
    code: string,
    language: 'en' | 'hi',
  ) => Promise<{ isNew: boolean; user: AuthUser }>
  updateProfile: (input: ProfileInput) => Promise<AuthUser>
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initialError, setInitialError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const result = await fetchSession()
      if (!mountedRef.current) return result.user
      setUser(result.user)
      setStatus('authenticated')
      setInitialError(null)
      return result.user
    } catch (error) {
      if (!mountedRef.current) return null
      setUser(null)
      setStatus('anonymous')
      if (error instanceof ApiClientError && error.code !== 'unauthorized') {
        setInitialError(error.message)
      }
      return null
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const requestCode = useCallback(
    (phone: string, language: 'en' | 'hi') => requestOtp(phone, language),
    [],
  )

  const verifyCode = useCallback(
    async (phone: string, code: string, language: 'en' | 'hi') => {
      const result = await verifyOtp(phone, code, language)
      setUser(result.user)
      setStatus('authenticated')
      setInitialError(null)
      return { isNew: result.isNew, user: result.user }
    },
    [],
  )

  const updateProfile = useCallback(async (input: ProfileInput) => {
    const result = await saveProfile(input)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutSession()
    } catch {
      /* The local session is cleared below even if the network is down. */
    } finally {
      setUser(null)
      setStatus('anonymous')
      setInitialError(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      initialError,
      requestCode,
      verifyCode,
      updateProfile,
      refresh,
      logout,
    }),
    [status, user, initialError, requestCode, verifyCode, updateProfile, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
