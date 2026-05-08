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

      <main className="pt-2 md:ml-25">
        <div className="p-4 md:p-6 lg:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  )
}