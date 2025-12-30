# Vercel Deployment Guide

## Important Notes

⚠️ **File System Limitation**: Vercel's serverless functions have a **read-only file system** except for `/tmp`. This means:

- ✅ **Reading content files works** - Your JSON and Markdown files in `/content` will be read correctly
- ⚠️ **Writing content files won't persist** - CMS edits made through the admin panel will be lost on the next deployment
- ✅ **Image uploads to `/public/uploads` work** - But they won't persist between deployments

### Solutions for Production CMS:

#### Option 1: Vercel Blob Storage (Recommended for Images)
✅ **Already Implemented** - The upload route now supports Vercel Blob Storage!

**Setup Steps:**
1. Install Vercel Blob Storage in your Vercel project:
   - Go to Vercel Dashboard → Your Project → Storage
   - Click "Create Database" → Select "Blob"
   - This will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

2. The code automatically uses Blob Storage when `BLOB_READ_WRITE_TOKEN` is available
   - Falls back to filesystem for local development
   - Works seamlessly on Vercel

**Benefits:**
- ✅ Persistent image storage
- ✅ CDN delivery for fast loading
- ✅ No file system limitations
- ✅ Automatic cleanup options

#### Option 2: Vercel Postgres for Content (✅ Already Implemented!)
✅ **Fully Implemented** - The CMS now supports Vercel Postgres for persistent content storage!

**Setup Steps:**
1. **Create Postgres Database in Vercel:**
   - Go to Vercel Dashboard → Your Project → **Storage** tab
   - Click **"Create Database"** → Select **"Postgres"**
   - This automatically adds `POSTGRES_URL` to your environment variables

2. **Run Database Migration:**
   - After deployment, log into `/admin`
   - Make a POST request to `/api/migrate` (or use the admin panel)
   - This creates the necessary database tables

3. **How It Works:**
   - **With Postgres**: All content edits persist in the database
   - **Without Postgres**: Falls back to filesystem (local dev only)
   - **Automatic**: The code detects Postgres availability and uses it automatically

**Benefits:**
- ✅ Persistent content storage on Vercel
- ✅ All CMS edits (welcome, beliefs, explore, theme, blog posts) persist
- ✅ Automatic fallback to filesystem for local development
- ✅ No code changes needed - works automatically

**Current Status:**
- ✅ **Image uploads**: Vercel Blob Storage (automatic fallback to filesystem locally)
- ✅ **Content edits**: Vercel Postgres (automatic fallback to filesystem locally)

## Pre-Deployment Checklist

- [ ] Set up environment variables in Vercel dashboard
- [ ] Ensure all dependencies are in `package.json`
- [ ] Test build locally: `npm run build`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Commit all changes to Git

## Step-by-Step Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   ADMIN_EMAIL=your-admin-email@example.com
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-jwt-secret-key-min-32-chars
   NODE_ENV=production
   ```

   **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live!

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Add environment variables when prompted

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ADMIN_EMAIL` | Admin login email | `admin@thoughtstudios.com` | ✅ Yes |
| `ADMIN_PASSWORD` | Admin login password | `SecurePassword123!` | ✅ Yes |
| `JWT_SECRET` | JWT encryption secret (min 32 chars) | `your-random-32-char-secret` | ✅ Yes |
| `NODE_ENV` | Environment mode | `production` | ✅ Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage token | Auto-added when you create Blob | ⚠️ For image uploads |
| `POSTGRES_URL` | Vercel Postgres connection string | Auto-added when you create Postgres | ⚠️ For content persistence |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Setup Vercel Storage:**

**For Image Uploads (Blob Storage):**
1. Go to Vercel Dashboard → Your Project → **Storage** tab
2. Click **"Create Database"** → Select **"Blob"**
3. This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables

**For Content Persistence (Postgres):**
1. In the same **Storage** tab, click **"Create Database"** again
2. Select **"Postgres"**
3. This automatically adds `POSTGRES_URL` to your environment variables
4. Redeploy your project

**Initialize Database Tables:**
5. After deployment, log into `/admin`
6. Run the migration: `POST /api/migrate` (requires admin authentication)
   - You can use Postman, curl, or any HTTP client
   - This creates the database tables - you only need to do this once

**Note:** 
- Without Blob Storage, image uploads won't work on Vercel
- Without Postgres, content edits won't persist on Vercel
- The code automatically uses storage when available, or falls back to filesystem for local development

## Post-Deployment

1. **Test Your Site**
   - Visit your Vercel URL
   - Test all pages
   - Test admin login at `/admin/login`

2. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

3. **Monitor**
   - Check Vercel dashboard for build logs
   - Monitor function execution times
   - Check for errors in logs

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Test locally**: `npm run build`
3. **Common issues**:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

### CMS Not Working

- **Image Uploads**: Ensure Vercel Blob Storage is set up (see Setup section above)
- **Content Edits**: Ensure Vercel Postgres is set up and migration has been run
- **Database Migration**: Run `POST /api/migrate` after setting up Postgres (requires admin login)
- Check that `BLOB_READ_WRITE_TOKEN` is set for image uploads
- Check that `POSTGRES_URL` is set for content persistence
- **Local Development**: Both will fall back to filesystem automatically

### Images Not Loading

- Check image paths are correct
- Verify images are in `/public` folder
- Check Next.js Image component usage

### Admin Login Issues

- Verify environment variables are set
- Check JWT_SECRET is at least 32 characters
- Ensure cookies are enabled in browser

## Performance Optimization

The following optimizations are already in place:

- ✅ Image optimization enabled
- ✅ SWC minification
- ✅ Compression enabled
- ✅ React Strict Mode
- ✅ Optimized build output

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

