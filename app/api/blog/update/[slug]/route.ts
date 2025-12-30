import { NextRequest, NextResponse } from 'next/server'
import { writeMarkdownFile } from '@/lib/content'
import { getSession } from '@/lib/auth'
import matter from 'gray-matter'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    
    console.log(`📝 Updating blog post: ${slug}`)
    
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
      console.log(`✅ Blog post "${slug}" updated successfully`)
      // Add delay to ensure update is visible in connection pool
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return NextResponse.json(
        { success: true, slug },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Content-Updated': new Date().toISOString(),
          },
        }
      )
    }
    
    console.error(`❌ Failed to update blog post: ${slug}`)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error(`❌ Error updating blog post:`, error)
    return NextResponse.json(
      { error: 'Invalid request', details: error?.message },
      { status: 400 }
    )
  }
}

