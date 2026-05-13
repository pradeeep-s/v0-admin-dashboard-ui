'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Route based on user role
    const rolePaths: Record<string, string> = {
      Admin: '/admin/dashboard',
      Branch: '/branch/dashboard',
      Operator: '/operator/dashboard',
    }

    const redirectPath = rolePaths[user.role] || '/login'
    router.push(redirectPath)
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        <p className="text-muted-foreground mt-2">Redirecting to your dashboard</p>
      </div>
    </div>
  )
}
