# Authentication System Setup Guide

## Overview

The application uses a **hybrid authentication system** that supports both Supabase Auth and stored credentials (fallback authentication) in the users table.

### Authentication Flow

1. User enters email and password on login page
2. `/api/login` endpoint calls `authenticateUser()` 
3. System tries 3 authentication methods in order:
   - **Method 1**: Supabase Auth (if user registered via Supabase)
   - **Method 2**: Stored credentials in users table (bcrypt hashed password)
   - **Method 3**: Auto-create new user with provided credentials if neither exist

4. User profile is created in `users` table if it doesn't exist
5. Last login timestamp is updated
6. User is authenticated and logged in

## Database Schema

### Users Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,                    -- bcrypt hashed password
  role TEXT NOT NULL DEFAULT 'Operator', -- 'Admin' or 'Operator'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Fields

- **id**: User's unique identifier (UUID)
- **email**: User's email address (used for login)
- **password_hash**: Bcrypt hashed password for fallback authentication
- **role**: User's role - determines access level ('Admin' or 'Operator')
- **is_active**: Whether user can log in

## Setup Instructions

### Step 1: Run Database Migrations

```sql
-- 1. Create main schema (already done in 001_create_schema.sql)
-- 2. Add password field to users table
-- Run this in Supabase SQL Editor:
```

Execute: `scripts/004_add_password_field.sql`

This adds the `password_hash` column to the users table.

### Step 2: Create Demo Users

Option A: Using SQL (scripts/005_seed_users.sql)
```sql
-- Run this SQL to create demo users with pre-generated bcrypt hashes
-- Email: admin@pacs.com
-- Email: operator@pacs.com
-- Email: test@pacs.com
```

Option B: Using API (Recommended)
```bash
# Create Admin User
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pacs.com",
    "password": "admin123",
    "username": "admin_user",
    "role": "Admin"
  }'

# Create Operator User
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@pacs.com",
    "password": "operator123",
    "username": "operator_user",
    "role": "Operator"
  }'
```

### Step 3: Test Login

1. Start dev server: `pnpm dev`
2. Visit: http://localhost:3000/login
3. Enter credentials:
   - Email: `admin@pacs.com`
   - Password: `admin123`
4. Click Login

### Step 4: Verify User Access

- Admin user should see: Upload Data, History, Errors, Admin Configuration
- Operator user should see: Upload Data, History, Errors (NO Admin Configuration)

## User Management

### Add New User

Using API endpoint:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@pacs.com",
    "password": "securepassword123",
    "username": "new_user",
    "role": "Operator"
  }'
```

### Change User Role (Database)

```sql
-- Change user to Admin
UPDATE public.users 
SET role = 'Admin' 
WHERE email = 'newuser@pacs.com';

-- Change user to Operator
UPDATE public.users 
SET role = 'Operator' 
WHERE email = 'newuser@pacs.com';
```

### Deactivate User (Database)

```sql
-- Deactivate user (they cannot log in)
UPDATE public.users 
SET is_active = false 
WHERE email = 'newuser@pacs.com';

-- Reactivate user
UPDATE public.users 
SET is_active = true 
WHERE email = 'newuser@pacs.com';
```

### Update Password

```bash
# Note: Currently no password change endpoint exists
# You can add one following the same pattern as /api/register
# For now, update directly in database (not recommended)
```

## User Roles

### Admin Role
- Full access to all features
- Can manage configuration
- Can view all uploads
- Can manage modules, schemes, validation rules
- Can manage column mappings

### Operator Role
- Limited access
- Can upload files
- Can view upload history
- Can view error reports
- NO access to admin configuration
- Cannot modify system settings

## Authentication Code Reference

### Authentication Utility (`lib/auth-utils.ts`)

Key functions:

```typescript
// Authenticate user (tries multiple methods)
authenticateUser(email: string, password: string)
  → { user: User, error: string | null, isNewUser: boolean }

