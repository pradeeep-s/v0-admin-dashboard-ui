'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Plus, Edit, Trash2 } from 'lucide-react'

export default function ModulesPage() {
  // Sample modules data
  const modules = [
    { id: '1', name: 'Customer Module', code: 'CUSTOMER', description: 'Manage customer data', isActive: true },
    { id: '2', name: 'Loan Module', code: 'LOAN', description: 'Manage loan information', isActive: true },
    { id: '3', name: 'Savings Module', code: 'SAVINGS', description: 'Manage savings accounts', isActive: true },
    { id: '4', name: 'Transaction Module', code: 'TRANSACTION', description: 'Manage transactions', isActive: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-8 h-8" />
            Module Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage data modules</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.code}</p>
              </div>
              {module.isActive && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Active
                </span>
              )}
            </div>

            <p className="text-muted-foreground mb-4">{module.description}</p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm" className="ml-auto">
                Configure Columns
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
