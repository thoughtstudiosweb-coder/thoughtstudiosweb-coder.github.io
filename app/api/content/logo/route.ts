import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/content'
import { getSession } from '@/lib/auth'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Note: This API route is kept for backward compatibility
  // But the website now uses LogoServer component (server-side) which is faster
  // No delays needed - direct database access
  const logo = await readJSON('logo.json')
  
  // Return default if null
  const result = logo || {
    type: 'text' as const,
    text: 'Thought Studios™',
    fontSize: 24,
  }
  
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Updated': new Date().toISOString(),
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
    const success = await writeJSON('logo.json', data)
    
    if (success) {
      return NextResponse.json({ success: true, data })
    }
    
    return NextResponse.json(
      { error: 'Failed to save' },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

