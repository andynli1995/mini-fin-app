# Personal Finance Management App

A clean, simple, and straightforward web-based personal financial management application built with Next.js, TypeScript, and Prisma.

## Features

### Core Features

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

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

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
mini-fin-app/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── transactions/   # Transaction endpoints
│   │   ├── wallets/        # Wallet endpoints
│   │   ├── subscriptions/  # Subscription endpoints
│   │   └── categories/     # Category endpoints
│   ├── transactions/       # Transactions page
│   ├── wallets/            # Wallets page
│   ├── subscriptions/      # Subscriptions page
│   ├── reports/            # Reports page
│   ├── categories/         # Categories page
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Navigation.tsx      # Navigation bar
│   ├── TransactionForm.tsx # Transaction form
│   ├── WalletCard.tsx      # Wallet display card
│   ├── RemindersBanner.tsx # Subscription reminders
│   └── ...
├── lib/                    # Utility functions
│   └── prisma.ts           # Prisma client
├── prisma/                 # Database schema
│   └── schema.prisma       # Prisma schema
└── public/                 # Static assets
```

## Usage

### Creating Wallets

1. Navigate to the Wallets page
2. Click "Add Wallet"
3. Enter wallet name, type, currency, and initial balance
4. Wallets automatically track balance based on transactions

### Recording Transactions

1. Navigate to the Transactions page
2. Click "Add Transaction"
3. Select transaction type (expense, income, lend, rent)
4. Choose category and wallet
5. Enter amount, date, and optional note
6. Wallet balance updates automatically

### Managing Subscriptions

1. Navigate to the Subscriptions page
2. Click "Add Subscription"
3. Enter service name, amount, period, start date, and payment method
4. Next due date is calculated automatically
5. Use "Mark as Paid" to record payment and update next due date

### Managing Categories

1. Navigate to the Categories page
2. Click "Add Category"
3. Enter category name and select transaction type
4. Categories are organized by type (expense, income, lend, rent)

### Viewing Reports

1. Navigate to the Reports page
2. Use filters to narrow down transactions by type, category, wallet, or date range
3. View summary cards, charts, and detailed transaction lists

## Design Principles

- **Clean & Simple**: Minimal UI without unnecessary complexity
- **Straightforward**: Clear navigation and intuitive workflows
- **Task-Based**: Features organized by what users do, not internal structure
- **Actionable**: Dashboard prompts meaningful actions (e.g., subscription reminders)
- **Trustworthy**: Clear data presentation and secure transaction handling

## Database Schema

- **Wallet**: Stores virtual wallet information and balances
- **Category**: Transaction categories organized by type
- **Transaction**: Individual financial transactions linked to categories and wallets
- **Subscription**: Recurring subscription information with due dates
- **AppSettings**: Stores app settings like PIN hash and lock state

## Data Safety

**Your database data is safe!** 

- ✅ Supabase is a persistent database - data is stored permanently
- ✅ Schema changes are **NOT** applied automatically on Vercel deployments
- ✅ Only `prisma generate` runs during build (creates Prisma Client)
- ✅ `prisma db push` is **NOT** run automatically - you control when schema updates happen

See [DATABASE_SAFETY.md](./DATABASE_SAFETY.md) for detailed information about data persistence and safety.

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

## Future Enhancements

- User authentication and multi-user support
- Budget goals and tracking
- Export functionality (CSV, PDF)
- Mobile app
- Bank account integration
- Advanced analytics and insights

## License

MIT
