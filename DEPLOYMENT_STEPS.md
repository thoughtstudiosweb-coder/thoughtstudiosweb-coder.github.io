# 🚀 Vercel Deployment Steps

## Pre-Deployment Checklist

✅ **Before deploying, ensure:**
- [ ] All code is committed to Git
- [ ] Local build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] `.env.local` is in `.gitignore` (should not be committed)
- [ ] All dependencies are in `package.json`

---

## Step 1: Prepare Your Code

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Test build locally:**
   ```bash
   npm run build
   ```
   If this fails, fix errors before deploying.

---

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up or log in with GitHub

2. **Create New Project**
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project Settings**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add the following (one at a time):

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `ADMIN_EMAIL` | `your-admin-email@example.com` | Your admin login email |
   | `ADMIN_PASSWORD` | `your-secure-password` | Your admin password |
   | `JWT_SECRET` | `[generate below]` | Generate a random 32+ char string |
   | `NODE_ENV` | `production` | Set to production |

   **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste as `JWT_SECRET` value.

5. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Option B: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   Follow prompts to link project and add environment variables.

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## Step 3: Setup Storage (Required for CMS)

### 3.1 Setup Blob Storage (for Image Uploads)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **"Storage"** tab
   - Click **"Create Database"**
   - Select **"Blob"**
   - This automatically adds `BLOB_READ_WRITE_TOKEN` to environment variables

2. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger redeploy

### 3.2 Setup Postgres (for Content Persistence)

1. **In Vercel Dashboard:**
   - Go to your project → **"Storage"** tab
   - Click **"Create Database"** again
   - Select **"Postgres"**
   - This automatically adds `POSTGRES_URL` to environment variables

2. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment

---

## Step 4: Initialize Database

After Postgres is set up and redeployed:

1. **Log into Admin:**
   - Go to `https://your-project.vercel.app/admin`
   - Login with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`

2. **Run Migration:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Run this command:
   ```javascript
   fetch('/api/migrate', { method: 'POST', credentials: 'include' })
     .then(r => r.json())
     .then(console.log)
   ```
   
   **OR use curl:**
   ```bash
   # First, get your session cookie by logging in
   curl -X POST https://your-project.vercel.app/api/migrate \
     -H "Cookie: session=YOUR_SESSION_COOKIE" \
     -H "Content-Type: application/json"
   ```
   
   **OR use Postman:**
   - POST to `https://your-project.vercel.app/api/migrate`
   - Include your session cookie in headers

3. **Verify Success:**
   - You should see: `{"success": true, "message": "Database initialized"}`
   - If you see an error, check that Postgres is set up correctly

---

## Step 5: Verify Everything Works

### Test Website:
- [ ] Homepage loads: `https://your-project.vercel.app`
- [ ] All sections display correctly
- [ ] Navigation works
- [ ] Blog posts display

### Test Admin Panel:
- [ ] Login works: `https://your-project.vercel.app/admin`
- [ ] Can edit Welcome section
- [ ] Can edit Beliefs section
- [ ] Can edit Explore section
- [ ] Can edit Theme
- [ ] Can create/edit blog posts
- [ ] Can upload images

### Test CMS Persistence:
- [ ] Make a change in admin panel
- [ ] Refresh the page
- [ ] Change should persist (not revert)

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to catch errors

### Admin Login Doesn't Work
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly
- Check `JWT_SECRET` is set and is at least 32 characters
- Clear browser cookies and try again

### Images Don't Upload
- Verify Blob Storage is created
- Check `BLOB_READ_WRITE_TOKEN` is in environment variables
- Redeploy after creating Blob Storage

### Content Changes Don't Persist
- Verify Postgres is created
- Check `POSTGRES_URL` is in environment variables
- Ensure migration has been run (Step 4)
- Redeploy after creating Postgres

### Migration Fails
- Ensure you're logged into `/admin` first
- Check Postgres is set up correctly
- Verify `POSTGRES_URL` environment variable exists
- Check Vercel function logs for detailed error messages

---

## Post-Deployment

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### Monitor Performance
- Check Vercel Dashboard → Analytics
- Monitor function execution times
- Review error logs if issues occur

---

## Quick Reference

**Environment Variables Required:**
```
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-password
JWT_SECRET=your-32-char-secret
NODE_ENV=production
BLOB_READ_WRITE_TOKEN=auto-added-by-vercel
POSTGRES_URL=auto-added-by-vercel
```

**Important URLs:**
- Website: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/admin`
- Migration: `POST https://your-project.vercel.app/api/migrate`

---

## Need Help?

- Check `VERCEL_DEPLOYMENT.md` for detailed documentation
- Review Vercel logs in Dashboard → Deployments → [Your Deployment] → Functions
- Check browser console for client-side errors
- Verify all environment variables are set correctly

