# Neon DB Setup Guide

## Overview

This project now supports **Neon DB** (in addition to Vercel Postgres). Neon DB is a serverless Postgres database that works great with Next.js.

## Setup Steps

### 1. Create Neon DB Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Copy your connection string (it will look like: `postgresql://user:password@host/database?sslmode=require`)

### 2. Set Environment Variables

Add the following to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
POSTGRES_URL=your-neon-connection-string-here
```

**Important**: Neon DB connection strings typically include query parameters like `?sslmode=require`. Make sure to include the full connection string.

### 3. Run Database Migration

After setting up the connection string, run the migration to create the necessary tables:

**Option A: Via API (Recommended)**
1. Log into your admin panel: `/admin`
2. Navigate to `/api/migrate` (or create a migration button in your admin UI)
3. Make a POST request to `/api/migrate`

**Option B: Via Terminal (Local Development)**
```bash
# Create a migration script
node -e "
const { migrate } = require('./lib/migrate');
migrate().then(result => {
  console.log(result);
  process.exit(result.success ? 0 : 1);
});
"
```

### 4. Verify Connection

Check your Vercel logs or local console to see:
- `✅ Content table created`
- `✅ Blog posts table created`
- `✅ Indexes created`

## Environment Variables

### Required
- `POSTGRES_URL` - Your Neon DB connection string

### Optional (for compatibility)
- `POSTGRES_PRISMA_URL` - Alternative connection string format
- `POSTGRES_URL_NON_POOLING` - Non-pooling connection string
- `DATABASE_URL` - Alternative name (also checked)

## Connection String Format

Neon DB connection strings typically look like:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

Make sure to:
- Include the full connection string
- Keep it secure (never commit to git)
- Use different databases for development and production

## Troubleshooting

### "Postgres not available" error
- Check that `POSTGRES_URL` is set in your environment variables
- Verify the connection string is correct
- Make sure the database is accessible (not paused)

### Connection timeout
- Check your Neon DB project is not paused
- Verify network access settings
- Try using the non-pooling connection string

### Migration fails
- Ensure the connection string has proper permissions
- Check that the database is empty or you're okay with overwriting tables
- Review error logs for specific SQL errors

## Differences from Vercel Postgres

1. **Connection String**: Neon DB requires you to manually set `POSTGRES_URL`
2. **Auto-scaling**: Neon DB automatically scales, but you may need to wait for cold starts
3. **Free Tier**: Neon DB has a generous free tier with auto-pause

## Code Compatibility

The code uses `@vercel/postgres` which is compatible with Neon DB as long as:
- The connection string is in `POSTGRES_URL`
- The connection string format is standard PostgreSQL format
- SSL is properly configured (usually `?sslmode=require`)

The `isPostgresAvailable()` function now checks for:
- `POSTGRES_URL` (primary)
- `POSTGRES_PRISMA_URL` (alternative)
- `POSTGRES_URL_NON_POOLING` (non-pooling)
- `DATABASE_URL` (common alternative name)

All of these will work with Neon DB!

