# Troubleshooting Guide

## Issue: Can't Login to Admin

**Problem**: Login fails or redirects to login page.

**Solution**: Create `.env.local` file in the root directory:

```bash
cat > .env.local << 'EOF'
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

Or manually create `.env.local` with:
```env
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: 
- Replace `your-secure-password-here` with your actual password
- Generate a secure JWT_SECRET: `openssl rand -base64 32`
- Restart the dev server after creating `.env.local`

## Issue: Content Not Showing (Only Landing Section)

**Problem**: Only the hero section is visible, other sections don't appear.

**Possible Causes**:

1. **Content files missing or corrupted**
   - Check that these files exist:
     - `content/welcome.json`
     - `content/beliefs.json`
     - `content/explore.json`
   - Verify they contain valid JSON

2. **Server not restarted**
   - Stop the dev server (Ctrl+C)
   - Run `npm run dev` again

3. **Browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or clear browser cache

4. **Check browser console**
   - Open DevTools (F12)
   - Look for errors in the Console tab
   - Check the Network tab for failed requests

## Quick Fixes

1. **Verify content files exist**:
   ```bash
   ls -la content/*.json
   ```

2. **Check if dev server is running**:
   ```bash
   # Should show process on port 3000
   lsof -i :3000
   ```

3. **Restart everything**:
   ```bash
   # Stop server (Ctrl+C)
   # Then restart
   npm run dev
   ```

4. **Check for TypeScript errors**:
   ```bash
   npm run build
   ```

## Still Having Issues?

1. Check the terminal/console for error messages
2. Verify all dependencies are installed: `npm install`
3. Ensure Node.js version is 18+: `node --version`
4. Check that port 3000 is available

