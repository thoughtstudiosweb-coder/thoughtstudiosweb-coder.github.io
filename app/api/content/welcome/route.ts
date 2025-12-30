import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/content'
import { getSession } from '@/lib/auth'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const welcome = await readJSON('welcome.json')
  // Add no-cache headers to prevent browser caching
  return NextResponse.json(welcome, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const success = await writeJSON('welcome.json', data)
    
    if (success) {
      console.log('✅ Welcome content saved successfully')
      return NextResponse.json({ success: true, data })
    }
    
    console.error('❌ Failed to save welcome content')
    return NextResponse.json(
      { 
        error: 'Failed to save. Check that Postgres is configured or filesystem is writable.',
        hint: 'On Vercel, ensure Postgres is set up and migration has been run.'
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('❌ Error saving welcome content:', error)
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

