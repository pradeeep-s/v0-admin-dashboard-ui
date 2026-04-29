'use client'

import { useState, useEffect, useCallback, useContext, createContext } from 'react'
import { User } from '@/lib/types'
import { api } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await api.get<User>('/api/me')
        setUser(userData)
        setError(null)
      } catch (err) {
        setUser(null)
        setError(null) // Don't show error for unauthenticated users
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/logout')
      setUser(null)
      setError(null)
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (err) {
      setError('Logout failed')
    }
  }, [])

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: user !== null,
  }
}
