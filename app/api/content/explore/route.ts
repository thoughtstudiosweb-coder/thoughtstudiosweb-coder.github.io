import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/content'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const explore = await readJSON('explore.json')
    return NextResponse.json(explore || [])
  } catch (error: any) {
    console.error('Error reading explore content:', error)
    return NextResponse.json(
      { error: 'Failed to load explore content' },
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
    const success = await writeJSON('explore.json', data)
    
    if (success) {
      console.log('✅ Explore content saved successfully')
      return NextResponse.json({ success: true, data })
    }
    
    console.error('❌ Failed to save explore content')
    return NextResponse.json(
      { 
        error: 'Failed to save. Check that Postgres is configured or filesystem is writable.',
        hint: 'On Vercel, ensure Postgres is set up and migration has been run.'
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('❌ Error saving explore content:', error)
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