// Hash password
hashPassword(password: string): Promise<string>

// Verify password against hash
verifyPassword(password: string, hash: string): Promise<boolean>

// Update user password
updateUserPassword(userId: string, newPassword: string): Promise<boolean>
```

### Login Endpoint (`app/api/login/route.ts`)

```typescript
POST /api/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (Success):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "username": "username",
    "email": "email@example.com",
    "role": "Admin",
    "isActive": true
  }
}

Response (Failure):
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Register Endpoint (`app/api/register/route.ts`)

```typescript
POST /api/register
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "role": "Operator"
}

Response (Success):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "Operator",
    "isActive": true
  }
}
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Passwords are never stored in plain text
- Password verification uses secure comparison
- Failed login attempts are logged

### Session Management
- Sessions are managed via Supabase Auth (httpOnly cookies)
- Sessions expire automatically
- User authentication is verified on every API request
- Logout clears the session

### Role-Based Access Control
- User roles are checked on every protected API call
- Admin-only endpoints verify role before executing
- Frontend sidebar hides admin features for operators
- Backend enforces all access control rules

### Data Isolation
- Users can only see their own data (via RLS policies)
- Admins can see all data (via service role)
- Row Level Security policies enforce isolation
- Audit trail available for all operations

## Demo Credentials

After setup, use these credentials to test:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@pacs.com | admin123 | Admin | Active |
| operator@pacs.com | operator123 | Operator | Active |
| test@pacs.com | admin123 | Operator | Active |

## Troubleshooting

### "Invalid email or password" error

**Cause**: User doesn't exist or password is wrong

**Solution**: 
1. Verify email and password are correct
2. Create user using `/api/register` endpoint
3. Check if user is active: `SELECT * FROM public.users WHERE email = '...';`

### User cannot see Admin Configuration

**Cause**: User role is not 'Admin'

**Solution**:
1. Check user's role in database: `SELECT email, role FROM public.users;`
2. Update role if needed: `UPDATE public.users SET role = 'Admin' WHERE email = '...';`

### "User account is inactive" error

**Cause**: User's `is_active` field is false

**Solution**:
1. Activate user in database: `UPDATE public.users SET is_active = true WHERE email = '...';`

### Cannot log in after creating user

**Cause**: User was created but password wasn't properly hashed

**Solution**:
1. Use `/api/register` endpoint to create users (handles hashing automatically)
2. Or manually hash password and update: 
   - Use bcryptjs in Node.js to generate hash
   - Update users table directly

## Advanced: Custom Password Change Endpoint

To add password change functionality:

```typescript
// app/api/change-password/route.ts
import { updateUserPassword } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  const { userId, newPassword } = await request.json()
  
  if (!userId || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  
  const success = await updateUserPassword(userId, newPassword)
  
  if (success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
```

## Migration from Mock Auth

If migrating from mock authentication system:

1. Run migration scripts in order:
   - 001_create_schema.sql
   - 002_seed_data.sql
   - 003_auth_trigger.sql
   - 004_add_password_field.sql
   - 005_seed_users.sql

2. Create users using `/api/register` for new credentials

3. Test login with demo accounts

4. Update any custom user creation code to use `authenticateUser()`

## Best Practices

1. **Always use /api/register for new users** - Handles password hashing automatically
2. **Never log passwords** - Only log authentication success/failure
3. **Require strong passwords** - Current minimum is 6 characters (consider enforcing more)
4. **Review logs regularly** - Check for failed login attempts
5. **Backup user database** - Supabase handles this automatically
6. **Update roles carefully** - Double-check before promoting users to Admin
7. **Deactivate instead of deleting** - Preserve audit trail

## Next Steps

1. Set up users as per "Setup Instructions"
2. Test login with demo credentials
3. Create additional users as needed
4. Monitor login attempts in application logs
5. Consider adding password change endpoint
6. Set up email verification in production
7. Enable multi-factor authentication if needed
