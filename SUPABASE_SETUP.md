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
   - **CRITICAL**: The connection string MUST include the query parameters `?pgbouncer=true&connection_limit=1`
   - You can find this in Supabase Dashboard > Settings > Database > Connection Pooling > Connection String
   - Make sure to select "Transaction" mode for the pooler
   - Copy the ENTIRE connection string including the query parameters

6. **Push Database Schema**
   
   **Important**: For migrations (`prisma db push`), use the direct connection (port 5432), not the pooler.
   
   - Get the direct connection string from Supabase Dashboard → Settings → Database → Connection string (URI)
   - Temporarily update your `.env` file with the direct connection:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
   
   Then run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   
   After the schema is pushed, you can switch back to the pooler URL for your application.
   
   **Alternative**: You can also use two different environment variables:
   - `DATABASE_URL` - for application (pooler, port 6543)
   - `DATABASE_URL_DIRECT` - for migrations (direct, port 5432)
   
   Then run: `DATABASE_URL=$(cat .env | grep DATABASE_URL_DIRECT | cut -d '=' -f2) npx prisma db push`

## Connection String Formats

### For Application/Vercel (Connection Pooler - RECOMMENDED)
Use the connection pooler URL for production deployments like Vercel:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**IMPORTANT**: The query parameters `?pgbouncer=true&connection_limit=1` are REQUIRED for the pooler to work correctly.

**How to get this:**
1. Go to Supabase Dashboard > Settings > Database
2. Scroll to "Connection Pooling"
3. Select "Transaction" mode
4. Copy the connection string (it will use port 6543)
5. Make sure the copied string includes `?pgbouncer=true&connection_limit=1` at the end

### For Local Development (Direct Connection)
For local development and migrations, you can use the direct connection:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Note:** The direct connection (port 5432) may not work on Vercel due to IP restrictions. Always use the pooler URL (port 6543) for Vercel.

### Alternative: Direct Connection for Vercel (If Pooler Fails)
If the connection pooler continues to have issues on Vercel, you can try the direct connection:

1. **Get Direct Connection String**:
   - Go to Supabase Dashboard > Settings > Database
   - Copy the "Connection string" (URI) - this is the direct connection
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Allow Vercel IPs** (if needed):
   - Go to Supabase Dashboard > Settings > Database > Network Restrictions
   - Add Vercel's IP ranges or set to "Allow all IPs" (for testing)
   - Vercel IP ranges can be found in Vercel's documentation

3. **Use in Vercel**:
   - Set `DATABASE_URL` in Vercel to the direct connection string
   - Note: This may have connection limits, so pooler is still recommended

## Security Notes

- Never commit your `.env` file to git
- The `.env` file is already in `.gitignore`
- Use environment variables in production (Vercel, etc.)
- Keep your database password secure

## Troubleshooting

### Connection Errors on Vercel

#### "Can't reach database server" Error
If you see this error, check the following:

1. **Missing Query Parameters**: The connection string MUST include `?pgbouncer=true&connection_limit=1`
   - ❌ Wrong: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - ✅ Correct: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

2. **Use Connection Pooler URL**: Make sure you're using the pooler URL (port 6543), not the direct connection (port 5432)
   - Pooler URL format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
   - Direct URL format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Check Connection Pooling is Enabled**:
   - Go to Supabase Dashboard > Settings > Database > Connection Pooling
   - Make sure "Transaction" mode is enabled
   - If it's not enabled, enable it and wait a few minutes for it to activate

#### "Circuit breaker open" Error
If you see "Circuit breaker open: Failed to retrieve database credentials":

This error occurs when Supabase's connection pooler detects too many failed connection attempts. This is a protection mechanism.

**Solutions:**

1. **Wait and Retry**: 
   - The circuit breaker will reset after a few minutes
   - Wait 2-5 minutes and try again

2. **Check Connection String Format**:
   - Make sure you're using the exact connection string from Supabase Dashboard
   - It should include `?pgbouncer=true&connection_limit=1`
   - The username format should be `postgres.[PROJECT-REF]` (with dot)

3. **Use Direct Connection for Vercel** (Alternative):
   - If the pooler continues to have issues, you can try the direct connection
   - Go to Supabase Dashboard > Settings > Database
   - Copy the "Connection string" (URI) - this is the direct connection
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **Note**: You may need to allow Vercel's IP ranges in Supabase (Settings > Database > Network Restrictions)
   - Or set "Allow all IPs" temporarily for testing

4. **Reduce Connection Limit**:
   - Make sure `connection_limit=1` is in your connection string
   - This is important for serverless environments like Vercel

5. **Verify Environment Variable**:
   - In Vercel, make sure `DATABASE_URL` is set correctly
   - Check for any extra spaces, line breaks, or encoding issues
   - Try removing and re-adding the environment variable

6. **Check Supabase Project Status**:
   - Make sure your Supabase project is active and not paused
   - Free tier projects can pause after inactivity

#### "Authentication failed" Error
If you see "Authentication failed" or "provided database credentials are not valid":

1. **Get the Correct Connection String**:
   - Go to Supabase Dashboard > Settings > Database > Connection Pooling
   - Select "Transaction" mode (not Session mode)
   - Click "Copy" to get the exact connection string
   - **Do NOT manually construct it** - use the one Supabase provides

2. **URL-Encode Special Characters in Password**:
   - If your password contains special characters (`@`, `#`, `$`, `%`, `&`, `+`, `=`, etc.), they must be URL-encoded
   - Common encodings:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`
   - Example: If password is `P@ssw0rd#123`, use `P%40ssw0rd%23123`

3. **Verify Password**:
   - Double-check that the password in your connection string matches your Supabase database password
   - You can reset it in Supabase Dashboard > Settings > Database > Database Password

4. **Check Connection String Format**:
   - The pooler connection string should have the format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?pgbouncer=true&connection_limit=1`
   - Make sure there are no extra spaces or line breaks
   - The username should be `postgres.[PROJECT-REF]` (with the dot), not just `postgres`

5. **Verify Environment Variable in Vercel**:
   - Go to Vercel Project Settings > Environment Variables
   - Check that `DATABASE_URL` is set correctly
   - Make sure it's set for "Production" environment (or all environments)
   - After updating, trigger a new deployment

6. **Test Connection Locally First**:
   - Copy the connection string to your local `.env` file
   - Test with: `npx prisma db pull` or `npx prisma studio`
   - If it works locally but not on Vercel, double-check the Vercel environment variable

### Other Issues
- **Schema errors**: Run `npx prisma generate` after schema changes
- **Migration issues**: Use the direct connection string (port 5432) for local migrations, but use pooler URL for Vercel
