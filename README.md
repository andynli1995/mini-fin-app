# Solo Entrepreneur Toolkit

An all-in-one platform for solo entrepreneurs to manage their business, finances, and productivity tools. Built with Next.js, TypeScript, and Prisma.

## Overview

Solo Entrepreneur Toolkit is a modular platform that provides multiple integrated tools in one application. Currently includes a comprehensive Finance Manager and Interview Manager, with more tools coming soon.

## Features

### Tools Hub
- **Central Dashboard**: View all available tools at a glance
- **Critical Info Display**: Each tool card shows key metrics and information with visual alerts for items needing attention
- **Extensible Architecture**: Easy to add new tools and apps
- **Performance Optimized**: Parallel data loading for fast page transitions

### Finance Manager Tool

A complete financial management system with:

- **Transaction Management**: Record expenses, income, lend, and rent transactions with categories, dates, amounts, and notes
- **Virtual Wallet Management**: Create and manage multiple virtual wallets (e.g., Payoneer, MEXC, Bank accounts) with automatic balance tracking
- **Subscription Management**: Track recurring subscriptions (monthly, yearly, weekly, daily) with due dates, payment methods, and automatic reminders
- **Category Management**: Organize transactions by custom categories for each transaction type
- **Dashboard**: Overview of total balance, wallet breakdowns, recent transactions, and upcoming subscriptions
- **Reports & Analytics**: 
  - Filter transactions by type, category, wallet, and date range
  - Visual charts (pie charts, bar charts) for type and category breakdowns
  - Monthly trend analysis
  - Transaction volume statistics
- **Subscription Reminders**: Visual alerts for upcoming (next 7 days) and overdue subscriptions
- **Unified Settings**: Global settings accessible from header, with tool-specific settings organized by tool

### Interview Manager Tool

A complete job application and interview tracking system with:

- **Company Management**: Store company information including name, website, industry, size, and location
- **Interview Tracking**: 
  - Track interviews with company, role, status, scheduled date/time
  - Support for different interview types (phone, video, onsite, technical, behavioral)
  - Store interviewer name and reference links
  - Interview status workflow (applied, screening, interview, offer, rejected, withdrawn)
- **Assessment Management**: 
  - Track company assessments with deadlines
  - Monitor assessment status (pending, in-progress, completed, submitted, expired)
  - Store assessment descriptions and reference links
- **Reminders**: 
  - Set custom reminders for interviews (days and hours before)
  - Set custom reminders for assessments (days before deadline)
  - Visual alerts for upcoming and overdue items
- **Dashboard**: 
  - Professional activity graphs showing interview and assessment trends
  - Monthly activity charts (bar charts)
  - Status distribution charts (pie charts)
  - Statistics cards with key metrics
  - Upcoming interviews and assessments display
- **Critical Info Display**: Shows total applications, upcoming interviews/assessments, and reminders on the Tools Hub

### Coming Soon
- More tools to be added...

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PWA**: Service Worker with auto-update functionality

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   
   **Create Supabase Project:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Sign up for a free account if needed
   - Click "New Project"
   - Enter project name and database password
   - Select a region close to you
   - Wait for the project to be created (~2 minutes)
   
   **Get Connection Strings:**
   - Go to Supabase Dashboard → Settings → Database
   - For **local development/migrations**: Copy the "Connection string" (URI) - direct connection (port 5432)
   - For **Vercel/production**: Go to "Connection Pooling" → Select "Transaction" mode → Copy connection string (port 6543)
   
   **Set Up Environment Variables:**
   - Create a `.env` file in the root directory:
   ```bash
   # For local development and migrations (direct connection)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   
   # For Vercel/production (connection pooler - use this in Vercel environment variables)
   # DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```
   
   **Important Notes:**
   - Replace `[YOUR-PASSWORD]` with your database password
   - Replace `[YOUR-PROJECT-REF]` with your project reference ID
   - Replace `[REGION]` with your region (e.g., `us-east-1`, `eu-west-1`)
   - The pooler URL MUST include `?pgbouncer=true&connection_limit=1`
   - For migrations, use the direct connection (port 5432)
   - For Vercel, use the pooler URL (port 6543)

3. Set up the database:
   
   **Important**: For `prisma db push`, use the direct connection (port 5432) in your `.env` file, as the pooler is slow for migrations.
   
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   
   After the schema is pushed, you can switch back to the pooler URL for your application.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Management

- View database in Prisma Studio:
```bash
npm run db:studio
```

- Push schema changes:
```bash
npm run db:push
```

## Project Structure

