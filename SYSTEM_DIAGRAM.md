# System Architecture Diagram

## Overall System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    EXCEL DATA PROCESSING SYSTEM                     │
│                       (Next.js 16 + React 19)                       │
│                                                                     │
│   Light Green & White Theme | Cookie-Based Auth | Role-Based     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LAYER                         │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   Login Page     │  │ Get Current User │  │    Logout        │ │
│  │  /login          │  │  /api/me         │  │  /api/logout     │ │
│  │  POST /api/login │  │  GET             │  │  POST            │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           Session Management (Cookie-Based)                  │ │
│  │                                                               │ │
│  │  ┌──────────┐ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐        │ │
│  │  │ Session  │                                       │        │ │
│  │  │ Storage  │ ◄─── Create on Login ─────────────── │        │ │
│  │  │ (Memory) │ ───► Validate on API Calls ──────────┼───────►│ │
│  │  └──────────┘     Clear on Logout          │       │        │ │
│  │                                             └──────►│        │ │
│  │  ┌──────────────────────────────────────────────┐   │        │ │
│  │  │  HttpOnly Cookie: sessionId                 │   │        │ │
│  │  │  (Auto-sent with credentials: include)      │   │        │ │
│  │  └──────────────────────────────────────────────┘   │        │ │
│  │                                                      │        │ │
│  └──────────────────────────────────────────────────────┘        │ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                   PROTECTED ROUTES LAYER                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              app/dashboard/layout.tsx                       │   │
│  │                                                             │   │
│  │  1. Check Authentication (useAuth hook)                    │   │
│  │  2. Call GET /api/me                                       │   │
│  │  3. Get User Data { id, username, role }                   │   │
│  │  4. If 401 → Redirect to /login                            │   │
│  │  5. If 200 → Pass user to components                       │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                 AUTHORIZATION & ROLE-BASED UI                       │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Sidebar Component (Role Filtering)                        │    │
│  │                                                            │    │
│  │  User Role = Admin:                                        │    │
│  │  ✓ Upload Data                                             │    │
│  │  ✓ Upload History                                          │    │
│  │  ✓ Error Reports                                           │    │
│  │  ✓ Admin Configuration        ◄── Shown                   │    │
│  │                                                            │    │
│  │  User Role = Operator:                                     │    │
│  │  ✓ Upload Data                                             │    │
│  │  ✓ Upload History                                          │    │
│  │  ✓ Error Reports                                           │    │
│  │  ✗ Admin Configuration        ◄── Hidden                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Navbar Component (User Display)                           │    │
│  │                                                            │    │
│  │  [🔶] [admin@pacs.com]  [Admin]  [Logout ▼]               │    │
│  │        ▲                 ▲         ▲                       │    │
│  │        │                 │         │                       │    │
│  │        └─ From /api/me ──┴─────────┘                       │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD PAGES LAYER                            │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                 │
│  │   Upload Data Page  │  │  Upload History     │                 │
│  │  • Branch dropdown  │  │  • View all uploads │                 │
│  │  • Module dropdown  │  │  • Status badges    │                 │
│  │  • Scheme dropdown  │  │  • Download errors  │                 │
│  │  • File input       │  │  • View details     │                 │
│  │  • Upload button    │  └─────────────────────┘                 │
│  └─────────────────────┘                                           │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                 │
│  │   Error Reports     │  │  Admin Config       │                 │
│  │  • Error table      │  │  (Admin Only)       │                 │
│  │  • Search input     │  │  • Module Mgmt      │                 │
│  │  • Filter dropdowns │  │  • Scheme Mgmt      │                 │
│  │  • Download button  │  │  • Column Mapping   │                 │
│  │                     │  │  • Validation Rules │                 │
│  └─────────────────────┘  └─────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       API INTEGRATION LAYER                         │
│                                                                     │
│  Global API Utility (lib/api.ts)                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  api.get('/endpoint')                       │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │ 1. Build URL                                         │   │   │
│  │  │ 2. Include credentials (cookies)                     │   │   │
│  │  │ 3. Send request                                      │   │   │
│  │  │ 4. Handle response                                   │   │   │
│  │  │ 5. Check status                                      │   │   │
│  │  │    - 401 → Redirect to /login                        │   │   │
│  │  │    - 200 → Return data                               │   │   │
│  │  │    - Other → Throw ApiError                          │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API ENDPOINTS                          │
│                                                                     │
│  Authentication Endpoints:                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ POST   /api/login    {username, password}                   │  │
│  │ GET    /api/me       (requires valid session)               │  │
│  │ POST   /api/logout   (requires valid session)               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Data Endpoints:                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ GET    /api/branches                                         │  │
│  │ GET    /api/modules                                          │  │
│  │ GET    /api/schemes?moduleId={id}                            │  │
│  │ POST   /api/upload   {file, branchId, moduleId, schemeId}   │  │
│  │ GET    /api/history                                          │  │
│  │ GET    /api/errors?uploadId={id}                             │  │
│  │ GET    /api/config                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           ▼

