# Data Source Fix - Force Postgres Only

## Problem Identified

You're seeing:
- **API** (`/api/content/beliefs`, `/api/blog`) → Returns 4 beliefs, 4 blog posts (from Postgres) ✅
- **Main Page** → Shows "a lot more" (from filesystem) ❌

**Root Cause**: The main page is falling back to filesystem when Postgres returns null (due to connection pooling delays).

## Fix Applied

### 1. ✅ Increased Read Delays
- `getContent()`: 50ms → 200ms
- `getBlogPost()`: 50ms → 200ms
- Gives more time for connection pooling to make data visible

### 2. ✅ Removed Filesystem Fallback When Postgres Available
- `readJSON()`: No longer falls back to filesystem if Postgres is available
- `readMarkdownFiles()`: No longer falls back to filesystem if Postgres is available
- **Result**: Main page and CMS now use the same data source (Postgres)

## What This Means

**Before:**
- Postgres returns null → Falls back to filesystem → Shows old data
- Main page and CMS show different data

**After:**
- Postgres returns null → Returns null (no fallback)
- Main page and CMS both use Postgres only
- Both show the same data (from Postgres)

## Next Steps

1. **Deploy the changes**:
   ```bash
   git add lib/content.ts lib/db.ts
   git commit -m "Force Postgres-only data source, remove filesystem fallback"
   git push
   ```

2. **After deployment**:
   - Main page should show the same data as API (4 beliefs, 4 blog posts)
   - Both reading from Postgres
   - No more filesystem fallback

3. **If main page shows empty**:
   - Check Vercel logs for: `⚠️ No content found for key: beliefs`
   - This means data isn't in Postgres yet
   - Save content in CMS to migrate it to Postgres

4. **Clean up old filesystem data** (optional):
   - The old files in `content/` won't be used anymore
   - You can delete them if you want (backup first!)
   - They're not being read since we're forcing Postgres-only

## Expected Behavior

After fix:
- ✅ Main page shows 4 beliefs (from Postgres)
- ✅ Main page shows 4 blog posts (from Postgres)
- ✅ CMS shows 4 beliefs (from Postgres)
- ✅ CMS shows 4 blog posts (from Postgres)
- ✅ Both match exactly

## If Issues Persist

If main page shows empty after fix:

1. **Check if data is in Postgres**:
   - Visit `/api/db-check`
   - Check `records.contentCount` and `records.blogPostsCount`

2. **Migrate filesystem data to Postgres**:
   - If you have old data in filesystem you want to keep
   - Open CMS → Edit Beliefs/Explore
   - The data should load from filesystem
   - Click "Save" to migrate it to Postgres

3. **Check Vercel logs**:
   - Look for: `✅ Read beliefs.json from Postgres`
   - If you see: `⚠️ No content found for key: beliefs`
   - Then data needs to be saved to Postgres first

The fix ensures both main page and CMS use Postgres only, eliminating the data mismatch!

