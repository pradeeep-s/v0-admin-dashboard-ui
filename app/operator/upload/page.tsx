'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileUp, CheckCircle, AlertCircle, Download } from 'lucide-react'

export default function OperatorUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedModule, setSelectedModule] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Sample modules (would come from API)
  const assignedModules = [
    { id: '1', name: 'Customer Module', code: 'CUSTOMER' },
    { id: '2', name: 'Loan Module', code: 'LOAN' },
    { id: '3', name: 'Savings Module', code: 'SAVINGS' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDownloadTemplate = async () => {
    if (!selectedModule) {
      alert('Please select a module first')
      return
    }
    // TODO: Download template based on selected module
    console.log('Downloading template for module:', selectedModule)
  }

  const handleUpload = async () => {
    if (!file || !selectedModule) {
      alert('Please select both a module and a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('moduleId', selectedModule)

      const response = await fetch('/api/operator/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadStatus('success')
        setFile(null)
        setSelectedModule('')
        // TODO: Redirect to upload history
        setTimeout(() => {
          setUploadStatus('idle')
        }, 3000)
      } else {
        setUploadStatus('error')
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Upload className="w-8 h-8" />
          Upload Data
        </h1>
        <p className="text-muted-foreground mt-1">Upload Excel or CSV files to the system</p>
      </div>

      {uploadStatus === 'success' && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Upload completed successfully!</p>
          </div>
        </Card>
      )}

      {uploadStatus === 'error' && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">Upload failed. Please try again.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Upload form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Upload File</h2>

            {/* Step 1: Select Module */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  1. Select Module
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a module...</option>
                  {assignedModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name} ({module.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedModule && (
              <>
                {/* Step 2: Download Template */}
                <div className="space-y-4 mb-8 p-4 bg-accent rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      2. Download Template (Optional)
                    </label>
                    <Button
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Download the template to see required columns and format
                    </p>
                  </div>
                </div>

                {/* Step 3: Upload File */}
                <div className="space-y-4 p-4 bg-accent rounded-lg">
                  <label className="block text-sm font-medium text-foreground mb-4">
                    3. Upload File
                  </label>

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium text-foreground">
                        {file ? file.name : 'Click to select or drag & drop'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: Excel (.xlsx, .xls), CSV (.csv)
                      </p>
                    </label>
                  </div>

                  {file && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        File selected: <span className="font-medium">{file.name}</span>
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right side - Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Upload Guidelines</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Use the provided template for correct format</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Ensure all required fields are filled</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>File size limit: 10 MB</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Maximum 10,000 rows per upload</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">What Happens Next?</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>File validation</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Data validation against rules</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Duplicate checking</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <span>Data insertion</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">5.</span>
                <span>Error report generation</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
