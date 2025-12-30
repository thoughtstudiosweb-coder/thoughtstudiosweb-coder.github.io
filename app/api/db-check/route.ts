import { NextResponse } from 'next/server'
import { isPostgresAvailable } from '@/lib/db'
import { sql } from '@vercel/postgres'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Database Connection Diagnostic Endpoint
 * 
 * This endpoint helps diagnose Neon DB connection issues.
 * No authentication required for diagnostics.
 * 
 * Visit: https://your-site.vercel.app/api/db-check
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  }

  // Check 1: Environment Variables
  diagnostics.checks.envVars = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL: !!process.env.DATABASE_URL,
  }

  // Check 2: isPostgresAvailable()
  diagnostics.checks.isAvailable = isPostgresAvailable()

  // Check 3: Connection String Format (if available)
  if (process.env.POSTGRES_URL) {
    const url = process.env.POSTGRES_URL
    diagnostics.checks.connectionString = {
      exists: true,
      length: url.length,
      startsWithPostgres: url.startsWith('postgres://') || url.startsWith('postgresql://'),
      hasSSL: url.includes('sslmode') || url.includes('ssl=true'),
      // Don't expose the full URL for security
      preview: url.substring(0, 20) + '...' + url.substring(url.length - 10),
    }
  } else {
    diagnostics.checks.connectionString = {
      exists: false,
      message: 'POSTGRES_URL not set',
    }
  }

  // Check 4: Try to connect and query
  if (isPostgresAvailable()) {
    try {
      // Simple query to test connection
      const result = await sql`SELECT version() as version, current_database() as database, current_user as user`
      diagnostics.checks.connection = {
        success: true,
        version: result.rows[0]?.version || 'Unknown',
        database: result.rows[0]?.database || 'Unknown',
        user: result.rows[0]?.user || 'Unknown',
      }
    } catch (error: any) {
      diagnostics.checks.connection = {
        success: false,
        error: error.message,
        code: error.code,
        details: String(error),
      }
    }

    // Check 5: Check if tables exist
    try {
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('content', 'blog_posts')
        ORDER BY table_name
      `
      diagnostics.checks.tables = {
        exists: true,
        tables: tablesResult.rows.map((r: any) => r.table_name),
        contentTableExists: tablesResult.rows.some((r: any) => r.table_name === 'content'),
        blogPostsTableExists: tablesResult.rows.some((r: any) => r.table_name === 'blog_posts'),
      }
    } catch (error: any) {
      diagnostics.checks.tables = {
        exists: false,
        error: error.message,
      }
    }

    // Check 6: Count records
    try {
      const contentCount = await sql`SELECT COUNT(*) as count FROM content`
      const blogCount = await sql`SELECT COUNT(*) as count FROM blog_posts`
      diagnostics.checks.records = {
        contentCount: parseInt(contentCount.rows[0]?.count || '0'),
        blogPostsCount: parseInt(blogCount.rows[0]?.count || '0'),
      }
    } catch (error: any) {
      diagnostics.checks.records = {
        error: error.message,
      }
    }
  } else {
    diagnostics.checks.connection = {
      success: false,
      message: 'Postgres not available - no connection string found',
    }
    diagnostics.checks.tables = {
      exists: false,
      message: 'Cannot check tables - Postgres not available',
    }
  }

  // Summary
  diagnostics.summary = {
    postgresAvailable: diagnostics.checks.isAvailable,
    connectionWorking: diagnostics.checks.connection?.success || false,
    tablesExist: diagnostics.checks.tables?.contentTableExists && diagnostics.checks.tables?.blogPostsTableExists || false,
    needsMigration: diagnostics.checks.isAvailable && diagnostics.checks.connection?.success && !diagnostics.checks.tables?.contentTableExists,
  }

  return NextResponse.json(diagnostics, { status: 200 })
}

