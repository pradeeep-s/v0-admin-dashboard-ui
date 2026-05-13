# Role-Based Architecture Implementation Guide

## Overview

This document describes the complete role-based access control (RBAC) system implemented for the PACS Banking Dynamic SaaS application. The system supports three roles: **Admin**, **Branch**, and **Operator**.

## Role Definitions

### Admin Role
- **Access Level**: Full system access
- **Features**: User management, branch management, module configuration, query engine, database settings, system administration
- **Dashboard**: `/admin/dashboard`
- **Can**: Add, Edit, Delete, View, Configure all resources
- **Use Case**: System administrators and super-users

### Branch Role
- **Access Level**: Limited to assigned branch data
- **Features**: View and manage data within assigned modules
- **Dashboard**: `/branch/dashboard`
- **Can**: View, Add, Edit, Delete data (but cannot configure system)
- **Use Case**: Branch managers and supervisors

### Operator Role
- **Access Level**: Upload and data entry only
- **Features**: Upload files, view upload history, view errors
- **Dashboard**: `/operator/dashboard`
- **Can**: Upload data, view history and errors
- **Use Case**: Data entry specialists and upload operators

## File Structure

### Type System
```
lib/types.ts
├── UserRole (enum: 'Admin' | 'Branch' | 'Operator')
├── User (interface with role and branchId)
├── Permission (interface with resource and actions)
└── PermissionResource & PermissionAction (types)
```

### Permission System
```
lib/permissions.ts
├── ROLE_PERMISSIONS (matrix of role -> permissions)
├── hasPermission() (check single permission)
├── canAccessResource() (check resource access)
├── authorize() (main authorization check)
└── getAccessibleResources() (get all resources for role)
```

### API Authentication
```
lib/api-auth.ts
├── getSessionFromRequest() (parse session from cookies)
├── verifyAuth() (check authentication)
├── verifyAuthorization() (check permission)
├── requireAuth() (middleware for auth)
└── requirePermission() (middleware for specific permission)
```

### Route Layouts
```
app/
├── admin/layout.tsx (Admin layout with AdminSidebar)
├── branch/layout.tsx (Branch layout with BranchSidebar)
└── operator/layout.tsx (Operator layout with OperatorSidebar)
```

### Components
```
components/
├── auth/
│   ├── RoleGuard.tsx (Guard component for role-based access)
│   ├── PermissionGate.tsx (Conditional rendering by permission)
│   └── login-form.tsx (Role-aware login)
├── layout/
│   ├── AdminSidebar.tsx (Admin navigation)
│   ├── BranchSidebar.tsx (Branch navigation)
│   ├── OperatorSidebar.tsx (Operator navigation)
│   ├── SidebarLink.tsx (Reusable sidebar link)
│   └── Navbar.tsx (Top navigation with user role)
└── common/
    └── RoleDisplay.tsx (Display role with styling)
```

### Hooks
```
hooks/
├── useAuth.ts (Authentication hook)
└── useAuthorization.ts (Authorization hook with permission checks)
```

## Implementation Details

### 1. Authentication Flow

```
Login Form
    ↓
/api/login (POST)
    ↓
Verify email & password (bcrypt)
    ↓
Load user with role & branchId
    ↓
Set session cookie (httpOnly)
    ↓
Redirect to role-based dashboard
```

### 2. Session Structure

```javascript
{
  id: "user-id",
  email: "user@example.com",
  role: "Admin" | "Branch" | "Operator",
  branchId: "branch-id" | null
}
```

### 3. Authorization Checks

#### Route Protection
```typescript
// In layout.tsx
<RoleGuard requiredRoles={['Admin']}>
  {children}
</RoleGuard>
```

#### API Protection
```typescript
// In API route
const { user, authorized, error } = await requirePermission(
  request,
  'users',
  'view'
)

if (!authorized) return error
```

#### Component Level
```typescript
// In component
<PermissionGate resource="users" action="create">
  <CreateUserButton />
</PermissionGate>
```

## Database Schema Changes

### Users Table Enhancement
```sql
ALTER TABLE users ADD COLUMN branch_id UUID REFERENCES branches(id);
```

