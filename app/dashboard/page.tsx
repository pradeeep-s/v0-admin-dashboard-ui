'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Upload,
  Clock,
  AlertCircle,
  Settings,
  TrendingUp,
  Activity,
  FileText,
} from 'lucide-react'

interface StatCard {
  label: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: string
}

const stats: StatCard[] = [
  {
    label: 'Total Uploads',
    value: '24',
    description: 'This month',
    icon: <Upload className="w-6 h-6" />,
    trend: '+12% from last month',
  },
  {
    label: 'Success Rate',
    value: '94.2%',
    description: 'Average',
    icon: <TrendingUp className="w-6 h-6" />,
    trend: '+2.3% from last month',
  },
  {
    label: 'Errors Found',
    value: '156',
    description: 'To resolve',
    icon: <AlertCircle className="w-6 h-6" />,
    trend: '-8% from last month',
  },
  {
    label: 'Active Schemes',
    value: '6',
    description: 'Configured',
    icon: <Activity className="w-6 h-6" />,
  },
]

const quickActions = [
  {
    title: 'Upload Data',
    description: 'Upload and process Excel files',
    icon: Upload,
    href: '/dashboard/upload',
  },
  {
    title: 'View History',
    description: 'Check upload history and status',
    icon: Clock,
    href: '/dashboard/history',
  },
  {
    title: 'Error Reports',
    description: 'Review and analyze errors',
    icon: AlertCircle,
    href: '/dashboard/errors',
  },
  {
    title: 'Configuration',
    description: 'Manage modules and schemes',
    icon: Settings,
    href: '/dashboard/config',
  },
]

const recentUploads = [
  {
    id: 'UPL-001',
    fileName: 'members_data_april.xlsx',
    status: 'Success',
    statusColor: 'text-green-600 dark:text-green-400',
    rows: '1,485 / 1,500',
    date: '2024-04-25',
  },
  {
    id: 'UPL-002',
    fileName: 'deposits_delhi_april.xlsx',
    status: 'Success',
    statusColor: 'text-green-600 dark:text-green-400',
    rows: '2,300 / 2,300',
    date: '2024-04-24',
  },
  {
    id: 'UPL-003',
    fileName: 'loans_bangalore_april.xlsx',
    status: 'Failed',
    statusColor: 'text-red-600 dark:text-red-400',
    rows: '450 / 800',
    date: '2024-04-23',
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here&apos;s your data processing overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardDescription className="text-xs">
                      {stat.label}
                    </CardDescription>
                    <p className="text-2xl font-bold mt-1 text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-primary/60">{stat.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.trend && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    {stat.trend}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block group"
                >
                  <Card className="h-full hover:shadow-md hover:border-primary transition-all cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Latest uploads from the past week
                </CardDescription>
              </div>
              <Link href="/dashboard/history">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {upload.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{upload.id}</span>
                        <span>•</span>
                        <span>{upload.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${upload.statusColor}`}>
                      {upload.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {upload.rows} rows
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
