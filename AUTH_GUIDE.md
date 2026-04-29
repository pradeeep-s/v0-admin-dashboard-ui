# Authentication & Authorization Guide

## Overview

The Excel Data Processing System now includes a complete authentication and authorization system with role-based access control.

## Features Implemented

### 1. **Authentication System**
- **Login Page** (`/login`)
  - Clean, centered card layout
  - Username and password fields
  - Error message display
  - Loading spinner during submission
  - Demo credentials displayed for testing

- **API Endpoints**
  - `POST /api/login` - Authenticates user with username/password
  - `GET /api/me` - Fetches current authenticated user
  - `POST /api/logout` - Clears session

- **Session Management**
  - Cookie-based authentication (httpOnly)
  - Session storage in memory
  - Automatic session validation on API calls

### 2. **User Roles**
Two user roles with different permissions:

#### **Admin Role**
- Full access to all features
- Can view all sidebar menu items including "Admin Configuration"
- Full configuration management capabilities

#### **Operator Role**
- Limited access to core features
- Cannot access "Admin Configuration"
- Can perform:
  - Data uploads
  - View upload history
  - View error reports

### 3. **Route Protection**
- All dashboard routes (`/dashboard/*`) require authentication
- Unauthenticated users are automatically redirected to `/login`
- Protected routes show loading state while checking auth status

### 4. **Global API Utility**
Created `/lib/api.ts` with features:
- Centralized API call handling
- Automatic credential inclusion (cookies)
- Automatic 401 redirect to login on auth failures
- Error handling with proper error types
- Convenience methods: `api.get()`, `api.post()`, `api.put()`, `api.delete()`, `api.patch()`

### 5. **Auth Hook**
`/hooks/useAuth.ts` provides:
- `user` - Current authenticated user object
- `loading` - Loading state while fetching auth status
- `isAuthenticated` - Boolean flag for auth status
- `logout()` - Function to logout user

### 6. **Toast Notifications**
Global notification system with:
- Success, error, and info toast types
- Auto-dismiss after 5 seconds (configurable)
- Corner positioning
- Color-coded icons and backgrounds

### 7. **Theme System**
- Light green and white color scheme
- Professional banking UI aesthetic
- Consistent design across all pages
- Responsive design for all screen sizes

## Demo Credentials

Test the system with these accounts:

### Admin Account
```
Username: admin@pacs.com
Password: admin123
```
Access: Full dashboard + Admin Configuration

### Operator Account
```
Username: operator@pacs.com
Password: operator123
```
Access: Upload Data, Upload History, Error Reports (no Admin Config)

## API Endpoints

### Authentication Endpoints

#### 1. POST /api/login
Login with username and password.

**Request:**
```json
{
  "username": "admin@pacs.com",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "1",
    "username": "admin@pacs.com",
    "email": "admin@pacs.com",
    "role": "Admin",
    "isActive": true
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 2. GET /api/me
Get current authenticated user. Requires valid session cookie.

**Response (Success):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "1",
    "username": "admin@pacs.com",
    "email": "admin@pacs.com",
    "role": "Admin",
    "isActive": true
  }
}
```

**Response (Failure - No Auth):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### 3. POST /api/logout
Logout current user. Clears session cookie.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Component Updates

### Sidebar (`/components/layout/sidebar.tsx`)
- Filters menu items based on user role
- Hides "Admin Configuration" for Operator role
- Displays user auth status

### Navbar (`/components/layout/navbar.tsx`)
- Shows current username and role
- Displays loading spinner while fetching user
- Logout button in dropdown menu

### Dashboard Layout (`/app/dashboard/layout.tsx`)
- Protected route wrapper
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading state during auth check

## Usage in Components

### Using the Auth Hook

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, loading, logout, isAuthenticated } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) return <div>Not logged in</div>

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Using the API Helper

```typescript
'use client'

import { api, ApiError } from '@/lib/api'
import { Branch } from '@/lib/types'

export async function loadBranches() {
  try {
    const branches = await api.get<Branch[]>('/api/branches')
    return branches
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        // User not authenticated, already redirected to login
      }
    }
    throw error
  }
}
```

### Using Toast Notifications

```typescript
'use client'

import { useToast } from '@/components/common/toast-provider'

export function MyComponent() {
  const { showToast } = useToast()

  const handleAction = async () => {
    try {
      await someAsyncAction()
      showToast('Action completed successfully!', 'success')
    } catch (error) {
      showToast('Action failed', 'error')
    }
  }

  return <button onClick={handleAction}>Do Something</button>
}
```

## Security Considerations

### Current Implementation (Development)
- httpOnly cookies prevent JavaScript access
- Same-site cookie policy (lax)
- Session validation on every API call
- Automatic redirect on 401 responses

### Production Recommendations
1. Use HTTPS only
2. Set secure cookie flag: `secure: true`
3. Implement real session store (Redis, database)
4. Add CSRF protection
5. Implement rate limiting on login endpoint
6. Use password hashing (bcrypt, argon2)
7. Add refresh token mechanism
8. Implement session timeout

## File Structure

```
app/
├── api/
│   ├── login/
│   │   └── route.ts          # Login endpoint
│   ├── me/
│   │   └── route.ts          # Get current user
│   ├── logout/
│   │   └── route.ts          # Logout endpoint
│   └── ... (other endpoints)
├── dashboard/
│   ├── layout.tsx             # Protected layout wrapper
│   ├── upload/
│   ├── history/
│   ├── errors/
│   └── config/
└── login/
    └── page.tsx               # Login page

components/
├── auth/
│   └── login-form.tsx         # Login form component
├── layout/
│   ├── navbar.tsx             # Updated with auth info
│   ├── sidebar.tsx            # Updated with role filtering
│   └── dashboard-layout.tsx
└── common/
    └── toast-provider.tsx     # Toast notification system

hooks/
└── useAuth.ts                 # Auth hook

lib/
├── api.ts                     # API utility helper
├── types.ts                   # Type definitions (includes User)
└── mock-data.ts              # Mock data (includes users)
```

## Color Scheme

The system uses a light green and white theme for a professional banking aesthetic:

- **Primary Green**: Used for buttons, links, and active states
- **White/Off-white**: Background and card surfaces
- **Light Gray**: Borders and subtle elements
- **Red**: Error and destructive states
- **Sidebar**: Dark green background with white text

## Next Steps

To extend authentication:

1. **Add Password Reset**: Implement forgot password flow
2. **Add User Management**: Admin panel for managing users
3. **Add Two-Factor Authentication**: SMS/Email OTP verification
4. **Add Audit Logging**: Track user actions
5. **Add Permission System**: Fine-grained permission control
6. **Integrate Real Database**: Replace in-memory session storage
7. **Add OAuth2/OIDC**: Support external identity providers

## Troubleshooting

### Login not working
- Check if browser cookies are enabled
- Verify username and password in demo credentials
- Check API logs for error messages

### Redirect loop on dashboard
- Clear browser cookies
- Check /api/me endpoint returns 401
- Verify dashboard/layout.tsx is properly protecting routes

### User info not showing in navbar
- Check if useAuth hook is being called
- Verify /api/me endpoint is responding
- Check browser network tab for failed requests

### Toast notifications not showing
- Ensure ToastProvider wraps the entire app (in layout.tsx)
- Check useToast hook is called inside ToastProvider context
- Verify CSS classes are applied correctly
