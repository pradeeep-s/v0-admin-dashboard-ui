// Branch Types
export interface Branch {
  id: string
  name: string
  code: string
  location: string
  isActive: boolean
}

// Module Types
export interface Module {
  id: string
  name: string
  code: string
  description: string
  isActive: boolean
}

// Scheme Types
export interface Scheme {
  id: string
  moduleId: string
  name: string
  code: string
  description: string
  isActive: boolean
}

// Column Mapping Types
export interface ColumnMapping {
  id: string
  schemeId: string
  excelColumn: string
  databaseColumn: string
  dataType: 'string' | 'number' | 'date' | 'boolean'
  isRequired: boolean
}

// Validation Rule Types
export type RuleType = 'required' | 'min' | 'max' | 'regex' | 'unique' | 'email' | 'numeric'

export interface ValidationRule {
  id: string
  schemeId: string
  columnName: string
  ruleType: RuleType
  ruleValue?: string | number
  errorMessage: string
}

// Upload Types
export type UploadStatus = 'success' | 'partial' | 'failed' | 'pending'

export interface UploadResult {
  id: string
  branchId: string
  branchName: string
  moduleId: string
  moduleName: string
  schemeId: string
  schemeName: string
  totalRows: number
  successRows: number
  failedRows: number
  status: UploadStatus
  uploadedAt: string
  fileName: string
  errorCount: number
}

// Error Types
export interface UploadError {
  id: string
  uploadId: string
  rowNumber: number
  columnName: string
  errorMessage: string
  errorType: string
  actualValue?: string
}

// Form Types
export interface UploadFormData {
  branchId: string
  moduleId: string
  schemeId: string
  file: File | null
}

export interface ModuleFormData {
  name: string
  code: string
  description: string
  isActive: boolean
}

export interface SchemeFormData {
  moduleId: string
  name: string
  code: string
  description: string
  isActive: boolean
}

export interface ColumnMappingFormData {
  schemeId: string
  excelColumn: string
  databaseColumn: string
  dataType: 'string' | 'number' | 'date' | 'boolean'
  isRequired: boolean
}

export interface ValidationRuleFormData {
  schemeId: string
  columnName: string
  ruleType: RuleType
  ruleValue?: string | number
  errorMessage: string
}
