# Supabase Setup Checklist

Complete this checklist to fully set up the Supabase integration.

## Pre-Setup Verification

- [ ] Supabase project exists
- [ ] SUPABASE_URL is set
- [ ] SUPABASE_ANON_KEY is set
- [ ] SUPABASE_SERVICE_ROLE_KEY is set
- [ ] Supabase SQL Editor is accessible

## Database Setup

### Execute SQL Migrations

#### 1. Schema Migration (001_create_schema.sql)
- [ ] Open Supabase SQL Editor
- [ ] Copy content from `scripts/001_create_schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run" or press Ctrl+Enter
- [ ] Verify no errors
- [ ] Expected output: Tables created, indexes created

**What it creates:**
- branches table
- modules table
- schemes table
- users table
- uploads table
- upload_errors table
- column_mappings table
- validation_rules table
- All indexes
- All RLS policies

#### 2. Seed Data Migration (002_seed_data.sql)
- [ ] Copy content from `scripts/002_seed_data.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify no errors
- [ ] Expected output: 5 branches, 5 modules, 6 schemes inserted

**What it inserts:**
- Branches (Main, North, South, East, West)
- Modules (Members, Deposits, Loans, Share Capital, General Ledger)
- Schemes (6 total, mapped to modules)
- Column Mappings (sample data)
- Validation Rules (sample rules)

#### 3. Auth Trigger Migration (003_auth_trigger.sql)
- [ ] Copy content from `scripts/003_auth_trigger.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify no errors
- [ ] Expected output: Function created, Trigger created

**What it creates:**
- `handle_new_user()` function
- `on_auth_user_created` trigger
- Auto-creates user profile on signup

## Verify Database

- [ ] Go to Supabase Dashboard
- [ ] Click "SQL Editor" in sidebar
- [ ] Run this query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
- [ ] Verify these tables exist:
  - branches
  - modules
  - schemes
  - users
  - uploads
  - upload_errors
  - column_mappings
  - validation_rules

- [ ] Click "Table Editor" in sidebar
- [ ] Select "branches" table
- [ ] Verify 5 rows exist
- [ ] Select "modules" table
- [ ] Verify 5 rows exist

## Authentication Setup

### Create Admin User

- [ ] Go to Supabase Dashboard
- [ ] Click "Authentication" in sidebar
- [ ] Click "Users" tab
- [ ] Click "Invite user" or "Create new user"
- [ ] Enter:
  - Email: `admin@pacs.com`
  - Password: `admin123` (or your preferred password)
  - Auto-confirm: ON
- [ ] Click "Send invite" or "Create user"
- [ ] Verify user appears in Users list

### Create Operator User

- [ ] Click "Invite user" or "Create new user"
- [ ] Enter:
  - Email: `operator@pacs.com`
  - Password: `operator123` (or your preferred password)
  - Auto-confirm: ON
- [ ] Click "Send invite" or "Create user"
- [ ] Verify user appears in Users list

### Verify User Profiles Created

- [ ] Go to Supabase Dashboard
- [ ] Click "SQL Editor"
- [ ] Run this query:
```sql
SELECT id, username, email, role, is_active FROM public.users;
```
- [ ] Verify both admin@pacs.com and operator@pacs.com appear
- [ ] Verify roles are correct (if not, update via SQL):
```sql
UPDATE public.users SET role = 'Admin' 
WHERE email = 'admin@pacs.com';

UPDATE public.users SET role = 'Operator' 
WHERE email = 'operator@pacs.com';
```

## Application Setup

- [ ] Run `pnpm install` (if not already done)
- [ ] Run `pnpm dev`
- [ ] Visit http://localhost:3000
- [ ] Verify page loads without errors

## Login Testing

### Admin Login Test
- [ ] Go to http://localhost:3000/login
- [ ] Enter email: `admin@pacs.com`
- [ ] Enter password: `admin123`
- [ ] Click "Login"
- [ ] Verify redirected to dashboard
- [ ] Verify navbar shows "admin@pacs.com" and "Admin" badge

### Operator Login Test
- [ ] Click logout
- [ ] Verify redirected to login
- [ ] Enter email: `operator@pacs.com`
- [ ] Enter password: `operator123`
- [ ] Click "Login"
- [ ] Verify redirected to dashboard
- [ ] Verify navbar shows "operator@pacs.com" and "Operator" badge

## Feature Testing

### Sidebar Navigation (Both Users)
- [ ] Verify "Upload Data" menu item visible
- [ ] Verify "Upload History" menu item visible
- [ ] Verify "Error Reports" menu item visible

### Admin Configuration Menu
- [ ] **Admin user:** Admin Configuration menu visible ✓
- [ ] **Operator user:** Admin Configuration NOT visible ✓

### Upload Data Page
- [ ] Branches dropdown loads from API
- [ ] Modules dropdown loads from API
- [ ] Module selection updates Schemes dropdown
- [ ] Selecting all 3 dropdowns enables Upload button
- [ ] Uploading file works
- [ ] Result card shows with stats

### Upload History Page
- [ ] Table loads with columns: Upload ID, Branch, Module, Scheme, Status, etc.
- [ ] Uploads from logged-in user appear
- [ ] Status badges show correct colors
- [ ] Action buttons present

### Error Reports Page
- [ ] Page loads (empty if no upload errors)
- [ ] Upload file with errors
- [ ] Errors appear in table
- [ ] Filter by column works
- [ ] Filter by error type works
- [ ] Search works

### Admin Configuration Page (Admin Only)
- [ ] Module Management tab loads
- [ ] Scheme Management tab loads
- [ ] Column Mapping tab loads
- [ ] Validation Rules tab loads
- [ ] Can add new module via form
- [ ] Can add new scheme via form
- [ ] Can add new column mapping
- [ ] Can add new validation rule

### Operator Access Test
- [ ] Admin Configuration page shows "Unauthorized" error
- [ ] Operator cannot create modules
- [ ] Operator cannot manage configuration

## API Testing

### Test Branches API
```bash
curl http://localhost:3000/api/branches
```
- [ ] Returns status 200
- [ ] Returns array of branches
- [ ] Each branch has: id, name, code, location, is_active

### Test Login API
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pacs.com","password":"admin123"}'
```
- [ ] Returns status 200
- [ ] Returns user data with role
- [ ] Response includes sessionId cookie

