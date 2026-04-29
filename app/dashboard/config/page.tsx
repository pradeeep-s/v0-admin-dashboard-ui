'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FormSkeleton } from '@/components/common/loading-skeleton'
import { ModuleManagement } from '@/components/config/module-management'
import { SchemeManagement } from '@/components/config/scheme-management'
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

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        // In a real app, these would come from API calls
        setModules(mockModules)
        setSchemes(mockSchemes)
        setColumnMappings(mockColumnMappings)
        setValidationRules(mockValidationRules)
      } catch (error) {
        console.error('Error loading configuration:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleAddModule = (module: Module) => {
    setModules([...modules, module])
  }

  const handleEditModule = (module: Module) => {
    setModules(modules.map((m) => (m.id === module.id ? module : m)))
  }

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id))
  }

  const handleAddScheme = (scheme: Scheme) => {
    setSchemes([...schemes, scheme])
  }

  const handleEditScheme = (scheme: Scheme) => {
    setSchemes(schemes.map((s) => (s.id === scheme.id ? scheme : s)))
  }

  const handleDeleteScheme = (id: string) => {
    setSchemes(schemes.filter((s) => s.id !== id))
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-b-none border-b">
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
