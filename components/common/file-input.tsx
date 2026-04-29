'use client'

import { useRef, useState } from 'react'
import { Upload, X, File } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileInputProps {
  onChange: (file: File | null) => void
  accept?: string
  value?: File | null
  disabled?: boolean
}

export function FileInput({
  onChange,
  accept = '.xlsx',
  value,
  disabled = false,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onChange(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onChange(files[0])
    }
  }

  const handleClear = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {value ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <File className="w-12 h-12 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{value.name}</p>
              <p className="text-sm text-muted-foreground">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported format: {accept.replace('.', '')}
            </p>
          </div>
        )}
      </div>

      {value && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="mt-3 w-full"
          disabled={disabled}
        >
          <X className="w-4 h-4 mr-2" />
          Clear Selection
        </Button>
      )}
    </div>
  )
}
