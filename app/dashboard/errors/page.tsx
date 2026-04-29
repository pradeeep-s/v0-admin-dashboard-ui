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
import { EmptyState } from '@/components/common/empty-state'
import { TableSkeleton } from '@/components/common/loading-skeleton'
import { SelectField, TextField } from '@/components/common/form-field'
import { UploadError } from '@/lib/types'
import { Download, AlertCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const ERROR_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Validation Error', value: 'validation' },
  { label: 'Format Error', value: 'format' },
  { label: 'Required Field', value: 'required' },
  { label: 'Unique Constraint', value: 'unique' },
  { label: 'Range Error', value: 'range' },
]

export default function ErrorsPage() {
  const [errors, setErrors] = useState<UploadError[]>([])
  const [filteredErrors, setFilteredErrors] = useState<UploadError[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    uploadId: '',
    columnName: '',
    errorType: '',
    searchTerm: '',
  })

  useEffect(() => {
    const loadErrors = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/errors')
        const data = await res.json()
        setErrors(data.data || [])
      } catch (error) {
        console.error('Error loading errors:', error)
      } finally {
        setLoading(false)
      }
    }

    loadErrors()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...errors]

    if (filters.uploadId) {
      filtered = filtered.filter((e) => e.uploadId === filters.uploadId)
    }

    if (filters.columnName) {
      filtered = filtered.filter((e) =>
        e.columnName.toLowerCase().includes(filters.columnName.toLowerCase())
      )
    }

    if (filters.errorType) {
      filtered = filtered.filter((e) => e.errorType === filters.errorType)
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.errorMessage.toLowerCase().includes(term) ||
          e.columnName.toLowerCase().includes(term) ||
          e.rowNumber.toString().includes(term)
      )
    }

    setFilteredErrors(filtered)
  }, [errors, filters])

  const handleDownload = () => {
    alert('Downloading errors as Excel file...')
  }

  const uniqueUploadIds = Array.from(
    new Set(errors.map((e) => e.uploadId))
  ).map((id) => ({
    label: id,
    value: id,
  }))

  const uniqueColumns = Array.from(
    new Set(errors.map((e) => e.columnName))
  ).map((col) => ({
    label: col,
    value: col,
  }))

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Error Reports</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Error Reports</h1>
          <p className="text-muted-foreground mt-2">
            Review and analyze validation errors from uploads
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Upload ID Filter */}
              <SelectField
                label="Upload ID"
                value={filters.uploadId}
                onChange={(value) =>
                  setFilters({ ...filters, uploadId: value })
                }
                options={[
                  { label: 'All Uploads', value: '' },
                  ...uniqueUploadIds,
                ]}
              />

              {/* Column Name Filter */}
              <SelectField
                label="Column"
                value={filters.columnName}
                onChange={(value) =>
                  setFilters({ ...filters, columnName: value })
                }
                options={[
                  { label: 'All Columns', value: '' },
                  ...uniqueColumns,
                ]}
              />

              {/* Error Type Filter */}
              <SelectField
                label="Error Type"
                value={filters.errorType}
                onChange={(value) =>
                  setFilters({ ...filters, errorType: value })
                }
                options={ERROR_TYPES}
              />

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search errors..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Error Details</CardTitle>
                <CardDescription>
                  {filteredErrors.length} errors found
                </CardDescription>
              </div>
              <Button onClick={handleDownload} disabled={filteredErrors.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredErrors.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No errors found"
                description="Great! No validation errors to report. Try adjusting your filters to see other uploads."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Upload ID</TableHead>
                      <TableHead className="text-right">Row #</TableHead>
                      <TableHead>Column</TableHead>
                      <TableHead>Error Type</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.map((error) => (
                      <TableRow key={error.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm font-medium">
                          {error.uploadId}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {error.rowNumber}
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {error.columnName}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-destructive/10 text-destructive">
                            {error.errorType}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground">
                            {error.errorMessage}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {error.actualValue ? (
                            <code className="bg-muted px-2 py-1 rounded text-sm truncate block">
                              {error.actualValue}
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
