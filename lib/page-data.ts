import { readJSON } from '@/lib/content'
import { getBlogPosts, isPostgresAvailable } from '@/lib/db'

export interface PageData {
  welcome: {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    image: string
  } | null
  beliefs: Array<{
    title: string
    description: string
    icon: string
  }>
  explore: Array<{
    title: string
    description: string
    icon: string
  }>
  blogPosts: Array<{
    slug: string
    title: string
    date: string
    tags: string[]
    cover: string
    excerpt: string
    content: string
  }>
}

/**
 * Fetches all page data needed for the website pages.
 * This centralizes data fetching to avoid duplication across pages.
 */
export async function getPageData(): Promise<PageData> {
  // Fetch welcome, beliefs, and explore content
  const welcome = await readJSON<{
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    image: string
  }>('welcome.json')

  const beliefs = await readJSON<Array<{
    title: string
    description: string
    icon: string
  }>>('beliefs.json')

  const explore = await readJSON<Array<{
    title: string
    description: string
    icon: string
  }>>('explore.json')

  // Fetch blog posts
  let blogPosts: Array<{
    slug: string
    title: string
    date: string
    tags: string[]
    cover: string
    excerpt: string
    content: string
  }> = []

  if (isPostgresAvailable()) {
    try {
      console.log('🔍 getPageData: Fetching blog posts from Postgres...')
      const posts = await getBlogPosts()
      console.log(`📥 getPageData: Retrieved ${posts.length} blog posts from getBlogPosts()`)
      blogPosts = posts.map(post => {
        // Ensure date is a string in YYYY-MM-DD format
        let dateStr = post.date
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0]
        } else if (typeof dateStr !== 'string') {
          dateStr = String(dateStr)
        }
        
        return {
          slug: post.slug,
          title: post.title,
          date: dateStr,
          tags: Array.isArray(post.tags) ? post.tags : [],
          cover: post.cover || '',
          excerpt: (post.content || '').split('\n').slice(0, 3).join(' ').substring(0, 200),
          content: post.content || '',
        }
      })
      
      // Sort by date descending (newest first)
      blogPosts.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      
      console.log(`✅ getPageData: Returning ${blogPosts.length} formatted blog posts`)
    } catch (error) {
      console.error('❌ getPageData: Error fetching blog posts:', error)
      blogPosts = []
    }
  } else {
    console.warn('⚠️ getPageData: Postgres not available, no blog posts will be shown')
  }

  console.log(`📊 getPageData: Final data - Welcome: ${welcome ? 'yes' : 'no'}, Beliefs: ${beliefs.length}, Explore: ${explore.length}, BlogPosts: ${blogPosts.length}`)

  return {
    welcome: welcome || null,
    beliefs: beliefs || [],
    explore: explore || [],
    blogPosts,
  }
}

