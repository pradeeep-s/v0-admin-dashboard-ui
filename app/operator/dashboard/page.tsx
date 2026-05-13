'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Upload, History, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function OperatorDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Uploads', value: '156', icon: Upload, color: 'bg-orange-100' },
    { label: 'Successful', value: '148', icon: CheckCircle, color: 'bg-green-100' },
    { label: 'Errors', value: '8', icon: AlertCircle, color: 'bg-red-100' },
    { label: 'Success Rate', value: '94.8%', icon: History, color: 'bg-blue-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Operator Dashboard</h1>
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

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/operator/upload">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-4 rounded-lg">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Upload Data</h3>
                <p className="text-muted-foreground mt-1">Upload Excel/CSV files</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/operator/history">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Upload History</h3>
                <p className="text-muted-foreground mt-1">View past uploads</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Uploads */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Uploads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2">File Name</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Records</th>
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-border hover:bg-accent">
                  <td className="py-3 px-2 font-medium">upload_{i}.xlsx</td>
                  <td className="py-3 px-2 text-muted-foreground">{`2024-01-${20 - i}`}</td>
                  <td className="py-3 px-2">245</td>
                  <td className="py-3 px-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/operator/history" className="text-primary hover:underline text-sm mt-4 block">
          View all uploads →
        </Link>
      </Card>

      {/* Error Alerts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Errors</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-red-900">Validation Error</p>
                  <p className="text-sm text-red-700 mt-1">Row {i * 5}: Invalid email format</p>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">Fix</button>
              </div>
            </div>
          ))}
        </div>
        <Link href="/operator/errors" className="text-primary hover:underline text-sm mt-4 block">
          View all errors →
        </Link>
      </Card>
    </div>
  )
}
