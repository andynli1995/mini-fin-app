# Database Data Safety

## ✅ Your Data is Safe!

**Good news:** Your database data is **NOT** lost when you deploy to Vercel. Here's why:

### 1. Supabase is a Persistent Database
- Supabase is a managed PostgreSQL service that stores data permanently
- Your database exists independently of your Vercel deployments
- Data persists across all deployments, restarts, and code changes

### 2. No Automatic Schema Changes on Deploy
Looking at your `package.json`:
- **Build script**: Only runs `prisma generate && next build` (generates Prisma Client, builds Next.js)
- **Postinstall script**: Only runs `prisma generate` (generates Prisma Client)
- **No `prisma db push`** is run automatically on Vercel

This means:
- ✅ Schema changes are **NOT** applied automatically
- ✅ Your existing data remains untouched
- ✅ You have full control over when to update the schema

### 3. Manual Schema Updates
When you need to update the database schema (like adding the new `AppSettings` table):

1. **Run locally** (recommended):
   ```bash
   # Use direct connection in .env
   npx prisma db push
   ```

2. **Or use Prisma Migrations** (better for production):
   ```bash
   npx prisma migrate dev --name add_app_settings
   ```

## Best Practices for Production

### Option 1: Manual Schema Updates (Current Approach)
- ✅ Simple and works well for small projects
- ✅ You control when schema changes happen
- ⚠️ Requires manual step when schema changes

### Option 2: Prisma Migrations (Recommended for Production)
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

## Verifying Your Data is Safe

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

## What Happens on Each Vercel Deploy

1. ✅ Code is deployed
2. ✅ `prisma generate` runs (creates Prisma Client)
3. ✅ Next.js builds your app
4. ❌ **NO** database schema changes
5. ❌ **NO** data deletion
6. ❌ **NO** database resets

## When You Add New Tables/Fields

When you update `prisma/schema.prisma`:

1. **Local Development**:
   ```bash
   npx prisma db push  # Updates your Supabase database
   ```

2. **Vercel Deployment**:
   - Just push your code
   - The new schema is in your code
   - But tables are only created when you run `prisma db push` locally
   - Or when you apply migrations

## Summary

- ✅ **Data is persistent** - stored in Supabase, not Vercel
- ✅ **No automatic schema changes** - `prisma db push` is NOT run on deploy
- ✅ **Full control** - you decide when to update schema
- ✅ **Safe deployments** - code changes don't affect existing data

Your financial data is safe! 🎉
