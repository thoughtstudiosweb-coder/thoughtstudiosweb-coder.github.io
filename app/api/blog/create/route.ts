import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBlogPost, isPostgresAvailable, getBlogPost } from '@/lib/db'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug, title, date, tags, cover, content } = await request.json()
    
    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if slug already exists (both in Postgres and filesystem)
    let existing = false
    
    if (isPostgresAvailable()) {
      const post = await getBlogPost(slug)
      existing = post !== null
    } else {
      const contentDir = path.join(process.cwd(), 'content')
      const filePath = path.join(contentDir, 'blog', `${slug}.md`)
      existing = fs.existsSync(filePath)
    }
    
    if (existing) {
      return NextResponse.json(
        { error: `A post with slug "${slug}" already exists. Please use a different slug.` },
        { status: 409 }
      )
    }
    
    const frontmatter = matter.stringify(content, {
      title,
      date: date || new Date().toISOString().split('T')[0],
      tags: tags || [],
      cover: cover || '',
    })
    
    // Use Postgres - required on Vercel (filesystem is read-only)
    if (!isPostgresAvailable()) {
      if (process.env.VERCEL) {
        return NextResponse.json(
          { error: 'Postgres database is required on Vercel. Please configure POSTGRES_URL in your environment variables.' },
          { status: 500 }
        )
      }
      // Filesystem fallback only for local development
      try {
        const contentDir = path.join(process.cwd(), 'content')
        const blogDir = path.join(contentDir, 'blog')
        if (!fs.existsSync(blogDir)) {
          fs.mkdirSync(blogDir, { recursive: true })
        }
        const filePath = path.join(blogDir, `${slug}.md`)
        fs.writeFileSync(filePath, frontmatter, 'utf8')
        return NextResponse.json({ success: true, slug })
      } catch (fsError: any) {
        console.error('Filesystem write error:', fsError)
        return NextResponse.json(
          { error: 'Failed to create post. Filesystem is read-only. Please configure Postgres.' },
          { status: 500 }
        )
      }
    }
    
    // Use Postgres
    const post = {
      slug,
      title,
      date: date || new Date().toISOString().split('T')[0],
      tags: tags || [],
      cover: cover || '',
      content,
    }
    
    const result = await createBlogPost(post)
    
    if (result.success) {
      console.log(`✅ Blog post "${slug}" created successfully`)
      // Add delay to ensure creation is visible in connection pool
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
    
    // Return specific error message
    const errorMessage = result.error || 'Failed to create post'
    console.error(`❌ Failed to create blog post: ${errorMessage}`)
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('already exists') ? 409 : 500 }
    )
  } catch (error: any) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { error: error.message || 'Invalid request' },
      { status: 400 }
    )
  }
}

