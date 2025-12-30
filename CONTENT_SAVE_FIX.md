# Content Save Error - 405 Method Not Allowed

## Error You're Seeing

- `/api/content/explore` - 405 error (Method Not Allowed)
- "error saving" message

## What 405 Means

A 405 error means the HTTP method (PUT) isn't allowed for that endpoint. This could happen if:
1. The route file isn't properly deployed
2. There's a Next.js routing cache issue
3. The route handler isn't being recognized

## Solutions Applied

### ✅ Improved Error Handling
- Better error messages with hints
- More detailed logging
- Clearer feedback when save fails

### ✅ Better Client-Side Error Handling
- Shows specific error messages
- Displays hints from server
- Better error logging in console

## Troubleshooting Steps

### Step 1: Verify Route File Exists
The route file should be at: `app/api/content/explore/route.ts`

It should export:
- `GET` function (for reading)
- `PUT` function (for saving)

### Step 2: Check Vercel Function Logs
1. Go to **Vercel Dashboard → Your Project → Logs**
2. Look for errors related to `/api/content/explore`
3. Check for specific error messages

### Step 3: Verify Postgres is Set Up
The save operation requires Postgres on Vercel:

1. **Check Postgres is configured:**
   - Go to Vercel Dashboard → Storage
   - You should see Postgres database listed

2. **Verify environment variables:**
   - Go to Settings → Environment Variables
   - Ensure `POSTGRES_URL` is set for Production

3. **Check migration status:**
   - Database migration should have been run
   - If not, run: `POST /api/migrate` (requires admin login)

### Step 4: Clear Cache and Redeploy
If the route file exists but still getting 405:

1. **Clear Vercel build cache:**
   - Go to Deployments tab
   - Click "Redeploy" → Select "Clear cache and redeploy"

2. **Or push a new commit:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

### Step 5: Test the Route Directly
You can test if the route is working:

1. **Test GET (should work):**
   ```bash
   curl https://your-domain.vercel.app/api/content/explore
   ```

2. **Test PUT (requires auth):**
   - Log into `/admin` first
   - Then try saving in the admin panel
   - Check browser console for detailed error messages

## Common Issues

### Issue 1: Postgres Not Configured
**Symptom:** Save fails with "Failed to save" error

**Solution:**
- Set up Vercel Postgres (see POSTGRES_SETUP.md)
- Run database migration
- Redeploy

### Issue 2: Route Not Deployed
**Symptom:** 405 error persists after redeploy

**Solution:**
- Verify `app/api/content/explore/route.ts` exists
- Check it's committed to git
- Clear cache and redeploy

### Issue 3: Session Expired
**Symptom:** 401 Unauthorized error

**Solution:**
- Log out and log back into `/admin`
- Check that session cookie is being set

## What to Check

1. **Vercel Function Logs:**
   - Look for specific error messages
   - Check if PUT method is being received
   - Look for Postgres connection errors

2. **Browser Console:**
   - Check Network tab for the actual request
   - See the full error response
   - Check if PUT method is being sent

3. **Environment Variables:**
   - `POSTGRES_URL` must be set
   - Should be available in Production environment
   - Redeploy after adding/changing

## Expected Behavior

After fixes:
- ✅ GET `/api/content/explore` returns explore content
- ✅ PUT `/api/content/explore` saves content to Postgres
- ✅ Success message shows in admin panel
- ✅ Content persists across deployments

## Still Having Issues?

1. **Check the specific error message:**
   - The improved error handling will show exactly what's wrong
   - Look for hints in the error message

2. **Verify all requirements:**
   - Postgres is set up
   - Migration has been run
   - Environment variables are correct
   - Route file exists and is deployed

3. **Check Vercel Status:**
   - https://vercel-status.com
   - Make sure Vercel services are operational

The improved error messages should now guide you to the exact issue! 🎯

