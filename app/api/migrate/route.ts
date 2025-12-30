import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { migrate } from '@/lib/migrate'

/**
 * Database Migration Endpoint
 * 
 * Run this once after setting up Vercel Postgres to initialize the database tables.
 * 
 * Usage:
 * POST /api/migrate (requires admin authentication)
 */
export async function POST() {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await migrate()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      })
    }
    
    return NextResponse.json(
      { 
        error: result.message,
        details: 'Check Vercel function logs for more information. Make sure POSTGRES_URL is set in environment variables.'
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Migration route error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Migration failed',
        details: 'Check Vercel function logs for more information.'
      },
      { status: 500 }
    )
  }
}

