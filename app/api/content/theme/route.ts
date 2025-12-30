import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/content'
import { getSession } from '@/lib/auth'

export async function GET() {
  const theme = await readJSON('theme.json')
  return NextResponse.json(theme)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const success = await writeJSON('theme.json', data)
    
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

