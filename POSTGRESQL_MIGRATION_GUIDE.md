# PostgreSQL Direct Connection Migration Guide

## Overview
This guide explains how to migrate from Supabase client (getPooledClient) to direct PostgreSQL queries using `lib/db.ts`.

## What Changed

### Before: Supabase Query Builder
```typescript
import { getPooledClient } from '@/lib/supabase/pool'

const supabase = await getPooledClient()
const { data: users } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

### After: Raw PostgreSQL Queries
```typescript
import { queryOne, queryMany, query } from '@/lib/db'

// Single row
const user = await queryOne<any>(
  'SELECT * FROM public.users WHERE email = $1',
  [email]
)

// Multiple rows
const users = await queryMany<any>(
  'SELECT * FROM public.users WHERE role = $1',
  ['Admin']
)

// Generic query with rowCount
const result = await query(
  'UPDATE public.users SET role = $1 WHERE id = $2',
  ['Admin', userId]
)
```

## New Utility Functions (lib/db.ts)

### `query<T>(sql: string, values?: any[]): Promise<QueryResult<T>>`
- Execute any SQL query
- Returns `{ rows, rowCount, command, etc. }`
- Use for INSERT, UPDATE, DELETE operations
- Use when you need row count: `result.rowCount`

```typescript
const result = await query(
  'INSERT INTO users (email) VALUES ($1)',
  ['user@example.com']
)
console.log(result.rowCount) // Number of affected rows
```

### `queryOne<T>(sql: string, values?: any[]): Promise<T | undefined>`
- Execute query and get single row
- Returns first row or undefined
- Perfect for SELECT with WHERE clauses

```typescript
const user = await queryOne<User>(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)
```

### `queryMany<T>(sql: string, values?: any[]): Promise<T[]>`
- Execute query and get multiple rows
- Returns array of rows
- Perfect for SELECT without WHERE or with LIMIT

```typescript
const users = await queryMany<User>(
  'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
  ['Admin']
)
```

### `transaction<T>(callback): Promise<T>`
- Execute multiple queries in a transaction
- Auto-commits on success, rolls back on error

```typescript
const result = await transaction(async (client) => {
  await client.query('INSERT INTO users ...')
  await client.query('UPDATE users ...')
  return { success: true }
})
```

## Migration Examples

### Example 1: SELECT Query
#### Before
```typescript
const { data, error } = await supabase
  .from('users')
  .select('id, email, role')
  .eq('email', 'user@example.com')
  .single()

if (error || !data) return null
return data
```

#### After
```typescript
const user = await queryOne<User>(
  'SELECT id, email, role FROM public.users WHERE email = $1',
  ['user@example.com']
)
return user
```

### Example 2: INSERT Query
#### Before
```typescript
const { data: newUser, error } = await supabase
  .from('users')
  .insert([{ email, username, role }])
  .select()
  .single()

if (error) throw error
return newUser
```

#### After
```typescript
const newUser = await queryOne<User>(
  `INSERT INTO public.users (email, username, role, created_at)
   VALUES ($1, $2, $3, NOW())
   RETURNING id, email, username, role`,
  [email, username, role]
)
return newUser
```

### Example 3: UPDATE Query
#### Before
```typescript
const { error } = await supabase
  .from('users')
  .update({ role: 'Admin', updated_at: new Date() })
  .eq('id', userId)

if (error) throw error
return true
```

#### After
```typescript
const result = await query(
  'UPDATE public.users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
  ['Admin', userId]
)
return result.rowCount > 0
```

### Example 4: DELETE Query
#### Before
```typescript
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)

if (error) throw error
```

#### After
```typescript
const result = await query(
  'DELETE FROM public.users WHERE id = $1',
  [userId]
)
return result.rowCount > 0
```

### Example 5: Complex SELECT with JOINs
#### Before
```typescript
const { data } = await supabase
  .from('users')
  .select('id, email, modules(id, name)')
  .eq('role', 'Admin')
  .order('created_at', { ascending: false })
```

#### After
```typescript
const users = await queryMany<User>(
  `SELECT u.id, u.email, json_agg(m.id) as module_ids
   FROM public.users u
   LEFT JOIN public.modules m ON u.id = m.user_id
   WHERE u.role = $1
   GROUP BY u.id, u.email
   ORDER BY u.created_at DESC`,
  ['Admin']
)
```

### Example 6: Transaction with Multiple Operations
#### Before
```typescript
const { error: err1 } = await supabase
  .from('users')
  .insert([{ email }])

if (err1) throw err1

const { error: err2 } = await supabase
  .from('audit_log')
  .insert([{ action: 'USER_CREATED', user_email: email }])

if (err2) throw err2
```

#### After
```typescript
await transaction(async (client) => {
  await client.query(
    'INSERT INTO users (email, created_at) VALUES ($1, NOW())',
    [email]
  )
  
  await client.query(
    'INSERT INTO audit_log (action, user_email, created_at) VALUES ($1, $2, NOW())',
    ['USER_CREATED', email]
  )
})
```

## Parameter Binding

Always use `$1, $2, $3` for parameterized queries:

```typescript
// ✅ CORRECT - Safe from SQL injection
await query('SELECT * FROM users WHERE email = $1', [email])

