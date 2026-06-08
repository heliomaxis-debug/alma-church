'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, setAccessToken, getAccessToken } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  email: string
  role: string
  aluno?: { id: string; ra: string; name: string; semestre: number; moduloInicial: number; curso: string; photo?: string }
  professor?: { id: string; name: string; title?: string }
}

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('refreshToken')
    if (!token) { setLoading(false); return }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101'}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setAccessToken(data.accessToken)
        return api.auth.me()
      })
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem('refreshToken') })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<string> {
    const data = await api.auth.login(email, password)
    setAccessToken(data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const u = await api.auth.me()
    setUser(u)
    return data.role
  }

  async function refreshUser() {
    try {
      const u = await api.auth.me()
      setUser(u)
    } catch {}
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await api.auth.logout(refreshToken).catch(() => {})
      localStorage.removeItem('refreshToken')
    }
    setAccessToken(null)
    setUser(null)
    router.push('/login')
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
