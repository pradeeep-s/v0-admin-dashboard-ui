'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Upload,
  Clock,
  AlertCircle,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    label: 'Upload Data',
    href: '/dashboard/upload',
    icon: Upload,
  },
  {
    label: 'Upload History',
    href: '/dashboard/history',
    icon: Clock,
  },
  {
    label: 'Error Reports',
    href: '/dashboard/errors',
    icon: AlertCircle,
  },
  {
    label: 'Admin Configuration',
    href: '/dashboard/config',
    icon: Settings,
  },
]

interface SidebarProps {
  onLogout?: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Filter menu items based on role
  const visibleMenuItems = menuItems.filter(item => {
    // Admin Configuration only for Admin role
    if (item.href === '/dashboard/config' && user?.role !== 'Admin') {
      return false
    }
    return true
  })

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card border-border"
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sm font-bold text-sidebar-primary-foreground">
                D
              </span>
            </div>
            <h1 className="text-lg font-bold">Data Hub</h1>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Excel Processing System
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-sidebar hover:bg-sidebar-accent/10"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
