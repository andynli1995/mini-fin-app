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
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > Database > Connection Pooling
   - Select "Transaction" mode and copy the connection string
   - Create a `.env` file in the root directory:
   ```bash
   # For local development (use direct connection)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   
   # For Vercel/production (use connection pooler - port 6543)
   # DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

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

## Future Enhancements

- User authentication and multi-user support
- Budget goals and tracking
- Export functionality (CSV, PDF)
- Mobile app
- Bank account integration
- Advanced analytics and insights

## License

MIT
