'use client'

import { useState, useEffect } from 'react'
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
import { Module } from '@/lib/types'
import { Edit, Trash2, Plus, CheckCircle, Circle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TextField, CheckboxField } from '@/components/common/form-field'

interface ModuleManagementProps {
  modules: Module[]
  onAdd: (module: Module) => void
  onEdit: (module: Module) => void
  onDelete: (id: string) => void
}

export function ModuleManagement({
  modules,
  onAdd,
  onEdit,
  onDelete,
}: ModuleManagementProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      alert('Name and Code are required')
      return
    }

    const newModule: Module = {
      id: editingId || `MOD-${Date.now()}`,
      ...formData,
    }

    if (editingId) {
      onEdit(newModule)
    } else {
      onAdd(newModule)
    }

    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    })
    setEditingId(null)
    setOpen(false)
  }

  const handleEdit = (module: Module) => {
    setFormData({
      name: module.name,
      code: module.code,
      description: module.description,
      isActive: module.isActive,
    })
    setEditingId(module.id)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Module' : 'Add New Module'}
            </DialogTitle>
            <DialogDescription>
              Configure module details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <TextField
              label="Name"
              placeholder="e.g., Members"
              value={formData.name}
              onChange={(value) =>
                setFormData({ ...formData, name: value })
              }
              required
            />
            <TextField
              label="Code"
              placeholder="e.g., MEM"
              value={formData.code}
              onChange={(value) =>
                setFormData({ ...formData, code: value })
              }
              required
            />
            <TextField
              label="Description"
              placeholder="Module description..."
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
              {editingId ? 'Update Module' : 'Add Module'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="pt-6">
          {modules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No modules configured yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">
                        {module.name}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {module.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {module.description}
                      </TableCell>
                      <TableCell>
                        {module.isActive ? (
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
                            onClick={() => handleEdit(module)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(module.id)}
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
