# Raw PostgreSQL Query Conversion Summary

## Overview
Successfully converted all `let query` statements from Supabase query builder to raw PostgreSQL SQL queries using `lib/db` functions.

## Files Updated (4 routes)

### 1. app/api/history/route.ts
**Before:**
```typescript
let query = supabase
  .from('uploads')
  .select(`...`)
  .order('created_at', { ascending: false })

if (branchId) query = query.eq('branch_id', branchId)
if (moduleId) query = query.eq('module_id', moduleId)

const { data, error } = await query
```

**After:**
```typescript
let sqlQuery = `
  SELECT ... FROM public.uploads u
  LEFT JOIN public.branches b ON u.branch_id = b.id
  LEFT JOIN public.modules m ON u.module_id = m.id
  WHERE 1=1
`
const params: any[] = []

if (branchId) {
  sqlQuery += ` AND u.branch_id = $${paramIndex}`
  params.push(branchId)
}

const data = await queryMany<any>(sqlQuery, params)
```

**Key Changes:**
- Replaced Supabase query builder with raw SQL
- Used LEFT JOINs for related tables
- Dynamic parameter binding with `$1, $2, $3`
- Removed error handling via `error` field
- Changed import to `import { queryMany } from '@/lib/db'`

---

### 2. app/api/schemes/route.ts
**Before:**
```typescript
let query = supabase
  .from('schemes')
  .select('id, module_id, name, code, description, is_active')
  .eq('is_active', true)
  .order('name')

if (moduleId) {
  query = query.eq('module_id', moduleId)
}

const { data, error } = await query
```

**After:**
```typescript
let sqlQuery = 'SELECT id, module_id, name, code, description, is_active FROM public.schemes WHERE is_active = true'
const params: any[] = []

if (moduleId) {
  sqlQuery += ` AND module_id = $1`
  params.push(moduleId)
}

sqlQuery += ` ORDER BY name`

const data = await queryMany<any>(sqlQuery, params.length > 0 ? params : undefined)
```

**Additional Updates:**
- POST: Direct SQL INSERT with `queryOne()` and RETURNING clause
- PUT: Direct SQL UPDATE with `queryOne()` and error handling

---

### 3. app/api/errors/route.ts
**Before:**
```typescript
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

let query = supabase
  .from('upload_errors')
  .select(`id, upload_id, row_number, column_name, ...`)
  .eq('uploads.user_id', user.id)

if (uploadId) query = query.eq('upload_id', uploadId)
if (columnName) query = query.ilike('column_name', `%${columnName}%`)
if (errorType) query = query.eq('error_type', errorType)

const { data, error } = await query
```

**After:**
```typescript
// Session cookie parsing instead of Supabase auth
const cookieHeader = request.headers.get('cookie') || ''
const sessionMatch = cookieHeader.match(/session=([^;]+)/)
const session = JSON.parse(decodeURIComponent(sessionMatch[1]))

let sqlQuery = `
  SELECT ue.id, ue.upload_id, ue.row_number, ue.column_name, ue.error_message, 
         ue.error_type, ue.created_at, u.user_id
  FROM public.upload_errors ue
  JOIN public.uploads u ON ue.upload_id = u.id
  WHERE u.user_id = $1
`
const params: any[] = [session.id]

if (uploadId) {
  sqlQuery += ` AND ue.upload_id = $${paramIndex}`
  params.push(uploadId)
}

if (columnName) {
  sqlQuery += ` AND ue.column_name ILIKE $${paramIndex}`
  params.push(`%${columnName}%`)
}

const data = await queryMany<any>(sqlQuery, params)
```

**Key Changes:**
- Session cookie authentication instead of Supabase Auth
- ILIKE for case-insensitive search (PostgreSQL syntax)
- Dynamic parameterization with proper index increments
- JOIN instead of nested select

---

### 4. app/api/config/route.ts
**GET Section - Before:**
```typescript
if (type === 'column-mappings') {
  let query = supabase
    .from('column_mappings')
    .select('id, scheme_id, excel_column, ...')

  if (schemeId) {
    query = query.eq('scheme_id', schemeId)
  }

  const { data, error } = await query
}
```

