'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Download, RotateCcw } from 'lucide-react'

interface ErrorRecord {
  id: string
  uploadId: string
  uploadFileName: string
  rowNumber: number
  columnName: string
  errorMessage: string
  actualValue: string
  createdAt: string
}

export default function OperatorErrorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])

  // Sample error data
  const errors: ErrorRecord[] = [
    {
      id: '1',
      uploadId: '1',
      uploadFileName: 'customers_batch1.xlsx',
      rowNumber: 45,
      columnName: 'email',
      errorMessage: 'Invalid email format',
      actualValue: 'john.doe@',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      uploadId: '1',
      uploadFileName: 'customers_batch1.xlsx',
      rowNumber: 67,
      columnName: 'phone',
      errorMessage: 'Phone number must be 10 digits',
      actualValue: '12345',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '3',
      uploadId: '1',
      uploadFileName: 'customers_batch1.xlsx',
      rowNumber: 89,
      columnName: 'date_of_birth',
      errorMessage: 'Invalid date format',
      actualValue: '32/13/2000',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '4',
      uploadId: '3',
      uploadFileName: 'savings_data.csv',
      rowNumber: 123,
      columnName: 'account_balance',
      errorMessage: 'Balance must be positive',
      actualValue: '-5000',
      createdAt: '2024-01-13T09:15:00',
    },
    {
      id: '5',
      uploadId: '3',
      uploadFileName: 'savings_data.csv',
      rowNumber: 145,
      columnName: 'account_number',
      errorMessage: 'Account number already exists',
      actualValue: 'ACC001234',
      createdAt: '2024-01-13T09:15:00',
    },
  ]

  const filteredErrors = errors.filter((error) =>
    error.uploadFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    error.columnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    error.errorMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSelectError = (id: string) => {
    setSelectedErrors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedErrors.length === filteredErrors.length) {
      setSelectedErrors([])
    } else {
      setSelectedErrors(filteredErrors.map((e) => e.id))
    }
  }

  const handleExportErrors = () => {
    // TODO: Export selected errors to CSV/Excel
    console.log('Exporting errors:', selectedErrors)
  }

  const handleRetryUpload = (uploadId: string) => {
    // TODO: Retry upload logic
    console.log('Retrying upload:', uploadId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-8 h-8" />
          Error History
        </h1>
        <p className="text-muted-foreground mt-1">Review and manage upload errors</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search errors by file, column, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={handleExportErrors} disabled={selectedErrors.length === 0}>
              <Download className="w-4 h-4" />
              Export Selected
            </Button>
          </div>
        </div>

        {filteredErrors.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No errors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedErrors.length === filteredErrors.length && filteredErrors.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">File / Row</th>
                  <th className="text-left py-3 px-4 font-semibold">Column</th>
                  <th className="text-left py-3 px-4 font-semibold">Error Message</th>
                  <th className="text-left py-3 px-4 font-semibold">Actual Value</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredErrors.map((error) => (
                  <tr key={error.id} className="border-b border-border hover:bg-accent">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedErrors.includes(error.id)}
                        onChange={() => toggleSelectError(error.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{error.uploadFileName}</p>
                        <p className="text-xs text-muted-foreground">Row {error.rowNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{error.columnName}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {error.errorMessage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                      {error.actualValue}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(error.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRetryUpload(error.uploadId)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg text-primary hover:bg-primary/10 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Error Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Errors</p>
          <p className="text-3xl font-bold text-foreground">{errors.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Validation Errors</p>
          <p className="text-3xl font-bold text-foreground">{errors.filter((e) => e.errorMessage.includes('Invalid')).length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Duplicate Errors</p>
          <p className="text-3xl font-bold text-foreground">{errors.filter((e) => e.errorMessage.includes('already')).length}</p>
        </Card>
      </div>
    </div>
  )
}
