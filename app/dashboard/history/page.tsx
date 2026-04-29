'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatusBadge } from '@/components/common/status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { TableSkeleton } from '@/components/common/loading-skeleton'
import { UploadResult } from '@/lib/types'
import { Download, Eye, History } from 'lucide-react'

export default function HistoryPage() {
  const [uploads, setUploads] = useState<UploadResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/history')
        const data = await res.json()
        setUploads(data.data || [])
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const handleViewErrors = (uploadId: string) => {
    setSelectedId(uploadId)
  }

  const handleDownloadErrors = async (uploadId: string) => {
    // Simulate downloading error report
    alert(`Downloading error report for upload ${uploadId}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Upload History</h1>
          <TableSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload History</h1>
          <p className="text-muted-foreground mt-2">
            View all previous data uploads and their processing status
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Records</CardTitle>
            <CardDescription>
              {uploads.length} uploads found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 ? (
              <EmptyState
                icon={History}
                title="No uploads yet"
                description="Start by uploading your first Excel file from the Upload Data page"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Upload ID</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Scheme</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Success</TableHead>
                      <TableHead className="text-right">Failed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.map((upload) => (
                      <TableRow key={upload.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium font-mono text-sm">
                          {upload.id}
                        </TableCell>
                        <TableCell>{upload.branchName}</TableCell>
                        <TableCell>{upload.moduleName}</TableCell>
                        <TableCell>{upload.schemeName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {upload.totalRows}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {upload.successRows}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {upload.failedRows}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={upload.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(upload.uploadedAt).toLocaleDateString(
                            'en-IN',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewErrors(upload.id)}
                              disabled={upload.failedRows === 0}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadErrors(upload.id)}
                              disabled={upload.failedRows === 0}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Upload Details */}
        {selectedId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Upload Details: {selectedId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Error details would be displayed here. Navigate to &quot;Error Reports&quot; page
                for full error details and filtering options.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
