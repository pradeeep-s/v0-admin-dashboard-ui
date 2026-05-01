'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FormSkeleton } from '@/components/common/loading-skeleton'
import { ModuleManagement } from '@/components/config/module-management'
import { SchemeManagement } from '@/components/config/scheme-management'
import { BranchManagement } from '@/components/config/branch-management'
import { ColumnMappingComponent } from '@/components/config/column-mapping'
import { ValidationRulesComponent } from '@/components/config/validation-rules'
import { Module, Scheme, ColumnMapping, ValidationRule } from '@/lib/types'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Settings, Grid3x3, CheckSquare } from 'lucide-react'
import { mockModules, mockSchemes, mockColumnMappings, mockValidationRules } from '@/lib/mock-data'

export default function ConfigPage() {
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<Module[]>([])
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [newRule, setNewRule] = useState<Partial<ValidationRule>>({
    columnName: '',
    ruleType: 'required',
    ruleValue: '',
    errorMessage: '',
  })
  const [selectedScheme, setSelectedScheme] = useState<string>('')

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        // In a real app, these would come from API calls
        setModules(mockModules)
        await loadModules()
        await loadSchemes()
        await loadValidationRules()
      } catch (error) {
        console.error('Error loading configuration:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const loadModules = async () => {
  const res = await fetch('/api/modules')
  const json = await res.json()

  if (json.success) {
    setModules(
      json.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        code: m.code,
        description: m.description,
        isActive: m.is_active,
      }))
    )
  }
} 
const loadSchemes = async () => {
  const res = await fetch('/api/schemes')
  const json = await res.json()

  if (json.success) {
    setSchemes(
      json.data.map((s: any) => ({
        id: s.id,
        moduleId: s.module_id,
        name: s.name,
        code: s.code,
        description: s.description,
        isActive: s.is_active,
      }))
    )
  }
}

const loadValidationRules = async () => {
  try {
    const res = await fetch('/api/validation-rules')

    const json = await res.json()

    console.log(json)

    if (json.success) {
      setValidationRules(json.data)
    }
  } catch (err) {
    console.error(err)
  }
}
  useEffect(() => {
  const loadBranches = async () => {
    const res = await fetch('/api/branches')
    const json = await res.json()
    setBranches(json.data || [])
  }

  loadBranches()
}, [])
const handleAddBranch = async (branch: any) => {
  const res = await fetch('/api/branches', {
    method: 'POST',
    body: JSON.stringify(branch),
  })

  const json = await res.json()

  if (json.data) {
    setBranches([json.data, ...branches])
  }
}
const handleEditBranch = async (branch: { id: any }) => {
  const res = await fetch(`/api/branches/${branch.id}`, {
    method: 'PUT',
    body: JSON.stringify(branch),
  })

  const json = await res.json()

  if (json.data) {
    setBranches(branches.map(b => b.id === branch.id ? json.data : b))
  }
}
const handleDeleteBranch = async (id: any) => {
  await fetch(`/api/branches/${id}`, {
    method: 'DELETE',
  })

  setBranches(branches.filter(b => b.id !== id))
}

  const handleAddModule = async (module: any) => {
  const res = await fetch('/api/modules', {
    method: 'POST',
    body: JSON.stringify(module),
  })

  const json = await res.json()

  if (json.success) {
    setModules([...modules, {
      ...json.data,
      isActive: json.data.is_active,
    }])
  }
}

  const handleEditModule = async (module: any) => {
  const res = await fetch(`/api/modules/${module.id}`, {
    method: 'PUT',
    body: JSON.stringify(module),
  })

  const json = await res.json()

  if (json.success) {
    setModules(
      modules.map((m) =>
        m.id === module.id ? module : m
      )
    )
  }
}

