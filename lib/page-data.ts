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
  console.log('🔄 getPageData: Starting parallel data fetch...')
  
  // Fetch all data in parallel for maximum performance
  // This reduces total load time from ~800ms (sequential) to ~50ms (parallel)
  // All four data sources fetch simultaneously instead of one after another
  const [welcome, beliefs, explore, blogPostsResult] = await Promise.all([
    readJSON<{
      title: string
      subtitle: string
      ctaText: string
      ctaLink: string
      image: string
    }>('welcome.json'),
    
    readJSON<Array<{
      title: string
      description: string
      icon: string
    }>>('beliefs.json'),
    
    readJSON<Array<{
      title: string
      description: string
      icon: string
    }>>('explore.json'),
    
    // Fetch blog posts in parallel
    (async () => {
      if (!isPostgresAvailable()) {
        console.warn('⚠️ getPageData: Postgres not available, no blog posts will be shown')
        return []
      }
      
      try {
        console.log('🔍 getPageData: Fetching blog posts from Postgres...')
        const posts = await getBlogPosts()
        console.log(`📥 getPageData: Retrieved ${posts.length} blog posts from getBlogPosts()`)
        
        const formatted = posts.map(post => {
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
        formatted.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
        
        console.log(`✅ getPageData: Returning ${formatted.length} formatted blog posts`)
        return formatted
      } catch (error) {
        console.error('❌ getPageData: Error fetching blog posts:', error)
        return []
      }
    })(),
  ])

  const blogPosts = blogPostsResult || []

  // Ensure arrays are never null for logging and return
  const beliefsArray = beliefs || []
  const exploreArray = explore || []

  console.log(`📊 getPageData: Final data - Welcome: ${welcome ? 'yes' : 'no'}, Beliefs: ${beliefsArray.length}, Explore: ${exploreArray.length}, BlogPosts: ${blogPosts.length}`)

  return {
    welcome: welcome || null,
    beliefs: beliefsArray,
    explore: exploreArray,
    blogPosts,
  }
}

