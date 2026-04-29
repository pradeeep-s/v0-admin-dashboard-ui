# Authentication System - Start Here

## Quick Overview

Your app now uses **Users Table Authentication**:
- Login with email + password
- Credentials stored in `users` table
- Passwords encrypted with bcrypt
- Role-based access control (Admin / Operator)
- **NO Supabase Auth required**

## 3-Minute Setup

1. **Start the app**
   ```bash
   pnpm dev
   ```

2. **Create an admin user** (via curl)
   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "email":"admin@pacs.com",
       "password":"admin123",
       "role":"Admin"
     }'
   ```

3. **Login**
   - Open http://localhost:3000/login
   - Email: `admin@pacs.com`
   - Password: `admin123`
   - Click Login

## Demo Users

After setup:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@pacs.com | admin123 | Admin | Dashboard + Admin Configuration |
| operator@pacs.com | operator123 | Operator | Dashboard only |

## How It Works

```
User enters email + password
        ↓
Database lookup by email
        ↓
Bcrypt password verification
        ↓
Return user with role
        ↓
Frontend shows menu based on role
```

## Key Files

- **lib/auth-utils.ts** - Core authentication logic
- **app/api/login/route.ts** - Login endpoint
- **components/auth/login-form.tsx** - Login form UI

## Important: Users Table Schema

Your `users` table needs:
- `id` (UUID)
- `email` (unique)
- `password_hash` (bcrypt)
- `role` ('Admin' or 'Operator')
- `is_active` (boolean)
- `username` (unique)

## Documentation

1. **AUTH_QUICK_START.txt** - Quick reference
2. **USERS_TABLE_AUTH.md** - Complete guide
3. **USERS_TABLE_AUTH_SUMMARY.txt** - What changed

## Test Login

1. Admin login
   - Email: admin@pacs.com
   - Password: admin123
   - Verify: Admin Configuration visible

2. Operator login
   - Email: operator@pacs.com
   - Password: operator123
   - Verify: Admin Configuration hidden

## API Endpoints

```
POST /api/login    - Authenticate user
POST /api/register - Create new user
GET /api/me        - Get current user
POST /api/logout   - Logout user
```

## Role-Based Access

**Admin Role:**
- Full dashboard access
- Admin Configuration visible
- Can manage system settings

**Operator Role:**
- Dashboard access
- Admin Configuration hidden
- Limited to data operations

## Common Tasks

Create new user:
```bash
curl -X POST http://localhost:3000/api/register \
  -d '{"email":"user@pacs.com","password":"pass123"}'
```

Check users in database:
```sql
SELECT email, role, is_active FROM public.users;
```

Change user role:
```sql
UPDATE public.users SET role = 'Admin' WHERE email = '...';
```

Deactivate user:
```sql
UPDATE public.users SET is_active = false WHERE email = '...';
```

## Security

- Bcrypt password hashing
- No plain-text passwords stored
- Role validation on every request
- User activity tracking
- Secure session management

## Troubleshooting

**Login fails with "Invalid email or password"**
- Verify email exists in users table
- Check password is correct
- Ensure user is active: `is_active = true`

**Admin features not visible**
- Verify role is 'Admin' in database
- Logout and login again
- Clear browser cache

**User created but can't login**
- Check user was inserted
- Verify `password_hash` is set
- Check `is_active = true`

## Next Steps

1. Create admin user via /api/register
2. Login and test the app
3. Create more users as needed
4. Deploy with confidence!

---

**Status**: Production Ready  
**Authentication**: Users Table Only  
**Password Hashing**: Bcrypt  
**Roles**: Admin, Operator  

Read **USERS_TABLE_AUTH.md** for complete documentation.
