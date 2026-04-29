# Supabase Setup Guide

## Overview
This system now uses **Supabase PostgreSQL** as the primary database with Supabase Auth for user authentication. All data is stored and managed through Supabase.

## Database Schema

### Tables Created

1. **branches** - Banking branch information
   - Stores branch names, codes, and locations
   - RLS enabled (public select, admin insert/update/delete)

2. **modules** - Processing modules (Members, Deposits, Loans, etc.)
   - Stores module definitions and descriptions
   - RLS enabled (public select, admin insert/update/delete)

3. **schemes** - Schemes within each module
   - References modules table
   - RLS enabled (public select, admin insert/update/delete)

4. **users** - Extended user profile data
   - References auth.users with ON DELETE CASCADE
   - Stores username, email, role, last_login
   - RLS enabled (users can only view/edit own profile)

5. **uploads** - File upload history
   - Tracks all Excel file uploads
   - Stores file metadata, row counts, success/failure stats
   - References user, branch, module, scheme
   - RLS enabled (users can only view own uploads)

6. **upload_errors** - Error details from uploads
   - Stores row-level errors from processing
   - References uploads table
   - RLS enabled (users can view errors from own uploads)

7. **column_mappings** - Excel to database column mappings
   - Stores Excel column → Database column mappings per scheme
   - Stores data type and required flag
   - RLS enabled (public select, admin insert/update/delete)

8. **validation_rules** - Data validation rules
   - Stores validation rules per scheme and column
   - Supports various rule types: required, min, max, regex, unique
   - RLS enabled (public select, admin insert/update/delete)

## Setup Instructions

### Step 1: Execute SQL Migrations

Run these SQL scripts in Supabase SQL Editor (in order):

1. **001_create_schema.sql** - Creates all tables and indexes
   - Copy content from `/scripts/001_create_schema.sql`
   - Paste in Supabase SQL Editor
   - Execute

2. **002_seed_data.sql** - Inserts sample data
   - Copy content from `/scripts/002_seed_data.sql`
   - Paste in Supabase SQL Editor
   - Execute

3. **003_auth_trigger.sql** - Creates auth trigger
   - Copy content from `/scripts/003_auth_trigger.sql`
   - Paste in Supabase SQL Editor
   - Execute

### Step 2: Create Authentication Users

In Supabase Auth Dashboard:

1. Go to **Authentication** → **Users**
2. Click **Create new user** (or use "Invite")
3. Create Admin user:
   ```
   Email: admin@pacs.com
   Password: admin123
   Role: Admin
   ```
4. Create Operator user:
   ```
   Email: operator@pacs.com
   Password: operator123
   Role: Operator
   ```

**Note:** The trigger (003_auth_trigger.sql) will automatically create user profiles when users are created in Auth.

### Step 3: Set RLS Policies

All RLS policies are created by the migration scripts. Verify in Supabase:

1. Go to **SQL Editor** → **Roles** → **Public**
2. Verify all policies are enabled
3. Key policies:
   - `branches_select_public` - Anyone can read
   - `users_select_own` - Users can only see own profile
   - `uploads_select_own` - Users can only see own uploads
   - `upload_errors_select_own` - Users can only see errors from own uploads

### Step 4: Environment Variables

All required environment variables are automatically set. Verify they exist:

```env
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_HOST=...
POSTGRES_DATABASE=postgres
```

### Step 5: Test the Connection

Run the dev server:
```bash
pnpm dev
```

Test endpoints:
```bash
# Test branches
curl http://localhost:3000/api/branches

# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pacs.com","password":"admin123"}'

# Test current user (after login)
curl http://localhost:3000/api/me
```

## Supabase Features Used

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce data isolation per user
- Admin operations controlled via service role

### Foreign Key Constraints
- Cascading deletes for data integrity
- Referential integrity across tables

### Triggers
- Automatic user profile creation on signup
- Executed with security definer privileges

### Indexes
- Performance indexes on foreign keys
- Indexes on frequently queried columns

## Data Flow

```
User Login
    ↓
Supabase Auth (signInWithPassword)
    ↓
Session created (Supabase handles cookies)
    ↓
GET /api/me (verify session)
    ↓
Fetch user profile from database
    ↓
Client stores user data
    ↓
All subsequent API calls use Supabase client (automatic auth)
```

## API Changes

### Authentication
- All endpoints now use Supabase client
- Session management handled by Supabase Auth
- No need for manual session management

### Data Fetching
- All GET requests fetch from Supabase database
- RLS policies automatically filter data
- Admin endpoints verify admin role before operations

### File Upload
- Uploads stored as records in database
- File metadata tracked (name, size, row counts)
- Errors stored in separate table for analysis

## Roles and Permissions

### Admin Role
- Can view all configuration
- Can add/edit/delete modules, schemes, column mappings, validation rules
- Can view all users' uploads (if needed - currently RLS restricted)
- Can manage system configuration

### Operator Role
- Can upload files
- Can view own upload history
- Can view own error reports
- Cannot access admin configuration

## Security Considerations

### What's Protected
- RLS prevents users from accessing other users' data
- Admin-only endpoints verify role before execution
- All credentials handled securely via Supabase Auth
- Passwords never stored in application code

### Best Practices
- Always use Supabase client (handles auth automatically)
- Never bypass RLS policies
- Validate user role before admin operations
- Use service role key only in server-side code

## Troubleshooting

### "Unauthorized" Error
- Check if user is logged in: `GET /api/me`
- Verify Supabase session cookie is present
- Check user exists in database

### "Role not found" Error
- Ensure user was created through Supabase Auth
- Check trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`
- Manually insert user if needed

### "Relation does not exist" Error
- Ensure all migrations were executed
- Run 001_create_schema.sql again
- Check for errors in SQL Editor

### RLS Policy Errors
- Verify all policies are enabled
- Check policy syntax in SQL Editor
- Ensure auth.uid() matches column in policy

## Next Steps

1. **Test the system:**
   - Login with both user types
   - Try file upload as operator
   - Try accessing config as operator (should fail)
   - Try accessing config as admin (should work)

2. **Monitor logs:**
   - Check browser console for errors
   - Check server logs (pnpm dev output)
   - Check Supabase logs for database errors

3. **Customize:**
   - Adjust RLS policies as needed
   - Add more validation rules
   - Create additional modules/schemes
   - Extend user metadata in triggers

## Database Backup

To backup your Supabase database:
1. Go to Supabase Dashboard
2. Project Settings → Backups
3. Click "Request backup"
4. Wait for completion
5. Download when ready

## Production Checklist

- [ ] Run all migration scripts
- [ ] Create admin and operator users
- [ ] Test all endpoints
- [ ] Verify RLS policies work correctly
- [ ] Configure HTTPS (auto-enabled on Vercel)
- [ ] Enable Supabase backups
- [ ] Configure email verification
- [ ] Test password reset flow
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts
- [ ] Create admin user for production
- [ ] Document custom configurations
