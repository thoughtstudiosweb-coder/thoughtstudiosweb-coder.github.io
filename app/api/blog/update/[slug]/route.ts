import { NextRequest, NextResponse } from 'next/server'
import { writeMarkdownFile } from '@/lib/content'
import { getSession } from '@/lib/auth'
import matter from 'gray-matter'

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, date, tags, cover, content } = await request.json()
    const slug = params.slug
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const frontmatter = matter.stringify(content, {
      title,
      date: date || new Date().toISOString().split('T')[0],
      tags: tags || [],
      cover: cover || '',
    })
    
    const success = await writeMarkdownFile(slug, frontmatter)
    
    if (success) {
      return NextResponse.json({ success: true, slug })
    }
    
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

