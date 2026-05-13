import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // =========================
    // AUTH
    // =========================
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(session.value)

    // =========================
    // INPUT
    // =========================
    const formData = await request.formData()

    const file = formData.get('file') as File
    const moduleId = formData.get('moduleId') as string
    const schemeId = formData.get('schemeId') as string

    if (!file || !schemeId) {
      return NextResponse.json({
        success: false,
        message: 'Missing fields',
      })
    }

    // =========================
    // READ EXCEL
    // =========================
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows.length) {
      return NextResponse.json({
        success: false,
        message: 'Empty file',
      })
    }

    // =========================
    // SCHEMA
    // =========================
    const { data: schema } = await supabase
      .from('dynamic_schemas')
      .select('*')
      .eq('scheme_id', schemeId)

    if (!schema?.length) {
      return NextResponse.json({
        success: false,
        message: 'Schema missing',
      })
    }

    // add system columns
    const enrichedSchema = [
      { column_name: 'branch_id', data_type: 'text', is_required: true },
      { column_name: 'branch_name', data_type: 'text', is_required: true },
      ...schema,
    ]
   
    // =========================
    // VALIDATION RULES
    // =========================
    const { data: validationRules } = await supabase
      .from('validation_rules')
      .select('*')
      .eq('scheme_id', schemeId)

    const rulesMap: Record<string, any[]> = {}

    for (const r of validationRules || []) {
      if (!rulesMap[r.column_name]) rulesMap[r.column_name] = []
      rulesMap[r.column_name].push(r)
    }

    // =========================
    // TABLE NAME
    // =========================
    const { data: scheme } = await supabase
      .from('schemes')
      .select('name')
      .eq('id', schemeId)
      .single()

    const tableName = scheme!.name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .replace(/\s+/g, '_')

    // =========================
    // PROCESS ROWS
    // =========================
    const validData: any[] = []
    const errors: any[] = []

    let successRows = 0
    let failedRows = 0
    let uploadedBranchId = ''

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      const branchCode = row.branch_id
      uploadedBranchId = branchCode
      const branchName = row.branch_name

      // =========================
      // VALIDATE BRANCH
      // =========================
      const { data: branch } = await supabase
        .from('branches')
        .select('code, name')
        .eq('code', branchCode)
        .eq('name', branchName)
        .single()

      if (!branch) {
        errors.push({
          row_number: i + 2,
          column_name: 'branch_id',
          error_message: 'Invalid branch code or name',
        })
        failedRows++
        continue
      }

      const cleanRow: any = {
        branch_id: branchCode,
        branch_name: branchName,
      }

      let isValid = true

      // =========================
      // FIELD VALIDATION
      // =========================
      for (const col of enrichedSchema) {
        const key = col.column_name

        if (['branch_id', 'branch_name'].includes(key)) continue

        let value = row[key]
        

        // EMPTY → NULL
        if (value === '' || value === null || value === undefined) {
          cleanRow[col.column_name] = null

          if (col.is_required) {
            isValid = false
            errors.push({
              row_number: i + 2,
              column_name: col.column_name,
              error_message: 'Required field missing',
            })
          }

          continue
        }

        // TRIM
        if (typeof value === 'string') value = value.trim()

        // DATE
         // DATE
          if (col.data_type === 'date') {

                // EXCEL SERIAL DATE
                if (!isNaN(value)) {

                  const num = Number(value)

                  if (num > 10000 && num < 60000) {

                    const excelDate = new Date(
                      (num - 25569) * 86400 * 1000
                    )

                    const yyyy = excelDate.getUTCFullYear()
                    const mm = String(
                      excelDate.getUTCMonth() + 1
                    ).padStart(2, '0')

                    const dd = String(
                      excelDate.getUTCDate()
                    ).padStart(2, '0')

                    value = `${yyyy}-${mm}-${dd}`

                    cleanRow[col.column_name] = value

                    continue
                  }
                }

                // NORMAL DATE STRING
                const parsed = new Date(value)

                if (isNaN(parsed.getTime())) {

                  isValid = false

                  errors.push({
                    row_number: i + 2,
                    column_name: col.column_name,
                    error_message: 'Invalid date',
                  })

                  continue
                }

                const yyyy = parsed.getFullYear()

                const mm = String(
                  parsed.getMonth() + 1
                ).padStart(2, '0')

                const dd = String(
                  parsed.getDate()
                ).padStart(2, '0')

                value = `${yyyy}-${mm}-${dd}`
              }

        // NUMBER
        if (col.data_type === 'number') {
          if (isNaN(Number(value))) {
            isValid = false
            errors.push({
              row_number: i + 2,
              column_name: col.column_name,
              error_message: 'Invalid number',
            })
            continue
          }

          value = Number(value)
        }

        cleanRow[col.column_name] = value
        const rules =
  validationRules?.filter(
    (r: any) => r.column_name === col.column_name
  ) || []

for (const rule of rules) {

  // REQUIRED
  if (
    rule.rule_type === 'required' &&
    (value === '' || value === null)
  ) {
    isValid = false

    errors.push({
      row_number: i + 2,
      column_name: col.column_name,
      error_message:
        rule.error_message || 'Required',
    })
  }

  // MINIMUM
  if (
    rule.rule_type === 'min' &&
    Number(value) < Number(rule.rule_value)
  ) {
    isValid = false

    errors.push({
      row_number: i + 2,
      column_name: col.column_name,
      error_message:
        rule.error_message ||
        `Minimum ${rule.rule_value}`,
    })
  }

  // MAXIMUM
  if (
    rule.rule_type === 'max' &&
    Number(value) > Number(rule.rule_value)
  ) {
    isValid = false

    errors.push({
      row_number: i + 2,
      column_name: col.column_name,
      error_message:
        rule.error_message ||
        `Maximum ${rule.rule_value}`,
    })
  }

  // EMAIL
  if (rule.rule_type === 'email') {
    const regex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!regex.test(String(value))) {
      isValid = false

      errors.push({
        row_number: i + 2,
        column_name: col.column_name,
        error_message:
          rule.error_message ||
          'Invalid email',
      })
    }
  }
  if (rule.rule_type === 'unique') {

  const exists = validData.some(
    (d) =>
      d[col.column_name] === value
  )

  if (exists) {
    isValid = false

    errors.push({
      row_number: i + 2,
      column_name: col.column_name,
      error_message:
        rule.error_message ||
        'Duplicate value',
    })
  }
}
if (rule.rule_type === 'numeric') {

  if (isNaN(Number(value))) {
    isValid = false

    errors.push({
      row_number: i + 2,
      column_name: col.column_name,
      error_message:
        rule.error_message ||
        'Must be numeric',
    })
  }
}
if (rule.rule_type === 'length') {

  if (
    String(value).length !== Number(rule.rule_value)
  ) {
    isValid = false

    errors.push({
      row_number: i + 2,
      column_name: col.column_name,
      error_message:
        rule.error_message ||
        `Length must be ${rule.rule_value}`,
    })
  }
}
}
      }

      if (isValid) {
        validData.push(cleanRow)
        successRows++
      } else {
        failedRows++
      }
    }

    // =========================
    // INSERT MAIN DATA
    // =========================
    // 🟢 INSERT DATA
    if (validData.length > 0) {
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(validData)

      if (insertError) {
        return NextResponse.json({
          success: false,
          message: insertError.message,
        })
      }
    }

    // 🟢 STATUS
    let status = 'success'
    if (failedRows === 0) status = 'success'
    else if (successRows > 0) status = 'partial'
    else status = 'failed'
   const { data: dbUser } = await supabase
     .from('users')
     .select('id, username')
     .eq('id', user.id)
     .single()

   console.log(dbUser?.id)
    // =========================
    // INSERT UPLOAD LOG
    // =========================
    const { data: uploadRecord, error: uploadError } = await supabase
          .from('uploads')
          .insert([
            {
              user_id: dbUser?.id || user.id,
              username: dbUser?.username || 'admin',
              branch_id: uploadedBranchId,
              module_id: moduleId,
              scheme_id: schemeId,
              file_name: file.name,
              file_size: file.size,
              total_rows: rows.length,
              success_rows: successRows,
              failed_rows: failedRows,
              status,
            },
          ])
          .select()
          .single()
    
          console.log('UPLOAD ERROR:', uploadError)
        // 🟢 SAVE ERRORS
        if (errors.length > 0 && uploadRecord) {
          const errorData = errors.map((e) => ({
            upload_id: uploadRecord.id,
            row_number: e.row_number,
            column_name: e.column_name,
            error_message: e.error_message,
          }))
    
          await supabase.from('upload_errors').insert(errorData)
        }
    
        // 🟢 ERROR EXCEL
        let errorFile = null
    
        if (errors.length > 0) {
          const ws = XLSX.utils.json_to_sheet(errors)
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Errors')
    
          const buffer = XLSX.write(wb, {
            type: 'buffer',
            bookType: 'xlsx',
          })
    
          errorFile = buffer.toString('base64')
        }
    
        return NextResponse.json({
          success: true,
          data: {
            totalRows: rows.length,
            successRows,
            failedRows,
            status,
          },
          errorFile,
        })
      } catch (err) {
        console.error(err)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    })
  }
}