### Branch Modules Assignment
```sql
CREATE TABLE branch_modules (
  id UUID PRIMARY KEY,
  branch_user_id UUID REFERENCES users(id),
  module_id UUID REFERENCES modules(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Operator Modules Assignment
```sql
CREATE TABLE operator_modules (
  id UUID PRIMARY KEY,
  operator_user_id UUID REFERENCES users(id),
  module_id UUID REFERENCES modules(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Permission Matrix

### Admin Permissions
- dashboard: view
- users: view, create, edit, delete
- branches: view, create, edit, delete
- modules: view, create, edit, delete
- module_columns: view, create, edit, delete, configure
- queries: view, create, edit, delete
- uploads: view, delete
- errors: view, delete
- settings: view, edit, configure

### Branch Permissions
- dashboard: view
- uploads: view
- errors: view
- modules: view

### Operator Permissions
- dashboard: view
- uploads: view, create
- errors: view

## API Routes

### Admin Routes
```
GET    /api/admin/users             - List all users
POST   /api/admin/users             - Create user
PUT    /api/admin/users/[id]        - Update user
DELETE /api/admin/users/[id]        - Delete user
GET    /api/admin/branches          - List branches
POST   /api/admin/branches          - Create branch
GET    /api/admin/modules           - List modules
POST   /api/admin/modules           - Create module
```

### Branch Routes
```
GET    /api/branch/modules          - Get assigned modules
GET    /api/branch/data             - Get assigned data
```

### Operator Routes
```
POST   /api/operator/upload         - Upload file
GET    /api/operator/upload         - Get upload history
GET    /api/operator/errors         - Get errors
```

### Shared Routes
```
POST   /api/login                   - Login (all roles)
GET    /api/me                      - Get current user
POST   /api/logout                  - Logout (all roles)
```

## Frontend Routes

### Admin
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/branches` - Branch management
- `/admin/modules` - Module management
- `/admin/module-columns` - Column configuration
- `/admin/queries` - Query management
- `/admin/uploads` - Upload history
- `/admin/errors` - Error history
- `/admin/settings` - System settings

### Branch
- `/branch/dashboard` - Branch dashboard
- `/branch/modules` - Assigned modules
- `/branch/[module-id]` - Module data view

### Operator
- `/operator/dashboard` - Operator dashboard
- `/operator/upload` - File upload
- `/operator/history` - Upload history
- `/operator/errors` - Error history

## Security Features

1. **Session-Based Auth**: HTTP-only cookies prevent XSS attacks
2. **Parameterized Queries**: All SQL queries use `$1, $2` parameters
3. **Role-Based Access**: Every route and API endpoint checks permissions
4. **Data Filtering**: APIs filter results based on user role
5. **Audit Trails**: All modifications logged with user info
6. **Soft Deletes**: Users marked inactive instead of hard deleted

## Usage Examples

### Checking Permissions in a Component
```typescript
'use client'

import { useAuthorization } from '@/hooks/useAuthorization'

export function AdminPanel() {
  const { isAdmin, checkPermission } = useAuthorization()

  if (!isAdmin()) {
    return <div>Access Denied</div>
  }

  return (
    <div>
      {checkPermission('users', 'create') && (
        <CreateUserButton />
      )}
    </div>
  )
}
```

### Protecting API Routes
```typescript
import { requirePermission } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const { user, authorized, error } = await requirePermission(
    request,
    'modules',
    'create'
  )

  if (!authorized) return error

  // Create module...
}
```

### Using RoleGuard
```typescript
<RoleGuard requiredRoles={['Admin', 'Branch']}>
  <AdminPanel />
</RoleGuard>
```

### Using PermissionGate
```typescript
<PermissionGate 
  resource="users" 
  action="delete"
  fallback={<p>You cannot delete users</p>}
>
  <DeleteUserButton />
</PermissionGate>
```

## Testing

### Test Credentials
- **Admin**: admin@pacs.com / admin123
- **Branch**: branch@pacs.com / branch123
- **Operator**: operator@pacs.com / operator123

### Test Scenarios
1. Login with each role and verify correct dashboard appears
2. Try accessing restricted routes (should redirect)
3. Check API endpoints with different roles (should return 403)
4. Verify data filtering based on role
5. Test permission gates in components

## Migration Path

For existing systems:
1. Add `role` and `branchId` columns to users table
2. Create `branch_modules` and `operator_modules` tables
3. Migrate existing users to appropriate roles
4. Update authentication to return role from database
5. Implement RoleGuard wrappers on existing routes
6. Test all role-based access patterns

## Performance Considerations

1. **Session Caching**: User session stored in cookie, minimal DB lookups
2. **Permission Matrix**: Hardcoded, no database queries
3. **Lazy Loading**: Dashboards load data on demand
4. **Pagination**: Large datasets paginated
5. **Indexes**: User role and branchId indexed for quick filtering

## Future Enhancements

1. **Fine-Grained Permissions**: Table-level, row-level access control
2. **Role Templates**: Create custom roles with predefined permissions
3. **Time-Based Access**: Permissions valid for specific time periods
4. **Approval Workflows**: Multi-level approval for sensitive operations
5. **Audit Dashboard**: Real-time activity monitoring
6. **Permission Inheritance**: Roles inherit from parent roles

## Troubleshooting

### User can't access dashboard
- Check if user role is correct: `SELECT role FROM users WHERE id = ?`
- Verify session cookie is set: Check browser DevTools
- Check RoleGuard configuration for route

### API returns 403 Forbidden
- Check if user has permission: `authorize(user.role, resource, action)`
- Verify user role in session matches database
- Check permission matrix in `lib/permissions.ts`

### Wrong data displayed
- Verify API filters by branchId for Branch users
- Check if operator can only access assigned modules
- Review API query WHERE clauses

## Questions & Support

For questions about this implementation, refer to:
- `/lib/permissions.ts` - Permission matrix and functions
- `/lib/api-auth.ts` - API authentication middleware
- `/hooks/useAuthorization.ts` - Frontend authorization hook
- `/app/*/layout.tsx` - Role-based layout examples
