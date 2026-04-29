# Dynamic Excel Data Processing System

A modern, professional admin dashboard for managing Excel file uploads, data validation, and configuration in PACS/banking environments.

## Overview

This is a Next.js-based admin dashboard designed for financial institutions to:
- Upload and process Excel files (XLSX format)
- Track upload history and processing results
- Manage validation errors with detailed reporting
- Configure modules, schemes, column mappings, and validation rules
- Monitor data processing with real-time status updates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **State Management**: React hooks

## Project Structure

```
/app
  /api                      # Mock API endpoints
    /branches
    /modules
    /schemes
    /upload
    /history
    /errors
    /config
  /dashboard
    /upload                 # Upload data page
    /history                # Upload history page
    /errors                 # Error reports page
    /config                 # Admin configuration page
    page.tsx                # Dashboard home
  layout.tsx
  page.tsx
  globals.css

/components
  /layout
    sidebar.tsx             # Navigation sidebar
    navbar.tsx              # Top navigation bar
    dashboard-layout.tsx    # Dashboard wrapper
  /common
    status-badge.tsx        # Status indicator component
    empty-state.tsx         # Empty state component
    loading-skeleton.tsx    # Loading skeletons
    file-input.tsx          # File upload component
    form-field.tsx          # Reusable form fields
    result-card.tsx         # Upload result card
  /config
    module-management.tsx   # Module CRUD
    scheme-management.tsx   # Scheme CRUD
    column-mapping.tsx      # Column mapping configuration
    validation-rules.tsx    # Validation rules configuration

/lib
  types.ts                  # TypeScript type definitions
  mock-data.ts              # Mock data for demonstration
  utils.ts                  # Utility functions
```

## Features

### 1. Upload Data Page
- **Branch Selection**: Dropdown to select processing branch
- **Module Selection**: Choose data module (Members/Deposits/Loans)
- **Scheme Selection**: Dynamic scheme selection based on module
- **File Upload**: Drag-and-drop or click to upload Excel files (.xlsx only)
- **Progress Indicator**: Real-time upload progress bar
- **Result Card**: Detailed upload results showing:
  - Total rows processed
  - Successful rows with percentage
  - Failed rows with percentage
  - Overall status (Success/Partial/Failed)
  - Processing date and time

### 2. Upload History Page
- **Comprehensive Table**: All uploads with details:
  - Upload ID (searchable)
  - Branch name
  - Module and scheme
  - Row counts and success rates
  - Color-coded status badges
  - Upload date
- **Action Buttons**: View errors or download error reports
- **Empty State**: Helpful message when no uploads exist
- **Responsive Design**: Works on all screen sizes

### 3. Error Reports Page
- **Detailed Error Table**: Shows all validation errors
- **Multiple Filters**:
  - Filter by upload ID
  - Filter by column name
  - Filter by error type (validation, format, required, unique, range)
  - Search by error message, column, or row number
- **Error Information**:
  - Row number where error occurred
  - Column name
  - Error type and message
  - Actual value that failed validation
- **Export**: Download errors as Excel file
- **Empty State**: Shows when no errors found

### 4. Admin Configuration Page
Four-tab interface for system configuration:

#### A. Module Management
- Create new modules
- Edit existing modules
- Delete modules
- Track active/inactive status
- Each module has: name, code, description

#### B. Scheme Management
- Create schemes under modules
- Edit and delete schemes
- Associate schemes with modules
- Track scheme status
- Each scheme has: name, code, module reference, description

#### C. Column Mapping
- Select scheme to configure
- Map Excel columns (A-Z) to database columns
- Define data types: string, number, date, boolean
- Mark fields as required
- Dynamic add/remove rows
- Visual table of all mappings

#### D. Validation Rules
- Select scheme to configure
- Define validation rules per column:
  - Rule types: required, min, max, regex, unique, email, numeric
  - Rule values for min/max/regex
  - Custom error messages
- Dynamic rule management
- Condition rule value inputs based on rule type

## Design System