const handleDeleteModule = async (id: string) => {
  await fetch(`/api/modules/${id}`, {
    method: 'DELETE',
  })

  await loadModules() // Refresh modules list after deletion
}

  const handleAddScheme = async (scheme: Scheme) => {
  const res = await fetch('/api/schemes', {
    method: 'POST',
    body: JSON.stringify({
      moduleId: scheme.moduleId,
      name: scheme.name,
      code: scheme.code,
      description: scheme.description,
    }),
  })

  const json = await res.json()

  if (json.success) {
    setSchemes([...schemes, {
      ...json.data,
      moduleId: json.data.module_id,
      isActive: json.data.is_active,
    }])
  }
}

  const handleEditScheme = async (scheme: Scheme) => {
  const res = await fetch(`/api/schemes/${scheme.id}`, {
    method: 'PUT',
    body: JSON.stringify(scheme),
  })

  const json = await res.json()

  if (json.success) {
    setSchemes(
      schemes.map((s) =>
        s.id === scheme.id ? { ...scheme } : s
      )
    )
  }
}

  const handleDeleteScheme = async (id: string) => {
  await fetch(`/api/schemes/${id}`, {
    method: 'DELETE',
  })

  setSchemes(schemes.filter((s) => s.id !== id))
}

const handleAddRule = async () => {
  if (!newRule.columnName || !newRule.errorMessage || !selectedScheme) {
    alert('Please fill all required fields')
    return
  }

  const res = await fetch('/api/validation-rules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schemeId: selectedScheme,
      columnName: newRule.columnName,
      ruleType: newRule.ruleType,
      ruleValue: newRule.ruleValue,
      errorMessage: newRule.errorMessage,
    }),
  })

  const json = await res.json()

  if (!json.success) {
    alert(json.message)
    return
  }

  setValidationRules([...validationRules, json.data])

  setNewRule({
    columnName: '',
    ruleType: 'required',
    ruleValue: '',
    errorMessage: '',
  })
}
const handleRemoveRule = async (id: string) => {
  await fetch(`/api/validation-rules/${id}`, {
    method: 'DELETE',
  })

  setValidationRules(
    validationRules.filter((r) => r.id !== id)
  )
}

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Configuration
          </h1>
          <FormSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage modules, schemes, column mappings, and validation rules
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="modules" className="w-full">
          <Card>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 rounded-b-none border-b">
              <TabsTrigger value="branches" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Branches</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Modules</span>
              </TabsTrigger>
              <TabsTrigger value="schemes" className="gap-2">
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">Schemes</span>
              </TabsTrigger>
              <TabsTrigger value="mappings" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Mappings</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Rules</span>
              </TabsTrigger>
            </TabsList>
          </Card>

          {/* Module Management Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Module Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Create and manage data processing modules
              </p>
            </div>
            <ModuleManagement
              modules={modules}
              onAdd={handleAddModule}
              onEdit={handleEditModule}
              onDelete={handleDeleteModule}
            />
          </TabsContent>
           {/* Branch Management Tab */}
          <TabsContent value="branches" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Branch Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Create and manage data processing branches
              </p>
            </div>
            <BranchManagement
              branches={branches}
              onAdd={handleAddBranch}
              onEdit={handleEditBranch}
              onDelete={handleDeleteBranch}
            />
          </TabsContent>

          {/* Scheme Management Tab */}
          <TabsContent value="schemes" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Scheme Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Create and manage schemes under modules
              </p>
            </div>
            <SchemeManagement
              modules={modules}
              schemes={schemes}
              onAdd={handleAddScheme}
              onEdit={handleEditScheme}
              onDelete={handleDeleteScheme}
            />
          </TabsContent>

          {/* Column Mapping Tab */}
          <TabsContent value="mappings" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Column Mapping Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Map Excel columns to database columns for each scheme
              </p>
            </div>
            <ColumnMappingComponent
              schemes={schemes}
              mappings={columnMappings}
              onMappingsChange={setColumnMappings}
            />
          </TabsContent>

          {/* Validation Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Validation Rules Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Define validation rules for data columns
              </p>
            </div>
            <ValidationRulesComponent
              schemes={schemes}
              rules={validationRules}
              onRulesChange={setValidationRules}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
