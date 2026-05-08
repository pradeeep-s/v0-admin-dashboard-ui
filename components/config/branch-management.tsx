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

interface Branch {
  id: string
  name: string
  code: string
  location: string
  is_active: boolean
}

interface BranchManagementProps {
  branches: Branch[]
  onAdd: (branch: Branch) => void
  onEdit: (branch: Branch) => void
  onDelete: (id: string) => void
}

export function BranchManagement({
  branches,
  onAdd,
  onEdit,
  onDelete,
}: BranchManagementProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    is_active: true,
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.location) {
      alert('Name, Code and Location are required')
      return
    }

    const newBranch: Branch = {
      id: editingId || crypto.randomUUID(),
      ...formData,
    }

    if (editingId) {
      onEdit(newBranch)
    } else {
      onAdd(newBranch)
    }

    // reset
    setFormData({
      name: '',
      code: '',
      location: '',
      is_active: true,
    })
    setEditingId(null)
    setOpen(false)
  }

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      code: branch.code,
      location: branch.location,
      is_active: branch.is_active,
    })
    setEditingId(branch.id)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Branch' : 'Add New Branch'}
            </DialogTitle>
            <DialogDescription>
              Configure branch details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <TextField
              label="Branch Name"
              placeholder="e.g., Erode Branch"
              value={formData.name}
              onChange={(value) =>
                setFormData({ ...formData, name: value })
              }
              required
            />

            <TextField
              label="Branch Code"
              placeholder="e.g., ERD"
              value={formData.code}
              onChange={(value) =>
                setFormData({ ...formData, code: value })
              }
              required
            />

            <TextField
              label="Location"
              placeholder="e.g., Erode"
              value={formData.location}
              onChange={(value) =>
                setFormData({ ...formData, location: value })
              }
              required
            />

            <CheckboxField
              label="Active"
              checked={formData.is_active}
              onChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />

            <Button onClick={handleSubmit} className="w-full">
              {editingId ? 'Update Branch' : 'Add Branch'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {branches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No branches configured yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        {branch.name}
                      </TableCell>

                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {branch.code}
                        </code>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm">
                        {branch.location}
                      </TableCell>

                      <TableCell>
                        {branch.is_active ? (
                          <div className="flex items-center gap-1 text-green-600">
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
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(branch.id)}
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