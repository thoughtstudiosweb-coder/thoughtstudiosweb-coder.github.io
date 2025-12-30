# Neon DB Configuration Guide

## Quick Diagnostic

Run this to check your database configuration:

```bash
# After deploying, visit:
https://your-site.vercel.app/api/db-check
```

This will show you:
- ✅ Environment variables status
- ✅ Connection status
- ✅ Tables existence
- ✅ Record counts
- ✅ What needs to be fixed

## Step-by-Step Configuration

### 1. Get Your Neon DB Connection String

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in or create an account
3. Create a new project (or use existing)
4. Go to your project dashboard
5. Click on **"Connection Details"** or **"Connection String"**
6. Copy the connection string

**Neon DB connection strings look like:**
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 2. Set Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Key**: `POSTGRES_URL`
   - **Value**: Your Neon DB connection string (paste the full string)
   - **Environment**: Select **Production** (and Preview/Development if needed)
5. Click **Save**

**Important**: 
- Use the **pooled connection string** (not the direct connection)
- Include the full string including `?sslmode=require`
- Make sure it's set for **Production** environment

### 3. Verify Environment Variable

After adding the environment variable:

1. **Redeploy** your project (Vercel Dashboard → Deployments → Click "..." → Redeploy)
2. Wait for deployment to complete
3. Visit: `https://your-site.vercel.app/api/db-check`
4. Check the response:
   - `POSTGRES_URL: true` ✅
   - `isAvailable: true` ✅
   - `connection.success: true` ✅

### 4. Run Database Migration

Once connection is verified:

1. Log into your admin panel: `https://your-site.vercel.app/admin`
2. Open Browser DevTools (F12) → Console
3. Run:
   ```javascript
   fetch('/api/migrate', { 
     method: 'POST', 
     credentials: 'include' 
   })
     .then(r => r.json())
     .then(console.log)
   ```
4. You should see: `{success: true, message: "Database initialized successfully"}`

### 5. Verify Tables Created

Check the `/api/db-check` endpoint again:
- `tables.contentTableExists: true` ✅
- `tables.blogPostsTableExists: true` ✅

## Common Issues & Fixes

### Issue 1: "Postgres not available"

**Symptoms:**
- `isAvailable: false` in `/api/db-check`
- `POSTGRES_URL: false`

**Fix:**
1. Verify `POSTGRES_URL` is set in Vercel environment variables
2. Make sure it's set for **Production** environment
3. Redeploy after adding the variable
4. Check the connection string is complete (includes `?sslmode=require`)

### Issue 2: "Connection failed"

**Symptoms:**
- `connection.success: false` in `/api/db-check`
- Error: "Connection refused" or "Connection timeout"

**Fix:**
1. Verify your Neon DB project is **not paused**
2. Check the connection string is correct
3. Try using the **pooled connection string** (not direct)
4. Verify network access in Neon DB settings
5. Make sure SSL is enabled (`?sslmode=require`)

### Issue 3: "Tables don't exist"

**Symptoms:**
- `tables.contentTableExists: false`
- `needsMigration: true`

**Fix:**
1. Run the migration: `POST /api/migrate`
2. Check logs for errors
3. Verify you're logged in as admin
4. Check `/api/db-check` again after migration

### Issue 4: "Connection string format error"

**Symptoms:**
- Error about invalid connection string
- Connection fails immediately

**Fix:**
1. Verify the connection string starts with `postgresql://` or `postgres://`
2. Make sure it includes the full path: `host/database?sslmode=require`
3. Check for special characters that need encoding
4. Try copying the connection string again from Neon console

### Issue 5: "@vercel/postgres not compatible"

**Symptoms:**
- Error about `@vercel/postgres` package
- Connection works but queries fail

**Note**: `@vercel/postgres` **IS compatible** with Neon DB! It works with any standard PostgreSQL connection string.

If you get errors:
1. Make sure you're using the latest version: `npm install @vercel/postgres@latest`
2. The connection string format should be standard PostgreSQL format
3. Neon DB connection strings work with `@vercel/postgres` out of the box

## Verification Checklist

After configuration, verify:

- [ ] `POSTGRES_URL` is set in Vercel environment variables
- [ ] Environment variable is set for **Production**
- [ ] Project has been redeployed after adding variable
- [ ] `/api/db-check` shows `isAvailable: true`
- [ ] `/api/db-check` shows `connection.success: true`
- [ ] Migration has been run (`POST /api/migrate`)
- [ ] `/api/db-check` shows tables exist
- [ ] Can create blog posts in CMS
- [ ] Can save beliefs/explore content in CMS
- [ ] Content appears on main website

## Testing Locally

For local development:

1. Create `.env.local` file:
   ```env
   POSTGRES_URL=your-neon-connection-string-here
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-password
   JWT_SECRET=your-jwt-secret-min-32-chars
   ```

2. Run migration:
   ```bash
   npm run dev
   # Then visit http://localhost:3000/api/db-check
   # And run POST /api/migrate from admin panel
   ```

## Need Help?

If you're still having issues:

1. **Check `/api/db-check`** - This shows exactly what's wrong
2. **Check Vercel Logs** - Look for database connection errors
3. **Check Neon DB Console** - Verify your project is active
4. **Verify Connection String** - Make sure it's the pooled connection string

The `/api/db-check` endpoint will tell you exactly what needs to be fixed!

