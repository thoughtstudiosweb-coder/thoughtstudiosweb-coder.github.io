import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/content'
import { getSession } from '@/lib/auth'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // CRITICAL: Increase delay to ensure connection pooling has fully synced
    // This is especially important when CMS refreshes after a save operation
    // The delay must be long enough for the write connection to propagate to read connections
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const beliefs = await readJSON('beliefs.json')
    console.log(`📤 API /beliefs: Returning ${Array.isArray(beliefs) ? beliefs.length : 0} beliefs`)
    
    // Add no-cache headers to prevent browser caching
    return NextResponse.json(beliefs || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Updated': new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error reading beliefs content:', error)
    return NextResponse.json(
      { error: 'Failed to load beliefs content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const success = await writeJSON('beliefs.json', data)
    
    if (success) {
      console.log('✅ Beliefs content saved successfully')
      return NextResponse.json({ success: true, data })
    }
    
    console.error('❌ Failed to save beliefs content')
    return NextResponse.json(
      { 
        error: 'Failed to save. Check that Postgres is configured or filesystem is writable.',
        hint: 'On Vercel, ensure Postgres is set up and migration has been run.'
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('❌ Error saving beliefs content:', error)
    const errorMsg = error?.message || 'Invalid request'
    return NextResponse.json(
      { 
        error: `Failed to save: ${errorMsg}`,
        hint: 'Check server logs for more details.'
      },
      { status: 400 }
    )
  }
}

