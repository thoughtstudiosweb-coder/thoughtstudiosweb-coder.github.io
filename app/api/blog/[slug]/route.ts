import { NextRequest, NextResponse } from 'next/server'
import { readMarkdownFile } from '@/lib/content'
import matter from 'gray-matter'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    console.log(`🔍 Fetching blog post: ${slug}`)
    
    // Add delay to ensure fresh data from Postgres
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const content = await readMarkdownFile(slug)
    
    if (!content) {
      console.log(`⚠️ Blog post "${slug}" not found`)
      return NextResponse.json(
        { error: 'Post not found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      )
    }
    
    const { data, content: body } = matter(content)
    console.log(`✅ Returning blog post: ${slug}`)
    
    return NextResponse.json(
      {
        slug,
        title: data.title || '',
        date: data.date || '',
        tags: data.tags || [],
        cover: data.cover || '',
        content: body,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Updated': new Date().toISOString(),
        },
      }
    )
  } catch (error: any) {
    console.error(`❌ Error fetching blog post:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch post', details: error?.message },
      { status: 500 }
    )
  }
}

