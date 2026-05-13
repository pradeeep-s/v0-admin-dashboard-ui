'use client'

import { SidebarLink } from './SidebarLink'
import { LayoutDashboard, Users, MapPin, Package, Settings, Database, Upload, AlertCircle, BarChart3, Layers } from 'lucide-react'

export function AdminSidebar() {
  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/branches', label: 'Branch Management', icon: MapPin },
    { href: '/admin/modules', label: 'Module Management', icon: Package },
    { href: '/admin/module-columns', label: 'Column Config', icon: Layers },
    { href: '/admin/queries', label: 'Query Management', icon: Database },
    { href: '/admin/uploads', label: 'Upload History', icon: Upload },
    { href: '/admin/errors', label: 'Error History', icon: AlertCircle },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/settings', label: 'System Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">PACS Banking</h1>
        <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {adminLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>
    </aside>
  )
}
