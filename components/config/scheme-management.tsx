'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Module, Scheme } from '@/lib/types'
import { Edit, Trash2, Plus, CheckCircle, Circle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SelectField, TextField, CheckboxField } from '@/components/common/form-field'

interface SchemeManagementProps {
  modules: Module[]
  schemes: Scheme[]
  onAdd: (scheme: Scheme) => void
  onEdit: (scheme: Scheme) => void
  onDelete: (id: string) => void
}

export function SchemeManagement({
  modules,
  schemes,
  onAdd,
  onEdit,
  onDelete,
}: SchemeManagementProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    moduleId: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const handleSubmit = () => {
    if (!formData.moduleId || !formData.name || !formData.code) {
      alert('Module, Name and Code are required')
      return
    }

    const newScheme: Scheme = {
      id: editingId || `SCH-${Date.now()}`,
      ...formData,
    }

    if (editingId) {
      onEdit(newScheme)
    } else {
      onAdd(newScheme)
    }

    setFormData({
      moduleId: '',
      name: '',
      code: '',
      description: '',
      isActive: true,
    })
    setEditingId(null)
    setOpen(false)
  }

  const handleEdit = (scheme: Scheme) => {
    setFormData({
      moduleId: scheme.moduleId,
      name: scheme.name,
      code: scheme.code,
      description: scheme.description,
      isActive: scheme.isActive,
    })
    setEditingId(scheme.id)
    setOpen(true)
  }

  const moduleOptions = modules.map((m) => ({
    label: m.name,
    value: m.id,
  }))

  const getModuleName = (moduleId: string) => {
    return modules.find((m) => m.id === moduleId)?.name || '—'
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Scheme
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Scheme' : 'Add New Scheme'}
            </DialogTitle>
            <DialogDescription>
              Configure scheme details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SelectField
              label="Module"
              value={formData.moduleId}
              onChange={(value) =>
                setFormData({ ...formData, moduleId: value })
              }
              options={moduleOptions}
              required
            />
            <TextField
              label="Name"
              placeholder="e.g., Regular Membership"
              value={formData.name}
              onChange={(value) =>
                setFormData({ ...formData, name: value })
              }
              required
            />
            <TextField
              label="Code"
              placeholder="e.g., MEM-REG"
              value={formData.code}
              onChange={(value) =>
                setFormData({ ...formData, code: value })
              }
              required
            />
            <TextField
              label="Description"
              placeholder="Scheme description..."
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
            />
            <CheckboxField
              label="Active"
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Button onClick={handleSubmit} className="w-full">
              {editingId ? 'Update Scheme' : 'Add Scheme'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="pt-6">
          {schemes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No schemes configured yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schemes.map((scheme) => (
                    <TableRow key={scheme.id}>
                      <TableCell className="font-medium">
                        {scheme.name}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {scheme.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getModuleName(scheme.moduleId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {scheme.description}
                      </TableCell>
                      <TableCell>
                        {scheme.isActive ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Circle className="w-4 h-4" />
                            Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(scheme)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(scheme.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
