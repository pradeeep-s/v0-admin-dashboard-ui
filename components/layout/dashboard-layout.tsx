'use client'

import { Sidebar } from './sidebar'
import { Navbar } from './navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  onLogout?: () => void
}

export function DashboardLayout({
  children,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <Navbar onLogout={onLogout} />

      <main className="pt-16 md:ml-64">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
