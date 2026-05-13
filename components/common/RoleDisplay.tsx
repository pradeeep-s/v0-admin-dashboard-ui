'use client'

import { UserRole } from '@/lib/types'

interface RoleDisplayProps {
  role: UserRole
  variant?: 'badge' | 'text' | 'full'
}

/**
 * Component to display user role with appropriate styling
 */
export function RoleDisplay({ role, variant = 'badge' }: RoleDisplayProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          badge: 'bg-red-100 text-red-800',
          icon: '👨‍💼',
          label: 'Administrator',
        }
      case 'Branch':
        return {
          badge: 'bg-blue-100 text-blue-800',
          icon: '🏢',
          label: 'Branch Manager',
        }
      case 'Operator':
        return {
          badge: 'bg-green-100 text-green-800',
          icon: '⚙️',
          label: 'Data Operator',
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          icon: '👤',
          label: role,
        }
    }
  }

  const { badge, icon, label } = getRoleColor(role)

  switch (variant) {
    case 'badge':
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}>
          {role}
        </span>
      )
    case 'text':
      return <span className="text-sm font-medium">{label}</span>
    case 'full':
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
      )
    default:
      return <span>{role}</span>
  }
}
