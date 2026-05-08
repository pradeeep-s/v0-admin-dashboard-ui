'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SelectField, TextField, CheckboxField } from '@/components/common/form-field'
import { ColumnMapping, Scheme } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'

interface ColumnMappingProps {
  schemes: Scheme[]
  mappings: ColumnMapping[]
  onMappingsChange: (mappings: ColumnMapping[]) => void
}

const DATA_TYPES = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Boolean', value: 'boolean' },
]



export function ColumnMappingComponent({
  schemes,
  mappings,
  onMappingsChange,
}: ColumnMappingProps) {
  const [selectedScheme, setSelectedScheme] = useState('')
  const [newMapping, setNewMapping] = useState({
    databaseColumn: '',
    dataType: 'string' as const,
    isRequired: false,
  })

  const schemeMappings = selectedScheme
    ? mappings.filter((m) => m.schemeId === selectedScheme)
    : []

    useEffect(() => {
  if (!selectedScheme) return

  const loadSchema = async () => {
    const res = await fetch(`/api/schema/get?schemeId=${selectedScheme}`)
    const json = await res.json()

    if (json.success) {
      const formatted = json.data.map((col: any) => ({
        id: `${col.scheme_id}-${col.column_name}`,
        schemeId: col.scheme_id,
        databaseColumn: col.column_name,
        dataType: col.data_type,
        isRequired: col.is_required,
      }))

      onMappingsChange(formatted)
    }
  }

  loadSchema()
}, [selectedScheme])

  const handleAddMapping = () => {
    if (!newMapping.databaseColumn || !selectedScheme) {
      alert('Please fill all required fields')
      return
    }

    const mapping: ColumnMapping = {
      id: `COL-${Date.now()}`,
      schemeId: selectedScheme,
      ...newMapping,
      
    }

    onMappingsChange([...mappings, mapping])
    setNewMapping({
      databaseColumn: '',
      dataType: 'string',
      isRequired: false,
    })
  }

  const handleRemoveMapping = (id: string) => {
    onMappingsChange(mappings.filter((m) => m.id !== id))
  }

  const schemeOptions = schemes.map((s) => ({
    label: s.name,
    value: s.id,
  }))

  const excelColumns = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  ).map((col) => ({
    label: `Column ${col}`,
    value: col,
  }))

  return (
    <div className="space-y-6">
      {/* Scheme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Scheme</CardTitle>
          <CardDescription>
            Choose a scheme to configure column mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectField
            label="Scheme"
            value={selectedScheme}
            onChange={setSelectedScheme}
            options={[{ label: 'Select a scheme...', value: '' }, ...schemeOptions]}
            required
          />
        </CardContent>
      </Card>

      {/* Mappings Configuration */}
      {selectedScheme && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mappings</CardTitle>
            <CardDescription>
              Map Excel columns to database columns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Mapping */}
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <h4 className="font-medium">Add New Mapping</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                <TextField
                  label="Database Column"
                  placeholder="e.g., member_id"
                  value={newMapping.databaseColumn}
                  onChange={(value) =>
                    setNewMapping({
                      ...newMapping,
                      databaseColumn: value,
                    })
                  }
                  required
                />
                <SelectField
                  label="Data Type"
                  value={newMapping.dataType}
                  onChange={(value) =>
                    setNewMapping({
                      ...newMapping,
                      dataType: value as any,
                    })
                  }
                  options={DATA_TYPES}
                />
                <div className="pt-8">
                  <CheckboxField
                    label="Required"
                    checked={newMapping.isRequired}
                    onChange={(checked) =>
                      setNewMapping({
                        ...newMapping,
                        isRequired: checked,
                      })
                    }
                  />
                </div>
                <div className="pt-6">
                  <Button
                    onClick={handleAddMapping}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing Mappings */}
            {schemeMappings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      
                      <TableHead>Database Column</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schemeMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {mapping.databaseColumn}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {mapping.dataType}
                        </TableCell>
                        <TableCell>
                          {mapping.isRequired ? (
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                              Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMapping(mapping.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex gap-2 mt-4">
                <Button className='mt-4 bg-blue-600 hover:bg-blue-700 text-white'
              onClick={async () => {
                await fetch('/api/schema/save', {
                  method: 'POST',
                  body: JSON.stringify({
                    schemeId: selectedScheme,
                    columns: schemeMappings,
                  }),
                })

                alert('Schema saved')
              }}
            >
              Save Schema
            </Button>
            </div>
            <div className="flex gap-2">
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={async () => {
                await fetch('/api/schema/create-table', {
                  method: 'POST',
                  body: JSON.stringify({
                    schemeId: selectedScheme,
                  }),
                })

                alert('Table created successfully')
              }}
            >
              Create Table
            </Button>
            </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No column mappings configured yet
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
