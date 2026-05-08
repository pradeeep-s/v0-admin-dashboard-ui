'use client'

import { useAuth } from '@/hooks/useAuth'
import { Bell, User, ChevronDown, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

export function Navbar({
  userName: propUserName,
  userRole: propUserRole,
  onLogout: propOnLogout,
}: NavbarProps) {
  const { user, loading, logout } = useAuth()
  
  const displayUserName = user?.username || propUserName || 'User'
  const displayUserRole = user?.role || propUserRole || 'Operator'
  const handleLogout = propOnLogout || logout
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border md:left-64 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Title */}
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-foreground">
            Data Processing Dashboard
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
          >
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Profile Dropdown */}
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-foreground hover:bg-muted"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium">{displayUserName}</p>
                    <p className="text-xs text-muted-foreground">{displayUserRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{displayUserName}</p>
                  <p className="text-xs text-muted-foreground">{displayUserRole}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Change Password</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