### Test Protected API
```bash
curl http://localhost:3000/api/me \
  -H "Cookie: <session-cookie-from-login>"
```
- [ ] Returns current user info
- [ ] Includes role field

### Test Unauthorized
```bash
curl http://localhost:3000/api/me
```
- [ ] Returns 401 Unauthorized
- [ ] No cookie provided

### Test Admin-Only Config
```bash
curl http://localhost:3000/api/config?type=column-mappings \
  -H "Cookie: <operator-session>"
```
- [ ] Returns 403 Forbidden
- [ ] Message: "Only admins can access config"

## Browser Console Check

- [ ] No errors in browser console (F12)
- [ ] No warnings about deprecated APIs
- [ ] Network tab shows successful requests to /api/*

## Documentation Check

- [ ] Read SUPABASE_SETUP.md
- [ ] Read SUPABASE_INTEGRATION.md
- [ ] Understand database schema
- [ ] Understand RLS policies
- [ ] Understand authentication flow

## Final Verification

- [ ] All SQL migrations executed
- [ ] Both users created in Auth
- [ ] User profiles visible in users table
- [ ] Admin can login and see all features
- [ ] Operator can login but limited access
- [ ] File upload works
- [ ] Data persists in database
- [ ] No 401 errors for logged-in users
- [ ] No 403 errors for non-admin config access

## Production Readiness

Before deploying to production:

- [ ] Change demo passwords (admin123, operator123)
- [ ] Enable email verification in Supabase Auth
- [ ] Set up password reset email
- [ ] Configure backups in Supabase
- [ ] Enable RLS on all sensitive tables (already done)
- [ ] Review and adjust RLS policies as needed
- [ ] Set up monitoring/alerts
- [ ] Document custom configurations
- [ ] Create data backup strategy
- [ ] Set up audit logging if needed
- [ ] Test disaster recovery process
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Test critical user flows in production

## Troubleshooting

### Issue: "Relation does not exist" error

**Solution:**
- [ ] Run 001_create_schema.sql again
- [ ] Check SQL Editor output for errors
- [ ] Refresh browser

### Issue: Login fails with "Invalid credentials"

**Solution:**
- [ ] Verify user email exists in Supabase Auth
- [ ] Verify password is correct
- [ ] Check if user account is confirmed
- [ ] Check if user account is active

### Issue: "User not found" after login

**Solution:**
- [ ] Run 003_auth_trigger.sql again
- [ ] Manually create user profile:
```sql
INSERT INTO public.users (id, username, email, role, is_active) 
VALUES ('user-uuid', 'user@email.com', 'user@email.com', 'Operator', true);
```

### Issue: Admin Configuration page shows error

**Solution:**
- [ ] Verify user role is 'Admin' in users table
- [ ] Update role if needed:
```sql
UPDATE public.users SET role = 'Admin' WHERE email = 'admin@pacs.com';
```

### Issue: File upload shows 401 Unauthorized

**Solution:**
- [ ] Verify user is logged in
- [ ] Check browser cookies (should have session)
- [ ] Try logging out and back in
- [ ] Check /api/me returns user

## Support

For issues:
1. Check browser console (F12)
2. Check Supabase logs in dashboard
3. Review SUPABASE_SETUP.md
4. Check SQL migrations ran without errors
5. Verify users created in Auth dashboard

---

**Status:** ✅ Ready to setup
**Next Step:** Execute SQL migrations in Supabase SQL Editor
**Time to Complete:** ~15-20 minutes
