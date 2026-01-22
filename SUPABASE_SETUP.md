# Supabase Setup Guide

## Getting Started with Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose an organization
   - Enter project name and database password
   - Select a region close to you
   - Wait for the project to be created (takes ~2 minutes)

3. **Get Your Database Connection String**
   - Go to Project Settings > Database
   - Find the "Connection string" section
   - Copy the "URI" connection string
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

4. **Set Up Environment Variables**
   - Create a `.env` file in the root directory
   - Add your connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```
   - Replace `[YOUR-PASSWORD]` with your database password
   - Replace `[PROJECT-REF]` with your project reference ID

5. **For Vercel Deployment**
   - Go to your Vercel project settings
   - Add environment variable `DATABASE_URL` with your Supabase connection string
   - Use the connection pooler URL (with `?pgbouncer=true`) for better performance

6. **Push Database Schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Connection String Formats

### For Application (with connection pooling)
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### For Migrations (direct connection)
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

## Security Notes

- Never commit your `.env` file to git
- The `.env` file is already in `.gitignore`
- Use environment variables in production (Vercel, etc.)
- Keep your database password secure

## Troubleshooting

- **Connection errors**: Make sure your IP is allowed in Supabase (Settings > Database > Connection Pooling)
- **Schema errors**: Run `npx prisma generate` after schema changes
- **Migration issues**: Use the direct connection string (without pgbouncer) for migrations
