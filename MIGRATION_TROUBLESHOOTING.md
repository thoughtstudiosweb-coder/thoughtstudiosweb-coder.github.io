# Migration Troubleshooting Guide

## Error: "Database initialization failed"

This error can occur for several reasons. Follow these steps to diagnose and fix:

### Step 1: Check Vercel Function Logs

1. Go to **Vercel Dashboard → Your Project → Logs**
2. Look for errors related to `/api/migrate`
3. Check for specific error messages like:
   - "Postgres not available"
   - "Connection refused"
   - "Invalid connection string"
   - SQL syntax errors

### Step 2: Verify Environment Variables

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Verify `POSTGRES_URL` exists and is set for **Production** environment
3. The value should look like: `postgres://user:password@host:port/database`

**Common Issues:**
- `POSTGRES_URL` is set for Preview/Development but not Production
- `POSTGRES_URL` is empty or incorrect
- Postgres was created but environment variable wasn't added

### Step 3: Verify Postgres Connection

The Postgres database must be:
1. **Created** in Vercel Dashboard → Storage tab
2. **Connected** to your project
3. **Environment variable added** automatically (or manually)

**To verify:**
- Go to Vercel Dashboard → Storage tab
- You should see your Postgres database listed
- Click on it to see connection details

### Step 4: Check Postgres Availability

The code checks for Postgres using these environment variables:
- `POSTGRES_URL` (primary)
- `POSTGRES_PRISMA_URL` (alternative)
- `POSTGRES_URL_NON_POOLING` (alternative)

Make sure at least one of these is set.

### Step 5: Common Error Messages & Solutions

#### "Postgres is not available"
- **Solution**: Add `POSTGRES_URL` to environment variables in Production
- **Action**: Go to Settings → Environment Variables → Add `POSTGRES_URL`

#### "Connection refused" or "Connection timeout"
- **Solution**: Postgres database might not be running or accessible
- **Action**: Check Vercel Dashboard → Storage → Verify database is active

#### "Invalid connection string"
- **Solution**: `POSTGRES_URL` format is incorrect
- **Action**: Recreate Postgres database or verify the connection string format

#### "Permission denied" or "Access denied"
- **Solution**: Database user doesn't have CREATE TABLE permissions
- **Action**: This shouldn't happen with Vercel Postgres, but if it does, contact Vercel support

### Step 6: Manual Migration Test

You can test the Postgres connection manually:

1. **Check if Postgres is detected:**
   ```javascript
   // In browser console after logging in:
   fetch('/api/migrate', { 
     method: 'POST', 
     credentials: 'include' 
   })
     .then(r => r.json())
     .then(console.log)
   ```

2. **Check the response:**
   - If you see `{error: "Postgres is not available..."}` → Environment variable issue
   - If you see SQL errors → Database connection or permissions issue
   - If you see `{success: true}` → Migration succeeded!

### Step 7: Redeploy After Fixing

After fixing environment variables:
1. Go to **Vercel Dashboard → Deployments**
2. Click **"Redeploy"** on the latest deployment
3. This ensures new environment variables are available

### Step 8: Verify Migration Success

After successful migration, you should be able to:
1. Create blog posts in `/admin/blog`
2. Edit content in `/admin/welcome`, `/admin/beliefs`, etc.
3. All changes should persist (not be lost on redeploy)

## Still Having Issues?

1. **Check Vercel Status**: https://vercel-status.com
2. **Review Function Logs**: Detailed error messages in Vercel Dashboard
3. **Contact Vercel Support**: If Postgres is set up but still not working

## Quick Checklist

- [ ] Postgres database exists in Storage tab
- [ ] `POSTGRES_URL` is in environment variables (Production)
- [ ] Project has been redeployed after adding environment variables
- [ ] Checked Vercel function logs for specific error messages
- [ ] Tried running migration again after redeploy

