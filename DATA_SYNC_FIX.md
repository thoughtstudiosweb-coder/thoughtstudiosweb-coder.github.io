# Data Synchronization Fix

## Problem Identified

There's a **data source mismatch** between the main page and CMS:

1. **Main Page** (`app/page.tsx`):
   - Uses `readJSON()` and `readMarkdownFiles()` directly
   - These functions try Postgres first, then fall back to filesystem
   - **Result**: Shows old filesystem data if Postgres returns null

2. **CMS** (`app/admin/*`):
   - Uses API routes (`/api/content/*`, `/api/blog`)
   - API routes also use `readJSON()` and `readMarkdownFiles()`
   - **Result**: Shows Postgres data (or nothing if Postgres fails)

## Root Cause

When Postgres is available but returns `null` (data not found), the code falls back to filesystem. This means:
- Old data in filesystem shows on main page
- New data in Postgres doesn't show if verification fails
- CMS and main page can show different data

## Fixes Applied

### 1. Enhanced Logging
- Added logging to track which data source is being used
- Logs when Postgres is checked vs filesystem fallback
- Helps diagnose data source mismatches

### 2. Better Error Handling
- Improved `getContent()` to log when content is found/not found
- Better visibility into what's happening

### 3. Consistent Data Source
- Both main page and CMS now use the same functions
- Both should read from the same source (Postgres if available)

## Next Steps

### 1. Check Your Database

Verify data is actually in Postgres:

```sql
-- Check beliefs
SELECT key, value FROM content WHERE key = 'beliefs';

-- Check blog posts
SELECT slug, title, date FROM blog_posts ORDER BY date DESC;

-- Check explore
SELECT key, value FROM content WHERE key = 'explore';
```

### 2. Check Logs

After deploying, check Vercel logs for:
- `✅ Found content for key: beliefs` - Data found in Postgres
- `⚠️ No content found for key: beliefs` - Data not in Postgres
- `📁 Read beliefs.json from filesystem` - Falling back to filesystem
- `📝 Retrieved X blog posts from Postgres` - Blog posts from Postgres

### 3. Migrate Old Data (If Needed)

If you have old data in filesystem that needs to be in Postgres:

1. **For beliefs/explore/welcome**:
   - Open the CMS
   - The data should load from filesystem
   - Click "Save" to migrate it to Postgres

2. **For blog posts**:
   - Old markdown files in `content/blog/` need to be manually migrated
   - Or they'll be read from filesystem until migrated

### 4. Verify Postgres Connection

Make sure `POSTGRES_URL` is set correctly:
- Check Vercel environment variables
- Test connection in Neon DB console
- Run migration: `POST /api/migrate`

## Expected Behavior After Fix

1. **Main page and CMS should show the same data**
2. **Both should read from Postgres if available**
3. **Logs will show which source is being used**
4. **No more data mismatches**

## If Issues Persist

1. **Check if Postgres is actually available**:
   - Look for `⚠️ Postgres not available` in logs
   - Verify `POSTGRES_URL` is set

2. **Check if data is in Postgres**:
   - Query the database directly
   - Check logs for `✅ Found content for key: ...`

3. **Check connection pooling delays**:
   - Data might be saved but not immediately readable
   - The retry logic should handle this, but delays might need adjustment

4. **Clear filesystem data** (if you want to force Postgres-only):
   - Remove old files from `content/` directory
   - This forces everything to use Postgres

