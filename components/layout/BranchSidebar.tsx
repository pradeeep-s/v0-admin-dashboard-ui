'use client'

import { SidebarLink } from './SidebarLink'
import { LayoutDashboard, Package, AlertCircle } from 'lucide-react'

export function BranchSidebar() {
  const branchLinks = [
    { href: '/branch/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/branch/modules', label: 'Assigned Modules', icon: Package },
    { href: '/branch/errors', label: 'Error History', icon: AlertCircle },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">PACS Banking</h1>
        <p className="text-sm text-muted-foreground mt-1">Branch Portal</p>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {branchLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>
    </aside>
  )
}
