import { NextRequest, NextResponse } from 'next/server'
import { deleteBlogPost } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    console.log(`🗑️ Deleting blog post: ${slug}`)
    
    // Delete from Postgres directly
    const success = await deleteBlogPost(slug)
    
    if (success) {
      console.log(`✅ Blog post "${slug}" deleted successfully`)
      // Note: Delay helps CMS refresh see the deletion immediately after delete
      // Website uses Server Components which don't need these delays
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return NextResponse.json(
        { success: true },
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
    
    console.error(`❌ Failed to delete blog post: ${slug}`)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error(`❌ Error deleting blog post:`, error)
    return NextResponse.json(
      { error: 'Invalid request', details: error?.message },
      { status: 400 }
    )
  }
}

