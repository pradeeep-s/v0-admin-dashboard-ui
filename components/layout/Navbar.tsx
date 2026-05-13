'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800'
      case 'Branch':
        return 'bg-blue-100 text-blue-800'
      case 'Operator':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.username}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