**GET Section - After:**
```typescript
if (type === 'column-mappings') {
  let sqlQuery = 'SELECT id, scheme_id, excel_column, database_column, data_type, is_required FROM public.column_mappings'
  const params: any[] = []

  if (schemeId) {
    sqlQuery += ` WHERE scheme_id = $1`
    params.push(schemeId)
  }

  const data = await queryMany<any>(sqlQuery, params.length > 0 ? params : undefined)
}
```

**POST Section - Before:**
```typescript
const { data, error } = await supabase
  .from('column_mappings')
  .insert([{ scheme_id: schemeId, excel_column: excelColumn, ... }])
  .select()
```

**POST Section - After:**
```typescript
const data = await queryOne<any>(
  `INSERT INTO public.column_mappings (scheme_id, excel_column, database_column, data_type, is_required, created_at)
   VALUES ($1, $2, $3, $4, $5, NOW())
   RETURNING id, scheme_id, excel_column, database_column, data_type, is_required`,
  [schemeId, excelColumn, databaseColumn, dataType, isRequired || false]
)
```

**Key Changes:**
- Session cookie auth instead of Supabase Auth
- Raw SQL for both SELECT and INSERT
- RETURNING clause for INSERT operations
- Proper NULL handling with `|| null`
- Error handling via try/catch

---

## Conversion Pattern Summary

### Query Builder Pattern → Raw SQL Pattern

1. **SELECT (queryMany)**
   ```typescript
   // Before: supabase.from('table').select(columns).eq('column', value)
   // After: SELECT columns FROM table WHERE column = $1
   ```

2. **INSERT (queryOne)**
   ```typescript
   // Before: supabase.from('table').insert([...]).select()
   // After: INSERT INTO table (...) VALUES (...) RETURNING *
   ```

3. **UPDATE (queryOne)**
   ```typescript
   // Before: supabase.from('table').update({...}).eq('id', id).select()
   // After: UPDATE table SET ... WHERE id = $1 RETURNING *
   ```

4. **Dynamic WHERE Conditions**
   ```typescript
   // Before: if (id) query = query.eq('id', id)
   // After: 
   // if (id) {
   //   sqlQuery += ` AND id = $${paramIndex}`
   //   params.push(id)
   //   paramIndex++
   // }
   ```

---

## Key Functions Used

### `queryMany<T>(sql, values?): Promise<T[]>`
- For SELECT queries returning multiple rows
- Used in: history, schemes GET, errors, config GET

### `queryOne<T>(sql, values?): Promise<T | undefined>`
- For SELECT/INSERT/UPDATE returning single row
- Used in: schemes POST/PUT, config POST

### Parameter Binding
- Always use `$1, $2, $3` placeholders
- Match parameter count to values array
- Dynamic indexes: `$${paramIndex}` where `paramIndex++`

---

## Verification Results

✅ All `let query` statements converted (4 files)
✅ All imports updated to use `lib/db`
✅ All error logging updated to `[DB]` prefix
✅ All session handling converted to cookie-based
✅ No remaining Supabase query builder usage

---

## Files Converted

1. ✅ `app/api/history/route.ts` - GET with dynamic filters
2. ✅ `app/api/schemes/route.ts` - GET, POST, PUT with SQL
3. ✅ `app/api/errors/route.ts` - GET with complex WHERE
4. ✅ `app/api/config/route.ts` - GET and POST for two types

---

## Next Steps

All remaining routes should follow the same pattern:
1. Replace Supabase query builder with raw SQL
2. Use `queryMany()` for SELECT queries
3. Use `queryOne()` for single row returns
4. Use `query()` for INSERT/UPDATE/DELETE with side effects
5. Handle authentication via session cookies
6. Use parameterized queries ($1, $2, etc.)

---

## Benefits of Raw SQL

✓ **Simpler**: Direct SQL is easier to understand
✓ **Faster**: No abstraction layer overhead
✓ **More Control**: Full PostgreSQL power available
✓ **Standard**: Industry-standard SQL syntax
✓ **Debugging**: SQL errors are clear and actionable

