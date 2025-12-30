# Deployment Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Update with your admin credentials and JWT secret

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Deployment Options

### Vercel (Recommended - Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
6. Click "Deploy"

**Vercel supports file system writes**, so the CMS will work immediately.

### Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site settings → Environment variables
7. Deploy

**Netlify Functions also support file writes**, so it will work.

### Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Create a new "Web Service"
4. Connect your GitHub repository
5. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy

**Render supports file system writes** on their platform.

### Alternative: GitHub API Workflow

If your hosting provider doesn't support file system writes (unlikely with modern platforms), you can modify the API routes to use GitHub API:

1. Create a GitHub Personal Access Token with repo permissions
2. Store it in environment variables as `GITHUB_TOKEN`
3. Modify `/lib/content.ts` to use GitHub API instead of direct file writes
4. This requires additional setup but works on any platform

## Environment Variables

Required for all deployments:

```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-random-secret-key-min-32-chars
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## Post-Deployment

1. Visit `/admin` and log in
2. Update content through the CMS
3. All changes are saved to the `/content` folder
4. Changes are immediately reflected on the frontend

## Troubleshooting

### File Write Errors

If you see file write errors:
- Check that the hosting platform supports file system writes
- Verify environment variables are set correctly
- Check file permissions on the server

### Authentication Issues

- Ensure `JWT_SECRET` is set and consistent
- Check that cookies are enabled in the browser
- Verify the admin email/password match `.env.local`

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

