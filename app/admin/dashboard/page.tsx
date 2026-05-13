'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Users, MapPin, Package, Upload, AlertCircle, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-100' },
    { label: 'Active Branches', value: '45', icon: MapPin, color: 'bg-green-100' },
    { label: 'Modules', value: '12', icon: Package, color: 'bg-purple-100' },
    { label: 'Total Uploads', value: '5,678', icon: Upload, color: 'bg-orange-100' },
    { label: 'Errors This Week', value: '89', icon: AlertCircle, color: 'bg-red-100' },
    { label: 'Pending Tasks', value: '23', icon: BarChart3, color: 'bg-indigo-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.username}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/users" className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <p className="font-medium">Create User</p>
            <p className="text-sm text-muted-foreground mt-1">Add new user to system</p>
          </a>
          <a href="/admin/branches" className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <p className="font-medium">Add Branch</p>
            <p className="text-sm text-muted-foreground mt-1">Create new branch</p>
          </a>
          <a href="/admin/modules" className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <p className="font-medium">Manage Modules</p>
            <p className="text-sm text-muted-foreground mt-1">Configure modules</p>
          </a>
          <a href="/admin/settings" className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <p className="font-medium">System Settings</p>
            <p className="text-sm text-muted-foreground mt-1">Configure system</p>
          </a>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">User uploaded file</p>
                <p className="text-sm text-muted-foreground">2 minutes ago</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Success</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
