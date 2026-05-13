import { ReactNode } from 'react'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { BranchSidebar } from '@/components/layout/BranchSidebar'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Branch Dashboard | PACS Banking',
  description: 'Branch user dashboard for PACS Banking system',
}

export default function BranchLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <RoleGuard requiredRoles={['Branch']}>
      <div className="flex h-screen bg-background">
        <BranchSidebar />
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
