'use client'

import { SidebarLink } from './SidebarLink'
import { LayoutDashboard, Upload, History, AlertCircle } from 'lucide-react'

export function OperatorSidebar() {
  const operatorLinks = [
    { href: '/operator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/operator/upload', label: 'Upload Data', icon: Upload },
    { href: '/operator/history', label: 'Upload History', icon: History },
    { href: '/operator/errors', label: 'Error History', icon: AlertCircle },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">PACS Banking</h1>
        <p className="text-sm text-muted-foreground mt-1">Operator Portal</p>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {operatorLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>
    </aside>
  )
}
