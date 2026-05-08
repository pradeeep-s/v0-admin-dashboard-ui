import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

type StatusType = 'success' | 'failed' | 'partial' | 'pending'

interface StatusBadgeProps {
  status: StatusType
  label?: string
}

const statusConfig: Record<
  StatusType,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: React.ReactNode
    label: string
  }
> = {
  success: {
    variant: 'default',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Success',
  },
  failed: {
    variant: 'destructive',
    icon: <XCircle className="w-3 h-3" />,
    label: 'Failed',
  },
  partial: {
    variant: 'secondary',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Partial',
  },
  pending: {
    variant: 'outline',
    icon: <Clock className="w-3 h-3" />,
    label: 'Pending',
  },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || {
  variant: 'secondary',
  icon: null,
  label: status || 'Unknown',
}

  return (
    <Badge
      variant={config.variant}
      className="flex items-center gap-1.5 font-medium"
    >
      {config.icon}
      {label || config.label}
    </Badge>
  )
}
