'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { History, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface UploadRecord {
  id: string
  fileName: string
  moduleId: string
  moduleName: string
  totalRows: number
  successRows: number
  failedRows: number
  status: 'success' | 'partial' | 'pending'
  createdAt: string
}

export default function OperatorHistoryPage() {
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'partial' | 'pending'>('all')

  // Sample data
  const sampleUploads: UploadRecord[] = [
    {
      id: '1',
      fileName: 'customers_batch1.xlsx',
      moduleId: '1',
      moduleName: 'Customer Module',
      totalRows: 500,
      successRows: 495,
      failedRows: 5,
      status: 'partial',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      fileName: 'loans_january.xlsx',
      moduleId: '2',
      moduleName: 'Loan Module',
      totalRows: 1000,
      successRows: 1000,
      failedRows: 0,
      status: 'success',
      createdAt: '2024-01-14T14:20:00',
    },
    {
      id: '3',
      fileName: 'savings_data.csv',
      moduleId: '3',
      moduleName: 'Savings Module',
      totalRows: 750,
      successRows: 720,
      failedRows: 30,
      status: 'partial',
      createdAt: '2024-01-13T09:15:00',
    },
  ]

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setUploads(sampleUploads)
      setLoading(false)
    }, 500)
  }, [])

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch =
      upload.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || upload.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSuccessRate = (success: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((success / total) * 100)}%`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <History className="w-8 h-8" />
          Upload History
        </h1>
        <p className="text-muted-foreground mt-1">View all your file uploads and their status</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4 mb-6">
          <Input
            placeholder="Search by file name or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <div className="flex gap-2">
            {(['all', 'success', 'partial', 'pending'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-foreground hover:bg-accent/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading upload history...</p>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No uploads found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUploads.map((upload) => (
              <Link href={`/operator/history/${upload.id}`} key={upload.id}>
                <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{upload.fileName}</p>
                          <p className="text-sm text-muted-foreground">{upload.moduleName}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Rows</p>
                      <p className="font-semibold text-foreground">{upload.totalRows}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Success</p>
                      <p className="font-semibold text-green-600">{upload.successRows}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="font-semibold text-red-600">{upload.failedRows}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className="font-semibold text-foreground">{getSuccessRate(upload.successRows, upload.totalRows)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(upload.createdAt).toLocaleString()}</span>
                    {upload.failedRows > 0 && (
                      <span className="text-yellow-600 font-medium">
                        {upload.failedRows} errors - Click to view details
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
