import { NextRequest, NextResponse } from 'next/server'
import { deleteMarkdownFile } from '@/lib/content'
import { getSession } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const slug = params.slug
    const success = await deleteMarkdownFile(slug)
    
    if (success) {
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