### Color Palette
- **Primary**: Deep blue (#573AC2) - Main actions and highlights
- **Accent**: Green (#7FB600) - Success indicators
- **Destructive**: Red (for errors and failures)
- **Background**: Light (#F9FAFB) with dark mode support
- **Sidebar**: Dark navy (#1F2937) for high contrast

### Typography
- **Font**: Geist (sans-serif) for all text
- **Sizes**: 
  - Page title: 2rem (32px)
  - Section title: 1.25rem (20px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Spacing
- Uses Tailwind's 4px base unit
- Consistent padding: p-4 (16px), p-6 (24px), p-8 (32px)
- Gap sizes: gap-4 (16px), gap-6 (24px)

### Components
- **Cards**: Elevated surfaces with subtle shadows
- **Badges**: Color-coded status indicators
- **Tables**: Responsive with hover states
- **Forms**: Organized with clear labels and descriptions
- **Buttons**: Primary, secondary, and ghost variants
- **Modals**: For adding/editing items
- **Dropdowns**: For selection and user actions

## Mock Data

The application includes realistic mock data:
- **5 Branches**: Mumbai, Delhi, Bangalore, Kolkata, Chennai
- **3 Modules**: Members, Deposits, Loans
- **6 Schemes**: Regular/Life Membership, Savings/Fixed Deposits, Personal/Business Loans
- **5 Upload Records**: Various statuses and row counts
- **8 Error Records**: Different error types and columns
- **6 Column Mappings**: Excel to database column mappings
- **6 Validation Rules**: Different rule types

## API Endpoints

All endpoints are mock and return simulated data:

```
GET  /api/branches              # Get all branches
GET  /api/modules               # Get all modules
GET  /api/schemes?moduleId=X    # Get schemes for module
POST /api/modules               # Create module
POST /api/schemes               # Create scheme
POST /api/upload                # Upload file
GET  /api/history               # Get upload history
GET  /api/errors?uploadId=X     # Get errors for upload
GET  /api/config?type=...       # Get configuration
POST /api/config                # Save configuration
```

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Access the Application

- Open [http://localhost:3000](http://localhost:3000)
- Automatically redirects to `/dashboard`
- Navigate using the sidebar menu

## Key Components

### DashboardLayout
Wrapper component providing:
- Fixed sidebar navigation
- Top navbar with user menu
- Responsive mobile menu
- Main content area

### StatusBadge
Visual indicator showing upload status:
- ✓ Success (green)
- ✕ Failed (red)
- ⚠ Partial (yellow)
- ⏱ Pending (gray)

### FileInput
Reusable file upload component:
- Drag-and-drop support
- File validation
- File size display
- Clear button

### SelectField
Reusable dropdown component with:
- Label and description
- Error message display
- Disabled state support
- Required field indicator

### EmptyState
Reusable empty state with:
- Icon
- Title and description
- Optional action button

### ResultCard
Displays upload statistics:
- Grid of key metrics
- Color-coded success/failure indicators
- Progress bar visualization
- Percentage calculations

## Form Validation

The application uses:
- **Zod**: Schema validation for forms
- **React Hook Form**: Efficient form state management
- **Client-side validation**: Instant feedback
- **Error messages**: Clear, user-friendly messages

## Responsiveness

All pages are fully responsive:
- **Mobile**: Single column, hamburger menu, stacked forms
- **Tablet**: Two columns, sidebar visible on larger tablets
- **Desktop**: Full three-column layout with sidebar

Breakpoints:
- `md`: 768px (tablets)
- `lg`: 1024px (desktop)

## Customization

### Adding New Pages
1. Create file in `/app/dashboard/[page]/page.tsx`
2. Wrap with `<DashboardLayout>`
3. Add menu item to `components/layout/sidebar.tsx`

### Modifying Color Scheme
Edit `/app/globals.css`:
- Change oklch color values in `:root` and `.dark`
- Use CSS custom properties throughout app

### Updating Mock Data
Edit `/lib/mock-data.ts`:
- Modify existing data arrays
- Add new mock data as needed
- API endpoints will automatically use new data

### Connecting Real Backend
1. Replace API route handlers in `/app/api/`
2. Update mock data imports
3. Ensure response format matches TypeScript types in `/lib/types.ts`

## Performance

- **Next.js 16 Turbopack**: Fast compilation
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic image optimization
- **CSS-in-JS**: Tailwind for minimal CSS
- **React Compiler**: Stable support enabled

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Meets WCAG AA standards
- **Focus States**: Visible focus indicators

## Best Practices

- **Modular Components**: Reusable, single-purpose components
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Try-catch blocks and user feedback
- **Loading States**: Skeleton screens and progress indicators
- **Empty States**: Helpful messaging when no data
- **Responsive Design**: Mobile-first approach
- **Clean Code**: Well-organized and documented

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Regenerate types
pnpm exec tsc --noEmit
```

## License

This project is created with v0 and follows v0's terms of service.

## Support

For issues or questions:
1. Check the v0 documentation at v0.app
2. Review Next.js docs at nextjs.org
3. Check Tailwind CSS docs at tailwindcss.com
4. Explore shadcn/ui components at ui.shadcn.com
