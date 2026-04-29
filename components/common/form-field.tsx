'use client'

import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FieldLabel, FieldDescription } from '@/components/ui/field'

interface FormFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({
  label,
  description,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      {description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      {children}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  error?: string
  required?: boolean
  description?: string
  disabled?: boolean
}

export function SelectField({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  required,
  description,
  disabled,
}: SelectFieldProps) {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}

interface TextFieldProps {
  label: string
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  description?: string
  disabled?: boolean
  type?: string
}

export function TextField({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  description,
  disabled,
  type = 'text',
}: TextFieldProps) {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <InputGroup>
        <InputGroupInput
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={error ? 'border-destructive' : ''}
        />
      </InputGroup>
    </FormField>
  )
}

interface CheckboxFieldProps {
  label: string
  checked?: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}

export function CheckboxField({
  label,
  checked,
  onChange,
  description,
  disabled,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <div>
        <Label htmlFor={label} className="font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
