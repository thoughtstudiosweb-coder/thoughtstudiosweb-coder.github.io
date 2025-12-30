# Image Upload Issues - Fixed

## Errors You Were Seeing

1. **`/api/upload` - 500 error**: Image upload failing
2. **`/uploads/1767108243291_Northville_Christmas.png` - 404 error**: Image not found
3. **`/api/blog/create` - 500 error**: Blog post creation failing (related to image URL)

## Root Causes

### 1. Missing Vercel Blob Storage
On Vercel, the filesystem is **read-only**. Image uploads require **Vercel Blob Storage** to work.

### 2. Old Filesystem URLs
The 404 error suggests an image was uploaded to the local filesystem during development, but that path doesn't exist on Vercel.

## Solutions Applied

### ✅ Improved Error Handling
- Upload route now provides clear error messages
- Explains exactly what's needed (Blob Storage setup)
- Shows helpful hints in error messages

### ✅ Better Vercel Detection
- On Vercel, requires Blob Storage (no filesystem fallback)
- On local dev, tries Blob Storage first, then falls back to filesystem
- Clear error messages if Blob Storage is missing

## What You Need to Do

### Step 1: Set Up Vercel Blob Storage

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Click **"Storage"** tab

2. **Create Blob Database:**
   - Click **"Create Database"**
   - Select **"Blob"**
   - This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables

3. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   - This ensures the new environment variable is available

### Step 2: Verify Environment Variables

Go to **Vercel Dashboard → Settings → Environment Variables** and verify:
- ✅ `BLOB_READ_WRITE_TOKEN` exists (auto-added when Blob is created)
- ✅ `POSTGRES_URL` exists (for content)
- ✅ `ADMIN_EMAIL` exists
- ✅ `ADMIN_PASSWORD` exists
- ✅ `JWT_SECRET` exists

### Step 3: Fix Old Image URLs

If you have blog posts or content with old filesystem image URLs (like `/uploads/1767108243291_Northville_Christmas.png`):

1. **Option A: Re-upload the images**
   - Go to the admin panel
   - Edit the content/blog post
   - Re-upload the image (it will now save to Blob Storage)

2. **Option B: Use external image URLs**
   - Paste the full URL of images hosted elsewhere
   - The ImageUpload component accepts any image URL

### Step 4: Test Image Upload

After setting up Blob Storage and redeploying:

1. Go to `/admin/blog` or any content editor
2. Try uploading an image
3. It should now work and return a Blob Storage URL (like `https://xxx.public.blob.vercel-storage.com/...`)

## How It Works Now

### On Vercel (Production):
- ✅ **Requires Blob Storage** - Clear error if not set up
- ✅ **Uploads to Blob Storage** - Persistent, CDN-delivered
- ✅ **Returns Blob URLs** - Full URLs like `https://xxx.public.blob.vercel-storage.com/...`

### On Local Development:
- ✅ **Tries Blob Storage first** (if `BLOB_READ_WRITE_TOKEN` is set)
- ✅ **Falls back to filesystem** (saves to `/public/uploads/`)
- ✅ **Works either way** - Flexible for development

## Error Messages You'll See

### If Blob Storage Not Set Up:
```
Vercel Blob Storage is required for file uploads on Vercel.
Go to Vercel Dashboard → Your Project → Storage → Create Database → Select "Blob"
```

### If Blob Upload Fails:
```
Failed to upload to Blob Storage: [specific error]
Check that BLOB_READ_WRITE_TOKEN is correct in your environment variables.
```

## Quick Checklist

- [ ] Blob Storage created in Vercel Dashboard → Storage
- [ ] `BLOB_READ_WRITE_TOKEN` in environment variables (auto-added)
- [ ] Project redeployed after Blob Storage setup
- [ ] Test image upload in admin panel
- [ ] Old filesystem image URLs replaced with Blob URLs or external URLs

## Still Having Issues?

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Logs
   - Look for upload-related errors
   - The improved error messages will show exactly what's wrong

2. **Verify Blob Storage:**
   - Go to Vercel Dashboard → Storage
   - You should see your Blob database listed
   - Click on it to see connection details

3. **Check Environment Variables:**
   - Ensure `BLOB_READ_WRITE_TOKEN` is set for **Production** environment
   - Redeploy after adding/changing environment variables

Once Blob Storage is set up, image uploads will work perfectly! 🎉

