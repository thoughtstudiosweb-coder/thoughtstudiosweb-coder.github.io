import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getContent, setContent, getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost, isPostgresAvailable, type BlogPost } from './db'

const contentDir = path.join(process.cwd(), 'content')

// Ensure content directory exists (only in development/build time)
// On Vercel, the file system is read-only, so this only works during build
if (typeof window === 'undefined' && !fs.existsSync(contentDir)) {
  try {
    fs.mkdirSync(contentDir, { recursive: true })
  } catch (error) {
    // Silently fail in production (Vercel read-only filesystem)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not create content directory:', error)
    }
  }
}

export function getContentFile(fileName: string) {
  return path.join(contentDir, fileName)
}

// Read JSON with Postgres fallback to filesystem
export async function readJSON<T>(fileName: string): Promise<T | null> {
  // Try Postgres first
  if (isPostgresAvailable()) {
    const key = fileName.replace('.json', '') // Remove .json extension for key
    const content = await getContent(key)
    if (content !== null) {
      console.log(`✅ Read ${fileName} from Postgres (key: ${key})`)
      return content as T
    } else {
      console.log(`⚠️ ${fileName} not found in Postgres (key: ${key}), checking filesystem...`)
    }
  }

  // Fallback to filesystem (only if Postgres is not available or returned null)
  try {
    const filePath = getContentFile(fileName)
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${fileName} not found in filesystem either`)
      return null
    }
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(fileContents) as T
    console.log(`📁 Read ${fileName} from filesystem (Postgres unavailable or returned null)`)
    return parsed
  } catch (error) {
    console.error(`❌ Error reading ${fileName}:`, error)
    return null
  }
}

// Write JSON with Postgres, fallback to filesystem
export async function writeJSON<T>(fileName: string, data: T): Promise<boolean> {
  // Try Postgres first
  if (isPostgresAvailable()) {
    const key = fileName.replace('.json', '') // Remove .json extension for key
    const success = await setContent(key, data)
    if (success) {
      return true
    }
  }

  // Fallback to filesystem (for local development)
  try {
    if (process.env.VERCEL && !isPostgresAvailable()) {
      console.warn('⚠️ Postgres not available on Vercel. Content changes will not persist.')
      return false
    }
    const filePath = getContentFile(fileName)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error)
    return false
  }
}

// Read markdown files with Postgres fallback to filesystem
export async function readMarkdownFiles() {
  // Try Postgres first
  if (isPostgresAvailable()) {
    try {
      const posts = await getBlogPosts()
      console.log(`📝 Retrieved ${posts.length} blog posts from Postgres`)
      
      if (posts.length > 0) {
        return posts.map(post => {
          // Convert blog post back to markdown format with frontmatter
          const markdown = matter.stringify(post.content, {
            title: post.title,
            date: post.date,
            tags: post.tags,
            cover: post.cover,
          })
          return { slug: post.slug, content: markdown, filePath: '' }
        })
      } else {
        console.warn('⚠️ No blog posts found in Postgres database, checking filesystem...')
      }
    } catch (error) {
      console.error('❌ Error reading blog posts from Postgres:', error)
      // Fall through to filesystem fallback
    }
  }

  // Fallback to filesystem
  const blogDir = path.join(contentDir, 'blog')
  if (!fs.existsSync(blogDir)) {
    try {
      fs.mkdirSync(blogDir, { recursive: true })
    } catch (error) {
      // Silently fail
    }
    return []
  }

  const files = fs.readdirSync(blogDir)
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(blogDir, file)
      const content = fs.readFileSync(filePath, 'utf8')
      return { slug: file.replace('.md', ''), content, filePath }
    })
}

// Read single markdown file with Postgres fallback
export async function readMarkdownFile(slug: string): Promise<string | null> {
  // Try Postgres first
  if (isPostgresAvailable()) {
    const post = await getBlogPost(slug)
    if (post) {
      // Convert blog post back to markdown format with frontmatter
      return matter.stringify(post.content, {
        title: post.title,
        date: post.date,
        tags: post.tags,
        cover: post.cover,
      })
    }
    return null
  }

  // Fallback to filesystem
  const filePath = path.join(contentDir, 'blog', `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf8')
}

// Write markdown file with Postgres, fallback to filesystem
export async function writeMarkdownFile(slug: string, content: string): Promise<boolean> {
  const { data, content: body } = matter(content)

  const post: BlogPost = {
    slug,
    title: data.title || '',
    date: data.date || new Date().toISOString().split('T')[0],
    tags: data.tags || [],
    cover: data.cover || '',
    content: body,
  }

  // Try Postgres first
  if (isPostgresAvailable()) {
    // Check if post exists
    const existing = await getBlogPost(slug)
    if (existing) {
      // updateBlogPost returns boolean
      return await updateBlogPost(slug, post)
    } else {
      // createBlogPost returns { success: boolean; error?: string }
      const createResult = await createBlogPost(post)
      return createResult.success
    }
  }

  // Fallback to filesystem (for local development)
  try {
    if (process.env.VERCEL) {
      console.warn('⚠️ Postgres not available on Vercel. Content changes will not persist.')
      return false
    }
    const blogDir = path.join(contentDir, 'blog')
    if (!fs.existsSync(blogDir)) {
      try {
        fs.mkdirSync(blogDir, { recursive: true })
      } catch (mkdirError) {
        throw mkdirError
      }
    }
    const filePath = path.join(blogDir, `${slug}.md`)
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  } catch (error) {
    console.error(`Error writing markdown file:`, error)
    return false
  }
}

// Delete markdown file with Postgres, fallback to filesystem
export async function deleteMarkdownFile(slug: string): Promise<boolean> {
  // Try Postgres first
  if (isPostgresAvailable()) {
    return await deleteBlogPost(slug)
  }

  // Fallback to filesystem
  try {
    const filePath = path.join(contentDir, 'blog', `${slug}.md`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return true
  } catch (error) {
    console.error(`Error deleting markdown file:`, error)
    return false
  }
}

