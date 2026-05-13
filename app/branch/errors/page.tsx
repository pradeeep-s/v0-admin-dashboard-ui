'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'

interface ErrorRecord {
  id: string
  moduleName: string
  rowNumber: number
  columnName: string
  errorMessage: string
  actualValue: string
  createdAt: string
}

export default function BranchErrorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('all')

  // Sample error data
  const errors: ErrorRecord[] = [
    {
      id: '1',
      moduleName: 'Customer Module',
      rowNumber: 45,
      columnName: 'email',
      errorMessage: 'Invalid email format',
      actualValue: 'john.doe@',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      moduleName: 'Customer Module',
      rowNumber: 67,
      columnName: 'phone',
      errorMessage: 'Phone number must be 10 digits',
      actualValue: '12345',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '3',
      moduleName: 'Loan Module',
      rowNumber: 89,
      columnName: 'amount',
      errorMessage: 'Amount must be positive',
      actualValue: '-5000',
      createdAt: '2024-01-14T14:20:00',
    },
  ]

  const modules = ['Customer Module', 'Loan Module', 'Savings Module']

  const filteredErrors = errors.filter((error) => {
    const matchesSearch =
      error.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.columnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.errorMessage.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === 'all' || error.moduleName === selectedModule
    return matchesSearch && matchesModule
  })

  const getErrorSeverity = (message: string) => {
    if (message.includes('Invalid')) return 'warning'
    if (message.includes('already')) return 'danger'
    return 'info'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-8 h-8" />
          Error History
        </h1>
        <p className="text-muted-foreground mt-1">Review errors in your modules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Errors</p>
          <p className="text-3xl font-bold text-foreground">{errors.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">This Week</p>
          <p className="text-3xl font-bold text-foreground">{errors.filter((e) => true).length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Critical</p>
          <p className="text-3xl font-bold text-red-600">{errors.filter((e) => e.errorMessage.includes('Invalid')).length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4 mb-6">
          <Input
            placeholder="Search errors by column, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredErrors.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No errors found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredErrors.map((error) => (
              <div key={error.id} className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{error.moduleName}</p>
                    <p className="text-xs text-muted-foreground">Row {error.rowNumber} · Column: {error.columnName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getErrorSeverity(error.errorMessage) === 'danger'
                        ? 'bg-red-100 text-red-800'
                        : getErrorSeverity(error.errorMessage) === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {error.errorMessage}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-muted-foreground">Value: {error.actualValue}</span>
                  <span className="text-xs text-muted-foreground">{new Date(error.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Section */}
      <Card className="p-6 bg-accent">
        <h3 className="text-lg font-semibold text-foreground mb-3">What can you do?</h3>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li>• Review error details to understand what went wrong</li>
          <li>• Contact your administrator for critical errors</li>
          <li>• Check data format requirements in module documentation</li>
          <li>• Errors are automatically resolved when corrected data is uploaded</li>
        </ul>
      </Card>
    </div>
  )
}
