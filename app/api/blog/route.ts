import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts, isPostgresAvailable } from '@/lib/db'
import { readMarkdownFiles } from '@/lib/content'
import matter from 'gray-matter'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // CRITICAL: Increase delay to ensure connection pooling has fully synced
  // This is especially important when CMS refreshes after a save/delete operation
  // The delay must be long enough for the write connection to propagate to read connections
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Try Postgres first (more efficient)
  if (isPostgresAvailable()) {
    try {
      console.log('🔍 API /blog: Fetching blog posts from Postgres...')
      const posts = await getBlogPosts()
      console.log(`📤 API /blog: Retrieved ${posts.length} blog posts from getBlogPosts()`)
      // Format posts for API response with excerpt
      const formattedPosts = posts.map(post => {
        // Ensure date is a string in YYYY-MM-DD format
        // post.date is already a string from getBlogPosts(), but handle edge cases
        let dateStr: string = post.date
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0]
        } else if (typeof dateStr !== 'string') {
          // Fallback: convert to string
          dateStr = String(dateStr)
        }
        
        return {
          slug: post.slug,
          title: post.title,
          date: dateStr,
          tags: Array.isArray(post.tags) ? post.tags : [],
          cover: post.cover || '',
          excerpt: (post.content || '').split('\n').slice(0, 3).join(' ').substring(0, 200),
        }
      })
      
      // Sort by date descending (newest first)
      formattedPosts.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      
      // Add no-cache headers to prevent browser caching
      return NextResponse.json(formattedPosts, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Updated': new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Error fetching blog posts from Postgres:', error)
      // Fall through to filesystem fallback
    }
  }
  
  // Fallback to filesystem (for local development)
  try {
    const files = await readMarkdownFiles()
    const posts = files.map(({ slug, content }) => {
      const { data, content: body } = matter(content)
      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        tags: data.tags || [],
        cover: data.cover || '',
        excerpt: body.split('\n').slice(0, 3).join(' ').substring(0, 200),
      }
    }).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json([], { status: 500 })
  }
}

