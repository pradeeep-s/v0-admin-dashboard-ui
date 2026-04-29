import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { UploadResult } from '@/lib/types'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ResultCardProps {
  result: UploadResult
}

export function ResultCard({ result }: ResultCardProps) {
  const successPercentage = Math.round(
    (result.successRows / result.totalRows) * 100
  )
  const failurePercentage = Math.round(
    (result.failedRows / result.totalRows) * 100
  )

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upload Result</CardTitle>
          <StatusBadge status={result.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Rows */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground font-medium">
              Total Rows
            </p>
            <p className="text-2xl font-bold mt-1 text-foreground">
              {result.totalRows.toLocaleString()}
            </p>
          </div>

          {/* Success Rows */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-muted-foreground font-medium">
                Success
              </p>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">
              {result.successRows.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {successPercentage}% of total
            </p>
          </div>

          {/* Failed Rows */}
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-muted-foreground font-medium">
                Failed
              </p>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-700 dark:text-red-300">
              {result.failedRows.toLocaleString()}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {failurePercentage}% of total
            </p>
          </div>

          {/* Status */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground font-medium">
              Upload Status
            </p>
            <p className="text-2xl font-bold mt-1 text-foreground capitalize">
              {result.status}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(result.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-foreground">
              Processing Progress
            </p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            {/* Success portion */}
            <div
              className="bg-green-500"
              style={{ width: `${successPercentage}%` }}
            />
            {/* Failed portion */}
            <div
              className="bg-red-500"
              style={{ width: `${failurePercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>
              ✓ {successPercentage}% Success
            </span>
            <span>
              ✕ {failurePercentage}% Failed
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