```
solo-toolkit/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── transactions/   # Transaction endpoints
│   │   ├── wallets/        # Wallet endpoints
│   │   ├── subscriptions/  # Subscription endpoints
│   │   ├── categories/     # Category endpoints
│   │   ├── companies/      # Company endpoints
│   │   ├── interviews/     # Interview endpoints
│   │   ├── assessments/    # Assessment endpoints
│   │   ├── tools/          # Tool-specific API routes
│   │   │   ├── finance/    # Finance critical info
│   │   │   └── interviews/ # Interview critical info
│   │   └── settings/       # Settings endpoints
│   ├── tools/              # Tools directory
│   │   ├── finance/        # Finance Manager tool
│   │   │   ├── page.tsx    # Finance dashboard
│   │   │   ├── transactions/
│   │   │   ├── wallets/
│   │   │   ├── subscriptions/
│   │   │   ├── reports/
│   │   │   ├── categories/
│   │   │   └── settings/
│   │   └── interviews/     # Interview Manager tool
│   │       ├── page.tsx    # Interview dashboard
│   │       ├── interviews/
│   │       ├── assessments/
│   │       └── companies/
│   ├── page.tsx            # Tools hub (home page)
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ToolsHub.tsx        # Tools hub dashboard
│   ├── Dashboard.tsx       # Finance dashboard
│   ├── Navigation.tsx      # Navigation bar
│   ├── Sidebar.tsx         # Sidebar navigation
│   ├── TransactionForm.tsx # Transaction form
│   ├── WalletCard.tsx      # Wallet display card
│   ├── RemindersBanner.tsx # Subscription reminders
│   ├── interviews/         # Interview Manager components
│   │   ├── InterviewDashboard.tsx
│   │   ├── InterviewForm.tsx
│   │   ├── InterviewsList.tsx
│   │   ├── AssessmentForm.tsx
│   │   ├── AssessmentsList.tsx
│   │   ├── CompanyForm.tsx
│   │   ├── CompaniesList.tsx
│   │   ├── InterviewActivityChart.tsx
│   │   ├── AssessmentActivityChart.tsx
│   │   └── ...
│   └── ...
├── lib/                    # Utility functions
│   ├── prisma.ts           # Prisma client
│   └── tools-registry.ts   # Tools registry
├── prisma/                 # Database schema
│   └── schema.prisma       # Prisma schema
└── public/                 # Static assets
```

## Usage

### Tools Hub

When you first open the app, you'll see the Tools Hub showing all available tools. Each tool card displays:
- Tool name and description
- Critical information (e.g., total balance for Finance Manager)
- Quick access to the tool

### Finance Manager

#### Creating Wallets

1. Navigate to Finance Manager → Wallets
2. Click "Add Wallet"
3. Enter wallet name, type, currency, and initial balance
4. Wallets automatically track balance based on transactions

#### Recording Transactions

1. Navigate to Finance Manager → Transactions
2. Click "Add Transaction"
3. Select transaction type (expense, income, lend, rent)
4. Choose category and wallet
5. Enter amount, date, and optional note
6. Wallet balance updates automatically

#### Managing Subscriptions

1. Navigate to Finance Manager → Subscriptions
2. Click "Add Subscription"
3. Enter service name, amount, period, start date, and payment method
4. Next due date is calculated automatically
5. Use "Mark as Paid" to record payment and update next due date

#### Managing Categories

1. Navigate to Finance Manager → Categories
2. Click "Add Category"
3. Enter category name and select transaction type
4. Categories are organized by type (expense, income, lend, rent)

#### Viewing Reports

1. Navigate to Finance Manager → Reports
2. Use filters to narrow down transactions by type, category, wallet, or date range
3. View summary cards, charts, and detailed transaction lists
4. **Note**: Reports show the most recent 1000 transactions for optimal performance

### Interview Manager

#### Managing Companies

1. Navigate to Interview Manager → Companies
2. Click "Add Company"
3. Enter company name, industry, size, location, website, and optional notes
4. Companies can be linked to multiple interviews and assessments

#### Tracking Interviews

1. Navigate to Interview Manager → Interviews
2. Click "Add Interview"
3. Select company, enter role, status, and scheduled date/time
4. Optionally set interview type, interviewer name, and reference link
5. **Set Reminders**: Configure days and hours before interview to receive reminders
6. Track status through the workflow: applied → screening → interview → offer/rejected

#### Managing Assessments

1. Navigate to Interview Manager → Assessments
2. Click "Add Assessment"
3. Select company, enter title, description, and deadline
4. **Set Reminders**: Configure days before deadline to receive reminders
5. Update status as you progress (pending → in-progress → completed/submitted)
6. Mark as submitted when completed

#### Viewing Dashboard

1. Navigate to Interview Manager → Dashboard
2. View statistics cards with key metrics
3. Analyze activity trends with monthly bar charts
4. Review status distribution with pie charts
5. See upcoming interviews and assessments with visual alerts
6. Track overdue assessments

### Settings

Access unified settings from the settings icon in the header (top right):