// ❌ WRONG - Unsafe, subject to SQL injection
await query(`SELECT * FROM users WHERE email = '${email}'`)

// Parameter order matters
await query(
  'UPDATE users SET role = $1, email = $2 WHERE id = $3',
  ['Admin', 'new@example.com', userId]  // $1, $2, $3
)
```

## Session Handling

The old Supabase Auth pattern doesn't exist. Use session cookies instead:

```typescript
// Extract session from cookie
const cookieHeader = request.headers.get('cookie') || ''
const sessionMatch = cookieHeader.match(/session=([^;]+)/)

if (!sessionMatch) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

let session
try {
  session = JSON.parse(decodeURIComponent(sessionMatch[1]))
} catch {
  return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
}

// Use session.id, session.email, session.role
const user = await queryOne<User>(
  'SELECT * FROM users WHERE id = $1',
  [session.id]
)
```

## Migration Checklist

For each route file, follow this checklist:

- [ ] Replace `import { getPooledClient } from '@/lib/supabase/pool'`  
       with `import { queryOne, queryMany, query } from '@/lib/db'`

- [ ] Replace Supabase `.from().select()` with `queryOne()` or `queryMany()`

- [ ] Replace Supabase `.from().insert()` with INSERT SQL + `queryOne()`

- [ ] Replace Supabase `.from().update()` with UPDATE SQL + `query()`

- [ ] Replace Supabase `.from().delete()` with DELETE SQL + `query()`

- [ ] Change error handling from `{ data, error }` to try/catch

- [ ] Update session handling to use session cookies instead of `auth.getUser()`

- [ ] Update log prefixes from `[v0]` to `[DB]`

- [ ] Test the route with sample data

## Files Already Updated

✅ `lib/auth-utils.ts` - Authentication logic
✅ `app/api/login/route.ts` - Login endpoint
✅ `app/api/register/route.ts` - Registration endpoint
✅ `app/api/config/route.ts` - Configuration endpoint

## Files Still Need Updating

- [ ] `app/api/logout/route.ts`
- [ ] `app/api/errors/route.ts`
- [ ] `app/api/history/route.ts`
- [ ] `app/api/me/route.ts`
- [ ] `app/api/modules/route.ts`
- [ ] `app/api/modules/[id]/route.ts`
- [ ] `app/api/schema/route.ts`
- [ ] `app/api/schemes/route.ts`
- [ ] `app/api/schemes/[id]/route.ts`
- [ ] `app/api/upload/route.ts`
- [ ] `app/api/validation-rules/route.ts`
- [ ] `app/api/validation-rules/[id]/route.ts`
- [ ] `app/api/branches/route.ts`
- [ ] `app/api/branches/[id]/route.ts`
- [ ] `app/api/schema/create-table/route.ts`
- [ ] `app/api/schema/get/route.ts`
- [ ] `app/api/schema/save/route.ts`
- [ ] `app/api/template/download/route.ts`

## Common SQL Patterns

### Pagination
```typescript
const limit = 10
const offset = (page - 1) * limit

const rows = await queryMany(
  'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
  [limit, offset]
)
```

### Count
```typescript
const result = await queryOne<{ count: number }>(
  'SELECT COUNT(*) as count FROM users WHERE role = $1',
  ['Admin']
)
console.log(result?.count)
```

### Filtering
```typescript
const users = await queryMany(
  `SELECT * FROM users 
   WHERE ($1::text IS NULL OR email ILIKE $1) 
     AND ($2::text IS NULL OR role = $2)
   ORDER BY created_at DESC`,
  [email || null, role || null]
)
```

### RETURNING Clause
```typescript
const inserted = await queryOne<User>(
  'INSERT INTO users (email) VALUES ($1) RETURNING *',
  [email]
)
```

## Debugging

Enable SQL logging by checking `lib/db.ts` console.log statements:

```
[DB] Query: SELECT id, email, role FROM... ["user@example.com"]
```

Watch for:
- Parameter count mismatch (`$1, $2` but only 1 value provided)
- Missing schema names (`SELECT * FROM users` should be `FROM public.users`)
- Incorrect field names
- Type casting issues

## Performance Tips

1. **Use LIMIT for large tables**
   ```typescript
   // Bad - loads all users
   const users = await queryMany('SELECT * FROM users')
   
   // Good - loads only needed data
   const users = await queryMany(
     'SELECT * FROM users LIMIT 100'
   )
   ```

2. **Select only needed columns**
   ```typescript
   // Bad
   const { password_hash, ...user } = await queryOne('SELECT * FROM users')
   
   // Good
   const user = await queryOne(
     'SELECT id, email, role FROM users WHERE id = $1',
     [id]
   )
   ```

3. **Use INDEXES for WHERE clauses**
   - Ensure `email` is indexed (it is by default)
   - Ensure `id` is indexed (PRIMARY KEY, always indexed)

4. **Cache frequently accessed data**
   - Configuration tables
   - User roles
   - Module definitions

## Support

For issues with the migration:
1. Check the SQL syntax in PostgreSQL docs
2. Review the examples above
3. Check `lib/db.ts` for available functions
4. Enable debug logging with console.log

