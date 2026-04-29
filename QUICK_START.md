# Quick Start Guide

## Login to the Dashboard

### 1. Visit Login Page
Navigate to: `http://localhost:3000/login`

### 2. Choose Your Account

**Admin Account (Full Access)**
```
Username: admin@pacs.com
Password: admin123
```

**Operator Account (Limited Access)**
```
Username: operator@pacs.com
Password: operator123
```

### 3. What You'll See

#### Admin User:
✓ Upload Data  
✓ Upload History  
✓ Error Reports  
✓ Admin Configuration  

#### Operator User:
✓ Upload Data  
✓ Upload History  
✓ Error Reports  
✗ Admin Configuration (Hidden)  

## Key Features

### Upload Data Page
1. Select a **Branch** from dropdown
2. Select a **Module** (Members/Deposits/Loans)
3. Select a **Scheme** (based on selected module)
4. Choose an Excel file (.xlsx)
5. Click "Upload File"
6. View results and progress

### Upload History Page
- View all past uploads
- See success/failure status with colored badges
- Download error reports
- View upload details

### Error Reports Page
- Search for specific errors
- Filter by column name
- Filter by error type
- Download all errors as Excel

### Admin Configuration (Admin Only)
Four tabs for configuration:
1. **Module Management** - Add/Edit/Delete modules
2. **Scheme Management** - Add/Edit/Delete schemes by module
3. **Column Mapping** - Map Excel columns to database columns
4. **Validation Rules** - Set validation rules per column

## User Interface

### Navigation
- **Left Sidebar**: Menu items (responsive, collapses on mobile)
- **Top Navbar**: User profile, role badge, logout button
- **Main Content**: Dashboard pages with cards and tables

### Theme
- Light green and white professional banking aesthetic
- Clean, minimal design
- Responsive layout (works on desktop, tablet, mobile)

### Notifications
- Success messages (green)
- Error messages (red)
- Info messages (blue)
- Auto-dismiss after 5 seconds

## API Endpoints (For Reference)

### Authentication
```
POST /api/login           - Login with credentials
GET /api/me              - Get current user
POST /api/logout         - Logout
```

### Data Management
```
GET /api/branches         - Get all branches
GET /api/modules          - Get all modules
GET /api/schemes?module_id=ID  - Get schemes for module
POST /api/upload          - Upload Excel file
GET /api/history          - Get upload history
GET /api/errors           - Get error reports
GET /api/config           - Get configuration
```

## Troubleshooting

### Can't Login
- [ ] Check username/password spelling
- [ ] Use demo credentials exactly as shown
- [ ] Clear browser cache/cookies
- [ ] Check browser console for errors

### Dashboard Not Loading
- [ ] Refresh the page
- [ ] Check browser console for errors
- [ ] Try logout and login again
- [ ] Clear cookies and try again

### No Data Showing
- [ ] Wait for loading spinners to complete
- [ ] Check internet connection
- [ ] Check browser network tab for failed requests
- [ ] Try refreshing the page

### Logout Not Working
- [ ] Refresh page after clicking logout
- [ ] Clear cookies manually
- [ ] Try closing and reopening browser

## Development Notes

### Tech Stack
- **Frontend**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Cookie-based sessions
- **API**: Next.js Route Handlers

### Project Structure
```
app/
├── api/              # Backend routes
├── dashboard/        # Protected dashboard
├── login/            # Login page
└── page.tsx          # Home (redirects to login)

components/
├── auth/             # Auth components
├── layout/           # Layout components
├── common/           # Shared components
└── config/           # Config components

lib/
├── api.ts            # API utility
├── types.ts          # Type definitions
└── mock-data.ts      # Mock data

hooks/
└── useAuth.ts        # Auth hook
```

## Common Tasks

### How to Upload a File
1. Go to "Upload Data"
2. Select Branch → Module → Scheme
3. Click "Choose File" and select .xlsx
4. Click "Upload File" button
5. Wait for upload to complete
6. View results card with row counts

### How to View Upload Errors
1. Go to "Upload History"
2. Find the upload in the table
3. Click "View Errors" button
4. See list of errors by row and column

### How to Download Error Report
1. Go to "Error Reports"
2. Apply filters if needed
3. Click "Download as Excel" button
4. File downloads to your computer

### How to Add a New Scheme (Admin Only)
1. Go to "Admin Configuration"
2. Click "Scheme Management" tab
3. Select a Module
4. Click "Add New Scheme"
5. Fill in scheme name and code
6. Click "Save"

## Keyboard Shortcuts
- `Tab` - Navigate between fields
- `Enter` - Submit form (when in last field)
- `Escape` - Close modals

## Browser Requirements
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Cookies must be enabled
- JavaScript enabled

## Mobile Support
- Sidebar collapses to hamburger menu
- Touch-friendly buttons and inputs
- Responsive tables with horizontal scroll
- All features work on mobile

## Performance Tips
- Close unused browser tabs
- Clear browser cache periodically
- Use latest browser version
- Disable extensions if experiencing issues

## Need Help?
- See `AUTH_GUIDE.md` for detailed authentication documentation
- See `EXTENSION_SUMMARY.md` for technical implementation details
- Check browser console (F12) for error messages
- Review network requests (F12 → Network tab)

## What's Next?
After exploring the demo:

1. **Connect to Real Database**
   - Replace mock-data.ts with real database queries
   - Implement user table with password hashing

2. **Add More Features**
   - Password reset/change
   - User management admin panel
   - Two-factor authentication
   - Audit logging

3. **Deploy to Production**
   - Move from development mode
   - Set up HTTPS
   - Configure environment variables
   - Set up monitoring and alerts

4. **Integrate Real File Processing**
   - Replace mock upload with real Excel processing
   - Implement data validation logic
   - Add real error reporting
   - Set up file storage

Enjoy exploring the dashboard!
