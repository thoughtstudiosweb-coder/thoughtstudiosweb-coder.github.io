# Environment Variables Setup

Since `.env.local.example` is gitignored, create your `.env.local` file manually.

## Quick Setup

Run this command to create `.env.local`:

```bash
cat > .env.local << 'EOF'
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

Or manually create `.env.local` with:

```env
# Admin Authentication
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-secure-password-here

# JWT Secret (generate a random string)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Cookie Name (optional)
SESSION_COOKIE_NAME=thought-studios-session
```

## Generate JWT Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `JWT_SECRET` value.

## Important Notes

- `.env.local` is gitignored and won't be committed
- Change `JWT_SECRET` in production
- Use a strong admin password
- Never commit `.env.local` to version control

