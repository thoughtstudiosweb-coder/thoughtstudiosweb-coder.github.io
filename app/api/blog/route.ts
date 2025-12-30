import { NextResponse } from 'next/server'
import { getBlogPosts, isPostgresAvailable } from '@/lib/db'
import { readMarkdownFiles } from '@/lib/content'
import matter from 'gray-matter'

export async function GET() {
  // Try Postgres first (more efficient)
  if (isPostgresAvailable()) {
    try {
      const posts = await getBlogPosts()
      // Format posts for API response with excerpt
      const formattedPosts = posts.map(post => {
        // Ensure date is a string in YYYY-MM-DD format
        let dateStr = post.date
        if (dateStr instanceof Date) {
          dateStr = dateStr.toISOString().split('T')[0]
        } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0]
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
      
      return NextResponse.json(formattedPosts)
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

