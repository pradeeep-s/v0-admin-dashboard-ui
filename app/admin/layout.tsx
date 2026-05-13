import { ReactNode } from 'react'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Admin Dashboard | PACS Banking',
  description: 'Administrator dashboard for PACS Banking system',
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <RoleGuard requiredRoles={['Admin']}>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
