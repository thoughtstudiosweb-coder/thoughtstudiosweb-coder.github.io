import { sql } from '@vercel/postgres'

// Check if Postgres is available
export function isPostgresAvailable(): boolean {
  // Vercel Postgres provides POSTGRES_URL automatically
  // Also check for POSTGRES_PRISMA_URL or POSTGRES_URL_NON_POOLING
  return !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING)
}

// Initialize database tables (run once)
export async function initDatabase() {
  if (!isPostgresAvailable()) {
    console.warn('Postgres not available, skipping database initialization')
    return false
  }

  try {
    // Create content table for JSON content (welcome, beliefs, explore, theme)
    await sql`
      CREATE TABLE IF NOT EXISTS content (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create blog_posts table
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        slug VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        date DATE NOT NULL,
        tags TEXT[] DEFAULT '{}',
        cover VARCHAR(1000),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC)
    `

    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    return false
  }
}

// Content operations (JSON)
export async function getContent(key: string): Promise<any | null> {
  if (!isPostgresAvailable()) {
    return null
  }

  try {
    const result = await sql`
      SELECT value FROM content WHERE key = ${key}
    `
    return result.rows[0]?.value || null
  } catch (error) {
    console.error(`Error reading content ${key}:`, error)
    return null
  }
}

export async function setContent(key: string, value: any): Promise<boolean> {
  if (!isPostgresAvailable()) {
    return false
  }

  try {
    await sql`
      INSERT INTO content (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = ${JSON.stringify(value)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error(`Error writing content ${key}:`, error)
    return false
  }
}

// Blog post operations
export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  cover: string
  content: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isPostgresAvailable()) {
    return []
  }

  try {
    const result = await sql`
      SELECT slug, title, date, tags, cover, content
      FROM blog_posts
      ORDER BY date DESC
    `
    return result.rows.map(row => ({
      slug: row.slug,
      title: row.title,
      date: row.date,
      tags: row.tags || [],
      cover: row.cover || '',
      content: row.content,
    }))
  } catch (error) {
    console.error('Error reading blog posts:', error)
    return []
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!isPostgresAvailable()) {
    return null
  }

  try {
    const result = await sql`
      SELECT slug, title, date, tags, cover, content
      FROM blog_posts
      WHERE slug = ${slug}
    `
    if (result.rows.length === 0) {
      return null
    }
    const row = result.rows[0]
    return {
      slug: row.slug,
      title: row.title,
      date: row.date,
      tags: row.tags || [],
      cover: row.cover || '',
      content: row.content,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

export async function createBlogPost(post: BlogPost): Promise<boolean> {
  if (!isPostgresAvailable()) {
    return false
  }

  try {
    // Check if post already exists
    const existing = await getBlogPost(post.slug)
    if (existing) {
      console.error(`Blog post with slug ${post.slug} already exists`)
      return false
    }

    await sql`
      INSERT INTO blog_posts (slug, title, date, tags, cover, content)
      VALUES (
        ${post.slug},
        ${post.title},
        ${post.date},
        ${JSON.stringify(post.tags)}::text[],
        ${post.cover || ''},
        ${post.content}
      )
    `
    return true
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
      console.error(`Blog post with slug ${post.slug} already exists (unique constraint)`)
      return false
    }
    console.error(`Error creating blog post ${post.slug}:`, error)
    return false
  }
}

export async function updateBlogPost(slug: string, post: BlogPost): Promise<boolean> {
  if (!isPostgresAvailable()) {
    return false
  }

  try {
    await sql`
      UPDATE blog_posts
      SET 
        title = ${post.title},
        date = ${post.date},
        tags = ${JSON.stringify(post.tags)}::text[],
        cover = ${post.cover || ''},
        content = ${post.content},
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = ${slug}
    `
    return true
  } catch (error) {
    console.error(`Error updating blog post ${slug}:`, error)
    return false
  }
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  if (!isPostgresAvailable()) {
    return false
  }

  try {
    await sql`
      DELETE FROM blog_posts WHERE slug = ${slug}
    `
    return true
  } catch (error) {
    console.error(`Error deleting blog post ${slug}:`, error)
    return false
  }
}

