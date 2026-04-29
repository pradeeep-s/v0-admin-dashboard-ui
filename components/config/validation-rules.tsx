'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SelectField, TextField } from '@/components/common/form-field'
import { ValidationRule, Scheme } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'

interface ValidationRulesProps {
  schemes: Scheme[]
  rules: ValidationRule[]
  onRulesChange: (rules: ValidationRule[]) => void
}

const RULE_TYPES = [
  { label: 'Required', value: 'required' },
  { label: 'Minimum', value: 'min' },
  { label: 'Maximum', value: 'max' },
  { label: 'Pattern/Regex', value: 'regex' },
  { label: 'Unique', value: 'unique' },
  { label: 'Email', value: 'email' },
  { label: 'Numeric', value: 'numeric' },
]

export function ValidationRulesComponent({
  schemes,
  rules,
  onRulesChange,
}: ValidationRulesProps) {
  const [selectedScheme, setSelectedScheme] = useState('')
  const [newRule, setNewRule] = useState({
    columnName: '',
    ruleType: 'required' as const,
    ruleValue: '',
    errorMessage: '',
  })

  const schemeRules = selectedScheme
    ? rules.filter((r) => r.schemeId === selectedScheme)
    : []

  const handleAddRule = () => {
    if (!newRule.columnName || !newRule.errorMessage || !selectedScheme) {
      alert('Please fill all required fields')
      return
    }

    const rule: ValidationRule = {
      id: `VAL-${Date.now()}`,
      schemeId: selectedScheme,
      columnName: newRule.columnName,
      ruleType: newRule.ruleType,
      ruleValue: newRule.ruleValue || undefined,
      errorMessage: newRule.errorMessage,
    }

    onRulesChange([...rules, rule])
    setNewRule({
      columnName: '',
      ruleType: 'required',
      ruleValue: '',
      errorMessage: '',
    })
  }

  const handleRemoveRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id))
  }

  const schemeOptions = schemes.map((s) => ({
    label: s.name,
    value: s.id,
  }))

  return (
    <div className="space-y-6">
      {/* Scheme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Scheme</CardTitle>
          <CardDescription>
            Choose a scheme to configure validation rules
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

      {/* Rules Configuration */}
      {selectedScheme && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Rules</CardTitle>
            <CardDescription>
              Define validation rules for columns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Rule */}
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <h4 className="font-medium">Add New Rule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Column Name"
                  placeholder="e.g., email"
                  value={newRule.columnName}
                  onChange={(value) =>
                    setNewRule({ ...newRule, columnName: value })
                  }
                  required
                />
                <SelectField
                  label="Rule Type"
                  value={newRule.ruleType}
                  onChange={(value) =>
                    setNewRule({
                      ...newRule,
                      ruleType: value as any,
                    })
                  }
                  options={RULE_TYPES}
                />
              </div>

              {/* Conditional Rule Value Input */}
              {['min', 'max', 'regex'].includes(newRule.ruleType) && (
                <TextField
                  label={
                    newRule.ruleType === 'min'
                      ? 'Minimum Value'
                      : newRule.ruleType === 'max'
                        ? 'Maximum Value'
                        : 'Regex Pattern'
                  }
                  placeholder={
                    newRule.ruleType === 'regex'
                      ? 'e.g., ^[0-9]{10}$'
                      : 'e.g., 100'
                  }
                  value={newRule.ruleValue}
                  onChange={(value) =>
                    setNewRule({ ...newRule, ruleValue: value })
                  }
                />
              )}

              <TextField
                label="Error Message"
                placeholder="User-friendly error message"
                value={newRule.errorMessage}
                onChange={(value) =>
                  setNewRule({ ...newRule, errorMessage: value })
                }
                required
              />

              <Button
                onClick={handleAddRule}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>

            {/* Existing Rules */}
            {schemeRules.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Rule Type</TableHead>
                      <TableHead>Rule Value</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schemeRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {rule.columnName}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                            {rule.ruleType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rule.ruleValue || '—'}
                        </TableCell>
                        <TableCell className="max-w-xs text-sm">
                          {rule.errorMessage}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No validation rules configured yet
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
