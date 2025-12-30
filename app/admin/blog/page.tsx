import { getBlogPosts } from '@/lib/db'
import BlogManager from './BlogManager'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlogPage() {
  console.log('🔍 Blog page: Fetching posts from Postgres...')
  const posts = await getBlogPosts()
  console.log(`✅ Blog page: Retrieved ${posts.length} blog posts`)
  
  // Format posts for display
  const formattedPosts = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: Array.isArray(post.tags) ? post.tags : [],
    cover: post.cover || '',
    excerpt: (post.content || '').split('\n').slice(0, 3).join(' ').substring(0, 200),
  }))
  
  return <BlogManager initialPosts={formattedPosts} />
}