┌─────────────────────────────────────────────────────────────────────┐
│                          MOCK DATA STORE                            │
│                   (In Development Environment)                      │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Users:                                                    │    │
│  │  • admin@pacs.com / admin123 (Admin)                      │    │
│  │  • operator@pacs.com / operator123 (Operator)             │    │
│  │                                                            │    │
│  │  Branches: Mumbai, Delhi, Bangalore, Kolkata, Chennai     │    │
│  │                                                            │    │
│  │  Modules: Members, Deposits, Loans                        │    │
│  │                                                            │    │
│  │  Schemes: Multiple per module (mock data)                │    │
│  │                                                            │    │
│  │  Uploads: Mock upload history data                       │    │
│  │                                                            │    │
│  │  Errors: Mock error reports data                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  (Replace with real database in production)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## User Journey Map

```
START
  │
  └──► User visits http://localhost:3000
         │
         ├─ No session cookie
         │   └──► Redirect to /login
         │
         └──► Has session cookie
             └──► Check /api/me
                  │
                  ├─ 401 (Invalid)
                  │  └──► Redirect to /login
                  │
                  └─ 200 (Valid)
                     └──► Load dashboard
                         │
                         ├─ user.role = Admin
                         │  └──► Show all menu items
                         │       └──► Show Admin Config
                         │
                         └─ user.role = Operator
                            └──► Hide Admin Config
                                 └──► Show Upload, History, Errors only

          ┌─── User Actions ───┐
          │                     │
          ├─ Upload Data        │
          │  └──► Select Branch │
          │       Select Module │
          │       Select Scheme │
          │       Choose File   │
          │       Click Upload  │
          │       ✓ Success toast / ✗ Error toast
          │
          ├─ View History       │
          │  └──► Display table │
          │       Click View Errors
          │       Click Download Report
          │
          ├─ View Errors        │
          │  └──► Display table │
          │       Filter by column
          │       Search errors
          │       Download as Excel
          │
          ├─ Admin Config       │
          │  (Admin Only)
          │  └──► 4 Tabs
          │       - Module Management
          │       - Scheme Management
          │       - Column Mapping
          │       - Validation Rules
          │
          └─ Click Logout      │
             └──► POST /api/logout
                  Clear cookie
                  Redirect to /login
                  │
                  END
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ToastProvider
│   │
│   ├── LoginPage (app/login/page.tsx)
│   │   └── LoginForm
│   │       └── API: POST /api/login
│   │
│   └── DashboardLayout (app/dashboard/layout.tsx)
│       ├── Auth Check (useAuth hook)
│       │   └── API: GET /api/me
│       │
│       ├── Sidebar (components/layout/sidebar.tsx)
│       │   └── Role Filtering
│       │       ├── useAuth hook → user.role
│       │       └── Filter menuItems based on role
│       │
│       ├── Navbar (components/layout/navbar.tsx)
│       │   ├── useAuth hook → user data
│       │   ├── Show username & role
│       │   └── Logout button → API: POST /api/logout
│       │
│       └── Page Content (Varies)
│           ├── UploadPage
│           │   ├── SelectField (Branch) → API: GET /api/branches
│           │   ├── SelectField (Module) → API: GET /api/modules
│           │   ├── SelectField (Scheme) → API: GET /api/schemes
│           │   ├── FileInput
│           │   ├── Upload button → API: POST /api/upload
│           │   ├── useToast hook (notifications)
│           │   └── ResultCard
│           │
│           ├── HistoryPage
│           │   ├── API: GET /api/history
│           │   └── Table with actions
│           │
│           ├── ErrorsPage
│           │   ├── API: GET /api/errors
│           │   ├── Filters & search
│           │   └── Download button
│           │
│           └── ConfigPage (Admin Only)
│               ├── Tabs
│               │   ├── ModuleManagement
│               │   ├── SchemeManagement
│               │   ├── ColumnMapping
│               │   └── ValidationRules
│               └── API: GET /api/config
```

