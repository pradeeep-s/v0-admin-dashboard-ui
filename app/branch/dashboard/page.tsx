'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Package, Upload, AlertCircle, TrendingUp } from 'lucide-react'

export default function BranchDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Assigned Modules', value: '8', icon: Package, color: 'bg-purple-100' },
    { label: 'Total Uploads', value: '234', icon: Upload, color: 'bg-orange-100' },
    { label: 'Errors', value: '12', icon: AlertCircle, color: 'bg-red-100' },
    { label: 'Success Rate', value: '94.8%', icon: TrendingUp, color: 'bg-green-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Branch Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.username}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Data Management</h2>
        <div className="space-y-3">
          <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <p className="font-medium">Add New Records</p>
            <p className="text-sm text-muted-foreground mt-1">Manually add records to assigned modules</p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <p className="font-medium">Edit Records</p>
            <p className="text-sm text-muted-foreground mt-1">Update existing records</p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <p className="font-medium">View Records</p>
            <p className="text-sm text-muted-foreground mt-1">Browse all records</p>
          </div>
        </div>
      </Card>

      {/* Recent Uploads */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Uploads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Module</th>
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Records</th>
                <th className="text-left py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-border hover:bg-accent">
                  <td className="py-2 px-2">Customer Module</td>
                  <td className="py-2 px-2 text-muted-foreground">{`2024-01-${20 - i}`}</td>
                  <td className="py-2 px-2">145</td>
                  <td className="py-2 px-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
