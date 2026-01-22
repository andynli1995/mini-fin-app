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
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```
   - Replace `[YOUR-PASSWORD]` with your database password
   - Replace `[PROJECT-REF]` with your project reference ID
   - Replace `[REGION]` with your region (e.g., `us-east-1`, `eu-west-1`)

5. **For Vercel Deployment**
   - Go to your Vercel project settings > Environment Variables
   - Add environment variable `DATABASE_URL` with your Supabase connection pooler URL
   - **IMPORTANT**: Use the connection pooler URL format (port 6543) for Vercel:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   - You can find this in Supabase Dashboard > Settings > Database > Connection Pooling > Connection String
   - Make sure to select "Transaction" mode for the pooler

6. **Push Database Schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Connection String Formats

### For Application/Vercel (Connection Pooler - RECOMMENDED)
Use the connection pooler URL for production deployments like Vercel:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**How to get this:**
1. Go to Supabase Dashboard > Settings > Database
2. Scroll to "Connection Pooling"
3. Select "Transaction" mode
4. Copy the connection string (it will use port 6543)

### For Local Development (Direct Connection)
For local development and migrations, you can use the direct connection:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Note:** The direct connection (port 5432) may not work on Vercel due to IP restrictions. Always use the pooler URL (port 6543) for Vercel.

## Security Notes

- Never commit your `.env` file to git
- The `.env` file is already in `.gitignore`
- Use environment variables in production (Vercel, etc.)
- Keep your database password secure

## Troubleshooting

### Connection Errors on Vercel
If you see "Can't reach database server" errors on Vercel:

1. **Use Connection Pooler URL**: Make sure you're using the pooler URL (port 6543), not the direct connection (port 5432)
   - Pooler URL format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
   - Direct URL format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Check Connection Pooling Settings**:
   - Go to Supabase Dashboard > Settings > Database > Connection Pooling
   - Make sure "Transaction" mode is enabled
   - Copy the connection string from there

3. **Verify Environment Variable**:
   - In Vercel, go to Project Settings > Environment Variables
   - Make sure `DATABASE_URL` is set correctly
   - Redeploy after updating the environment variable

4. **IP Restrictions**: 
   - The connection pooler doesn't require IP allowlisting
   - If using direct connection, you may need to allow Vercel's IP ranges

### Other Issues
- **Schema errors**: Run `npx prisma generate` after schema changes
- **Migration issues**: Use the direct connection string (port 5432) for local migrations, but use pooler URL for Vercel