## Data Flow Diagram

```
┌─────────────────────┐
│   React Component   │
│  (Upload Page)      │
└──────────┬──────────┘
           │
           │ useState, useEffect
           │
           ▼
┌─────────────────────┐
│   Component State   │
│  branches: []       │
│  modules: []        │
│  schemes: []        │
│  file: null         │
└──────────┬──────────┘
           │
           │ useEffect hook
           │
           ▼
┌──────────────────────────┐
│   API Helper            │
│  api.get('/branches')   │
│  api.get('/modules')    │
│  api.get('/schemes')    │
│  api.post('/upload')    │
└──────────┬───────────────┘
           │
           │ fetch() with credentials
           │
           ▼
┌──────────────────────────┐
│   API Layer             │
│  app/api/branches/      │
│  app/api/modules/       │
│  app/api/schemes/       │
│  app/api/upload/        │
└──────────┬───────────────┘
           │
           │ Error Handling
           │ - Check auth (401)
           │ - Redirect if needed
           │ - Return data/error
           │
           ▼
┌──────────────────────────┐
│   Response Processing    │
│  - Update state          │
│  - Show toast            │
│  - Display result        │
└──────────────────────────┘
```

## Theme & Color System

```
┌─────────────────────────────────────────────────────────┐
│              COLOR PALETTE (okLCh Values)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PRIMARY (Green)                                        │
│  ████████  okLCh(0.4 0.18 142)                         │
│  Used for: Buttons, Links, Active states              │
│                                                         │
│  SIDEBAR (Dark Green)                                  │
│  ████████  okLCh(0.2 0.05 142)                         │
│  Used for: Sidebar background, Text contrast          │
│                                                         │
│  BACKGROUND (Off-white)                                │
│  ████████  okLCh(0.99 0.002 142)                       │
│  Used for: Page background                            │
│                                                         │
│  CARD (White)                                          │
│  ████████  okLCh(1 0 0)                                │
│  Used for: Cards, Containers                          │
│                                                         │
│  BORDER (Light Green)                                  │
│  ████████  okLCh(0.92 0.02 142)                        │
│  Used for: Borders, Dividers                          │
│                                                         │
│  DESTRUCTIVE (Red)                                     │
│  ████████  okLCh(0.58 0.25 27)                         │
│  Used for: Errors, Delete actions                     │
│                                                         │
│  SUCCESS (Green)                                       │
│  ████████  okLCh(0.5 0.16 142)                         │
│  Used for: Success messages                           │
│                                                         │
│  ERROR (Red)                                           │
│  ████████  okLCh(0.58 0.25 27)                         │
│  Used for: Error messages                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌───────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 1: Authentication                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Username + Password → Hash Validation → Session  │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  Layer 2: Session Management                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ httpOnly Cookie (sessionId)                      │   │
│  │ Cannot be accessed via JavaScript                │   │
│  │ Auto-sent with every request                     │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  Layer 3: Authorization                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Check user.role for each action                 │   │
│  │ Filter menu based on role                       │   │
│  │ Prevent unauthorized page access                │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  Layer 4: API Protection                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Validate session on every API call               │   │
│  │ Return 401 if invalid                            │   │
│  │ Auto-redirect to login                           │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  Layer 5: Error Handling                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ApiError with statusCode                         │   │
│  │ Automatic error messages to user                 │   │
│  │ No sensitive data leakage                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

This comprehensive diagram shows how all components, APIs, and data flows work together in the authentication and database-driven Excel Data Processing System.
