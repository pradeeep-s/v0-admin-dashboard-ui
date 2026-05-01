'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function TemplatePage() {
  const [scheme, setScheme] = useState('')
  const [schemes, setSchemes] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/schema') // create this if not exists
      .then(res => res.json())
      .then(data => setSchemes(data || []))
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">

        {/* Dropdown */}
        <select
          className="border px-3 py-2 rounded"
          value={scheme}
          onChange={(e) => setScheme(e.target.value)}
        >
          <option value="">Select Scheme</option>

          {schemes.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
</div>
        <div className="p-6 space-y-4">
        {/* Button */}
        <Button
          disabled={!scheme}
          onClick={() => {
            window.open(`/api/template/download?schemeId=${scheme}`)
          }}
        >
          Download Template
        </Button>

      </div>
    </DashboardLayout>
  )
}