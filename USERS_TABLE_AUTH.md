# Users Table Authentication System

## Overview

This system uses **only the `users` table in Supabase** for authentication. No Supabase Auth is involved.

- **Login**: Email + Password from `users` table
- **Password Storage**: Bcrypt hashed (`password_hash` column)
- **Role Management**: Stored in `users` table (`role` column)
- **Access Control**: Role-based (Admin / Operator)

## Authentication Flow

```
User enters: email + password
                 ↓
         POST /api/login
                 ↓
    Query: SELECT * FROM users WHERE email = ?
                 ↓
         Check: user exists? ✓
                 ↓
    Verify: bcrypt.compare(password, password_hash)
                 ↓
         Check: password matches? ✓
                 ↓
    Check: is_active = true ✓
                 ↓
         Return: user data + role
                 ↓
          Success! Login complete
```

## Users Table Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'Operator', -- 'Admin' or 'Operator'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
)
```

## Demo Credentials

```
Admin User
  Email: admin@pacs.com
  Password: admin123
  Role: Admin
  Access: Full dashboard + Admin Configuration

Operator User
  Email: operator@pacs.com
  Password: operator123
  Role: Operator
  Access: Dashboard only (no config)
```

## Setup Steps

### 1. Run Database Migration

Execute in Supabase SQL Editor:

```sql
-- Add password field if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index on email for faster login
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
```

### 2. Create Demo Users

Option A: Via API (Recommended)

```bash
# Create Admin User
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pacs.com",
    "password": "admin123",
    "username": "admin",
    "role": "Admin"
  }'

# Create Operator User
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@pacs.com",
    "password": "operator123",
    "username": "operator",
    "role": "Operator"
  }'
```

Option B: Via SQL

```sql
-- Insert demo users with bcrypt hashed passwords
-- Password: admin123 (bcrypt hashed)
-- Password: operator123 (bcrypt hashed)

INSERT INTO public.users (id, email, username, password_hash, role, is_active)
VALUES
  (
    gen_random_uuid(),
    'admin@pacs.com',
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWQm',
    'Admin',
    true
  ),
  (
    gen_random_uuid(),
    'operator@pacs.com',
    'operator',
    '$2a$10$7cA9.zYGJgAX7TkFVvW3BerYrfMQ3VqJL.xWQhKxN2hPSUNX6AqVy',
    'Operator',
    true
  );
```

### 3. Test Login

1. Start dev server: `pnpm dev`
2. Open http://localhost:3000/login
3. Enter: admin@pacs.com / admin123
4. Click Login
5. Should see dashboard with Admin Configuration visible

### 4. Test Role Access

1. Logout
2. Login as: operator@pacs.com / operator123
3. Verify Admin Configuration is HIDDEN

## API Endpoints

### POST /api/login

Authenticate user with email and password.

```json
Request:
{
  "email": "admin@pacs.com",
  "password": "admin123"
}

Response (Success):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@pacs.com",
    "role": "Admin",
    "isActive": true
  }
}

Response (Error):
{
  "success": false,
  "message": "Invalid email or password"
}
```

### POST /api/register

Register new user (auto-creates if email doesn't exist).

```json
Request:
{
  "email": "newuser@pacs.com",
  "password": "newpass123",
  "username": "newuser",     // Optional
  "role": "Operator"         // Optional (defaults to Operator)
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "username": "newuser",
    "email": "newuser@pacs.com",
    "role": "Operator",
    "isActive": true
  }
}
```

### GET /api/me

Get current logged-in user.

```json
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@pacs.com",
    "role": "Admin",
    "isActive": true,
    "lastLogin": "2026-04-29T12:00:00Z"
  }
}
```

### POST /api/logout

Logout current user.

```json
Response:
{
  "success": true,
  "message": "Logout successful"
}
```

## Password Management

### Hash Password (During Registration)

```typescript
import bcrypt from 'bcryptjs'

const password = 'admin123'
const salt = await bcrypt.genSalt(10)
const hash = await bcrypt.hash(password, salt)
// Result: $2a$10$...
```

### Verify Password (During Login)

```typescript
const password = 'admin123'
const hash = '$2a$10$...'
const isMatch = await bcrypt.compare(password, hash)
// Returns: true or false
```

## Role-Based Access

### Frontend (Sidebar)

```typescript
const { user } = useAuth()

if (user?.role === 'Admin') {
  // Show Admin Configuration menu
}
```

### Backend API (/api/config)

```typescript
// Check user role
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('email', userEmail)
  .single()

if (userData.role !== 'Admin') {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 403 }
  )
}
```

## User Management (SQL)

### View All Users

```sql
SELECT id, email, username, role, is_active, last_login
FROM public.users
ORDER BY created_at DESC;
```

### Find User by Email

```sql
SELECT * FROM public.users WHERE email = 'admin@pacs.com';
```

### Change User Role

```sql
UPDATE public.users
SET role = 'Admin'
WHERE email = 'operator@pacs.com';
```

### Deactivate User (Prevent Login)

```sql
UPDATE public.users
SET is_active = false
WHERE email = 'operator@pacs.com';
```

### Update User Password

```typescript
import { hashPassword } from '@/lib/auth-utils'

const newPasswordHash = await hashPassword('newpass123')

const { error } = await supabase
  .from('users')
  .update({ password_hash: newPasswordHash })
  .eq('email', 'admin@pacs.com')
```

## Security Features

- Bcrypt password hashing (10 rounds)
- No plain-text passwords stored
- Unique email per user
- Active status controls login
- Role-based access enforcement
- Last login tracking
- Session management via middleware

## Troubleshooting

### "Invalid email or password"

1. Verify email exists in users table
2. Check password is correct
3. Ensure is_active = true
4. Check password_hash is not NULL

### User can't access admin features

1. Verify user role is 'Admin'
2. Update role if needed: `UPDATE users SET role = 'Admin' WHERE email = '...'`
3. Logout and login again

### New user auto-created but can't login

1. Check user was inserted correctly
2. Verify password_hash exists and is not NULL
3. Delete and re-register via /api/register

## Files Involved

- `lib/auth-utils.ts` - Core auth functions
- `app/api/login/route.ts` - Login endpoint
- `app/api/register/route.ts` - Registration endpoint
- `app/api/me/route.ts` - Get current user
- `app/api/logout/route.ts` - Logout
- `components/auth/login-form.tsx` - Login UI
- `hooks/useAuth.ts` - Auth state management

## System Architecture

```
Login Form (Client)
      ↓
POST /api/login (Server)
      ↓
authenticateUser() (lib/auth-utils.ts)
      ↓
Query users table by email
      ↓
Verify password with bcrypt
      ↓
Check is_active status
      ↓
Return user + role
      ↓
Middleware sets session
      ↓
User authenticated with role
```

## Key Features

- Email + Password authentication
- Bcrypt password hashing
- Role-based access control (Admin/Operator)
- Auto-user creation on first login
- Last login tracking
- User deactivation support
- Consistent role enforcement

---

**Version**: 3.2 (Users Table Only)  
**Status**: Production Ready  
**Last Updated**: 2026-04-29