- **Global Settings**:
  - Theme selection (Light/Dark/System)
  - Notification preferences
  - Security settings (PIN, auto-lock timeout)
  - PWA installation

- **Tool-Specific Settings**:
  - Finance Manager: Hide balances, reminder days
  - Interview Manager: Reminder preferences (configured per interview/assessment)
  - More tool settings as they're added

## Adding New Tools

The toolkit is designed to be easily extensible. To add a new tool:

1. Add tool definition to `lib/tools-registry.ts`:
```typescript
{
  id: 'your-tool',
  name: 'Your Tool Name',
  description: 'Tool description',
  icon: YourIcon,
  href: '/tools/your-tool',
  color: 'blue',
  getCriticalInfo: async () => {
    // Optional: Return critical info to display on card
    return { label: 'Metric', value: '123' }
  },
}
```

2. Create tool pages under `app/tools/your-tool/`
3. Add navigation items in `components/Sidebar.tsx` if needed

## Performance Optimizations

The app is optimized for fast navigation and data loading:

- **Parallel Database Queries**: All independent queries run in parallel using `Promise.all()` for faster page loads
- **Optimized Reports**: Limited to most recent 1000 transactions for better performance with large datasets
- **Efficient Data Loading**: Tools Hub loads all tool critical info in parallel
- **Database-Level Filtering**: Subscription alerts use database queries instead of JavaScript filtering
- **Proper Indexing**: Database schema includes indexes on frequently queried fields

### Performance Features

- **Fast Navigation**: Parallel queries reduce page load times by ~5x
- **Optimized Dashboard**: All data loads simultaneously instead of sequentially
- **Smart Caching**: Service worker caches static assets for offline access
- **Auto-Update**: PWA automatically detects and notifies about new versions

## Design Principles

- **Clean & Simple**: Minimal UI without unnecessary complexity
- **Straightforward**: Clear navigation and intuitive workflows
- **Task-Based**: Features organized by what users do, not internal structure
- **Actionable**: Dashboard prompts meaningful actions (e.g., subscription reminders)
- **Trustworthy**: Clear data presentation and secure transaction handling
- **Modular**: Each tool is self-contained but integrated into the platform
- **Performance-First**: Optimized queries and parallel data loading for fast user experience

## Database Schema

### Finance Manager
- **Wallet**: Stores virtual wallet information and balances
- **Category**: Transaction categories organized by type
- **Transaction**: Individual financial transactions linked to categories and wallets
- **Subscription**: Recurring subscription information with due dates
- **AppSettings**: Stores app settings like PIN hash and lock state

### Interview Manager
- **Company**: Company information (name, website, industry, size, location, notes)
- **Interview**: Interview records with company, role, status, scheduled date/time, reminders, and notes
- **Assessment**: Assessment records with company, title, deadline, status, reminders, and notes

## Data Safety

**Your database data is safe!** 

### Why Your Data is Safe

1. **Supabase is a Persistent Database**
   - Supabase is a managed PostgreSQL service that stores data permanently
   - Your database exists independently of your Vercel deployments
   - Data persists across all deployments, restarts, and code changes

2. **No Automatic Schema Changes on Deploy**
   - **Build script**: Only runs `prisma generate && next build` (generates Prisma Client, builds Next.js)
   - **Postinstall script**: Only runs `prisma generate` (generates Prisma Client)
   - **No `prisma db push`** is run automatically on Vercel
   - Schema changes are **NOT** applied automatically
   - Your existing data remains untouched
   - You have full control over when to update the schema

3. **Manual Schema Updates**
   When you need to update the database schema:
   - **Run locally** (recommended):
     ```bash
     # Use direct connection in .env
     npx prisma db push
     ```
   - **Or use Prisma Migrations** (better for production):
     ```bash
     npx prisma migrate dev --name your_migration_name
     ```

### What Happens on Each Vercel Deploy

1. ✅ Code is deployed
2. ✅ `prisma generate` runs (creates Prisma Client)
3. ✅ Next.js builds your app
4. ❌ **NO** database schema changes
5. ❌ **NO** data deletion
6. ❌ **NO** database resets

### Verifying Your Data is Safe

1. **Check Supabase Dashboard**:
   - Go to your Supabase project
   - Navigate to "Table Editor"
   - Your data should be visible there

2. **Use Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   - Opens a visual database browser
   - Shows all your data

3. **Query via API**:
   - Your app's API routes will show data if it exists
   - Check `/api/wallets`, `/api/transactions`, etc.

### Best Practices for Production

**Option 1: Manual Schema Updates (Current Approach)**
- ✅ Simple and works well for small projects
- ✅ You control when schema changes happen
- ⚠️ Requires manual step when schema changes

**Option 2: Prisma Migrations (Recommended for Production)**
For better safety and version control:

1. **Create a migration**:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Apply migrations in production**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Benefits**:
   - Version-controlled schema changes
   - Can review changes before applying
   - Rollback capability
   - Better for team collaboration

## Supabase Connection Guide

### Connection String Formats

**For Application/Vercel (Connection Pooler - RECOMMENDED):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```
- Use this for Vercel/production deployments
- Port: 6543 (pooler)
- Username format: `postgres.[PROJECT-REF]` (with dot)
- **Required**: Must include `?pgbouncer=true&connection_limit=1`

**For Local Development/Migrations (Direct Connection):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
- Use this for local development and `prisma db push`
- Port: 5432 (direct)
- Username: `postgres` (no dot)

### Vercel Deployment Setup

1. Go to Vercel Project Settings → Environment Variables
2. Add `DATABASE_URL` with the connection pooler URL (port 6543)
3. Make sure it includes `?pgbouncer=true&connection_limit=1`
4. Set for "Production" environment (or all environments)
5. Redeploy after updating

### Troubleshooting

#### "Can't reach database server" Error
- **Missing Query Parameters**: Connection string must include `?pgbouncer=true&connection_limit=1`
- **Wrong Port**: Use port 6543 (pooler) for Vercel, not 5432 (direct)
- **Check Pooling**: Ensure "Transaction" mode is enabled in Supabase Connection Pooling settings

#### "Circuit breaker open" Error
- **Wait 5-10 minutes** for the circuit breaker to reset
- **Verify Connection String**: Use the exact string from Supabase Dashboard (don't construct manually)
- **Check Format**: Username should be `postgres.[PROJECT-REF]` (with dot)
- **Connection Limit**: Ensure `connection_limit=1` is in the URL

#### "Authentication failed" Error
- **Get Fresh Connection String**: Copy directly from Supabase Dashboard → Connection Pooling
- **URL-Encode Password**: Special characters (`@`, `#`, `$`, `%`, `&`, `+`, `=`) must be URL-encoded
  - `@` → `%40`, `#` → `%23`, `$` → `%24`, `%` → `%25`, `&` → `%26`, `+` → `%2B`, `=` → `%3D`
- **Verify Password**: Check that password matches your Supabase database password
- **Test Locally**: Try the connection string locally first with `npx prisma studio`

#### "Table does not exist" Error
- **Push Schema**: Run `npx prisma db push` to create tables
- **Use Direct Connection**: For migrations, use the direct connection (port 5432) in your `.env`
- **Verify Tables**: Check Supabase Dashboard → Table Editor to see if tables were created

#### Migration Taking Too Long
- **Use Direct Connection**: Switch to direct connection (port 5432) in `.env` for `prisma db push`
- The pooler (port 6543) is slow for migrations but fast for application queries

## PWA Icon Generation

The app needs properly colored PNG icons for PWA installation. The logo SVG uses `currentColor` which renders as black when converted to PNG.

### Quick Solution (Recommended)

1. **Install sharp** (if not already installed):
   ```bash
   npm install --save-dev sharp
   ```

2. **Generate icons**:
   ```bash
   npm run generate-icons
   ```

This will generate:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-icon-180.png` (180x180 for iOS)
- `favicon-196.png` (196x196)

### Alternative: Online Tool

If you prefer not to install sharp, use an online tool:

1. Go to https://realfavicongenerator.net/
2. Upload `public/logo-icon.svg` (the colored version)
3. Configure:
   - Android Chrome: 192x192 and 512x512
   - iOS: 180x180
   - Favicon: 196x196
4. Download and place the icons in the `public/` directory

### Icon Files

- `logo.svg` - Original logo with `currentColor` (for in-app use)
- `logo-icon.svg` - Colored version with `#2563eb` stroke (for icon generation)

The colored version ensures icons display properly when installed as a PWA.

## PWA Features

### Auto-Update & Sync

The app includes automatic update detection:

- **Update Detection**: Checks for new versions every minute and on page focus
- **Update Notification**: Shows a banner when a new version is available
- **One-Click Update**: Click "Reload Now" to instantly update to the latest version
- **Background Sync**: Service worker handles updates seamlessly

### Offline Support

- Static assets are cached for offline access
- Service worker enables offline functionality
- Automatic cache updates when new versions are deployed

## Future Enhancements

### Platform
- More tools and apps (Interview Manager, Project Manager, etc.)
- Tool marketplace/plugins
- Custom tool builder

### Finance Manager
- User authentication and multi-user support
- Budget goals and tracking
- Export functionality (CSV, PDF)
- Mobile app
- Bank account integration
- Advanced analytics and insights

### Interview Manager
- Email integration for interview scheduling
- Calendar sync (Google Calendar, Outlook)
- Interview feedback and notes templates
- Salary negotiation tracking
- Offer comparison tools
- Application status automation

## License

MIT
