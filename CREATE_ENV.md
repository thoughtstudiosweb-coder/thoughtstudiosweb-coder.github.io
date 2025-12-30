# Create .env.local File

## Quick Setup

Run this command in your terminal (from the project root):

```bash
cat > .env.local << 'EOF'
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=Ltx00Bl9YmdgN3t0+wIXMe8t/hBUqO9VA8hTPVnVXIA=
EOF
```

## Or Create Manually

1. Create a file named `.env.local` in the root directory
2. Add the following content:

```env
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=Ltx00Bl9YmdgN3t0+wIXMe8t/hBUqO9VA8hTPVnVXIA=
```

## Important Notes

- **Replace `your-secure-password-here`** with your actual admin password
- The JWT_SECRET has been generated for you: `Ltx00Bl9YmdgN3t0+wIXMe8t/hBUqO9VA8hTPVnVXIA=`
- After creating the file, **restart your dev server** (stop with Ctrl+C, then run `npm run dev` again)
- The `.env.local` file is gitignored and won't be committed to version control

## Verify It Works

After creating `.env.local` and restarting the server:
1. Go to http://localhost:3000/admin
2. Login with:
   - Email: `admin@thoughtstudios.com`
   - Password: (whatever you set in ADMIN_PASSWORD)

