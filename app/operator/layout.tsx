import { ReactNode } from 'react'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { OperatorSidebar } from '@/components/layout/OperatorSidebar'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Operator Dashboard | PACS Banking',
  description: 'Operator dashboard for PACS Banking system',
}

export default function OperatorLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <RoleGuard requiredRoles={['Operator']}>
      <div className="flex h-screen bg-background">
        <OperatorSidebar />
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
