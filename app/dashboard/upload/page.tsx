'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SelectField, TextField } from '@/components/common/form-field'
import { FileInput } from '@/components/common/file-input'
import { ResultCard } from '@/components/common/result-card'
import { Branch, Module, Scheme, UploadResult } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const [formData, setFormData] = useState({
    branchId: '',
    moduleId: '',
    schemeId: '',
    file: null as File | null,
  })

  // Load branches
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [branchesRes, modulesRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/modules'),
        ])

        const branchesData = await branchesRes.json()
        const modulesData = await modulesRes.json()

        setBranches(branchesData.data || [])
        setModules(modulesData.data || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load schemes when module changes
  useEffect(() => {
    const loadSchemes = async () => {
      if (!formData.moduleId) {
        setSchemes([])
        return
      }

      try {
        const res = await fetch(`/api/schemes?moduleId=${formData.moduleId}`)
        const data = await res.json()
        setSchemes(data.data || [])
      } catch (error) {
        console.error('Error loading schemes:', error)
      }
    }

    loadSchemes()
  }, [formData.moduleId])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.branchId || !formData.moduleId || !formData.schemeId || !formData.file) {
      alert('Please fill all required fields')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadResult(null)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + Math.random() * 25
          return next > 90 ? 90 : next
        })
      }, 300)

      const uploadFormData = new FormData()
      uploadFormData.append('file', formData.file)
      uploadFormData.append('branchId', formData.branchId)
      uploadFormData.append('moduleId', formData.moduleId)
      uploadFormData.append('schemeId', formData.schemeId)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await res.json()

      if (data.success) {
        setUploadResult(data.data)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const branchOptions = branches.map((b) => ({
    label: b.name,
    value: b.id,
  }))

  const moduleOptions = modules.map((m) => ({
    label: m.name,
    value: m.id,
  }))

  const schemeOptions = schemes.map((s) => ({
    label: s.name,
    value: s.id,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Data</h1>
          <p className="text-muted-foreground mt-2">
            Upload Excel files for data processing and validation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Data Upload Form</CardTitle>
              <CardDescription>
                Select branch, module, scheme and upload your Excel file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Branch Selection */}
                <SelectField
                  label="Branch"
                  placeholder="Select a branch"
                  value={formData.branchId}
                  onChange={(value) =>
                    setFormData({ ...formData, branchId: value })
                  }
                  options={branchOptions}
                  required
                  disabled={loading}
                />

                {/* Module Selection */}
                <SelectField
                  label="Module"
                  placeholder="Select a module"
                  value={formData.moduleId}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      moduleId: value,
                      schemeId: '',
                    })
                  }
                  options={moduleOptions}
                  required
                  disabled={loading}
                />

                {/* Scheme Selection */}
                <SelectField
                  label="Scheme"
                  placeholder="Select a scheme"
                  value={formData.schemeId}
                  onChange={(value) =>
                    setFormData({ ...formData, schemeId: value })
                  }
                  options={schemeOptions}
                  required
                  disabled={loading || schemes.length === 0}
                />

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Upload File <span className="text-destructive">*</span>
                  </label>
                  <FileInput
                    value={formData.file}
                    onChange={(file) =>
                      setFormData({ ...formData, file })
                    }
                    accept=".xlsx"
                    disabled={uploading}
                  />
                </div>

                {/* Upload Button and Progress */}
                {uploading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      <span className="text-sm font-medium text-foreground">
                        Uploading... {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!formData.branchId || !formData.moduleId || !formData.schemeId || !formData.file}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  File Format
                </h4>
                <p className="text-muted-foreground">
                  Only .xlsx (Excel) files are supported
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  File Size
                </h4>
                <p className="text-muted-foreground">
                  Maximum file size: 50 MB
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Data Validation
                </h4>
                <p className="text-muted-foreground">
                  Files are validated against configured rules and mappings
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Required Fields
                </h4>
                <p className="text-muted-foreground">
                  All marked fields must be present in the Excel file
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Upload Result
            </h2>
            <ResultCard result={uploadResult} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
