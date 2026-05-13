'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Package, Plus, Eye, Edit } from 'lucide-react'
import Link from 'next/link'

interface Module {
  id: string
  name: string
  code: string
  description: string
  recordCount: number
  lastUpdate: string
}

export default function BranchModulesPage() {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      name: 'Customer Module',
      code: 'CUSTOMER',
      description: 'Customer information and details',
      recordCount: 1250,
      lastUpdate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Loan Module',
      code: 'LOAN',
      description: 'Loan accounts and transactions',
      recordCount: 845,
      lastUpdate: '2024-01-14',
    },
    {
      id: '3',
      name: 'Savings Module',
      code: 'SAVINGS',
      description: 'Savings accounts and balances',
      recordCount: 2100,
      lastUpdate: '2024-01-13',
    },
  ])

  const getTotalRecords = () => {
    return modules.reduce((sum, m) => sum + m.recordCount, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-8 h-8" />
            Assigned Modules
          </h1>
          <p className="text-muted-foreground mt-1">Manage your assigned data modules</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Modules</p>
          <p className="text-3xl font-bold text-foreground">{modules.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Records</p>
          <p className="text-3xl font-bold text-foreground">{getTotalRecords().toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Last Update</p>
          <p className="text-lg font-medium text-foreground">
            {modules.length > 0 ? modules[0].lastUpdate : 'N/A'}
          </p>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.code}</p>
              </div>
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>

            <p className="text-muted-foreground text-sm mb-4">{module.description}</p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Records:</span>
                <span className="font-semibold text-foreground">{module.recordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-semibold text-foreground">{module.lastUpdate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/branch/modules/${module.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Data
              </Link>
              <Link
                href={`/branch/modules/${module.id}/edit`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="p-6 bg-accent">
        <h3 className="text-lg font-semibold text-foreground mb-3">Need Help?</h3>
        <p className="text-muted-foreground text-sm mb-3">
          You can view and edit data in your assigned modules. Contact an administrator if you need access to additional modules.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-background transition-colors">
            Download Data
          </button>
          <button className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-background transition-colors">
            View Reports
          </button>
        </div>
      </Card>
    </div>
  )
}
