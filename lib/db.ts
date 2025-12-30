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
    const errorMsg = 'Postgres not available. Check POSTGRES_URL environment variable.'
    console.warn('⚠️', errorMsg)
    throw new Error(errorMsg)
  }

  try {
    console.log('Creating content table...')
    // Create content table for JSON content (welcome, beliefs, explore, theme)
    await sql`
      CREATE TABLE IF NOT EXISTS content (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Content table created')

    console.log('Creating blog_posts table...')
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
    console.log('✅ Blog posts table created')

    console.log('Creating indexes...')
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC)
    `
    console.log('✅ Indexes created')

    return true
  } catch (error: any) {
    const errorDetails = error?.message || String(error)
    console.error('❌ Database initialization error:', errorDetails)
    console.error('Full error:', error)
    throw new Error(`Database initialization failed: ${errorDetails}`)
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

export async function createBlogPost(post: BlogPost): Promise<{ success: boolean; error?: string }> {
  if (!isPostgresAvailable()) {
    return { success: false, error: 'Postgres is not available' }
  }

  try {
    // Check if post already exists
    const existing = await getBlogPost(post.slug)
    if (existing) {
      const errorMsg = `Blog post with slug "${post.slug}" already exists`
      console.error(errorMsg)
      return { success: false, error: errorMsg }
    }

    // Format tags array for PostgreSQL
    // Ensure tags is always an array
    const tagsArray = Array.isArray(post.tags) ? post.tags : []
    
    // For empty arrays, PostgreSQL needs '{}' format
    // For non-empty, we can pass the array directly and @vercel/postgres will handle it
    if (tagsArray.length === 0) {
      await sql`
        INSERT INTO blog_posts (slug, title, date, tags, cover, content)
        VALUES (
          ${post.slug},
          ${post.title},
          ${post.date},
          ARRAY[]::text[],
          ${post.cover || ''},
          ${post.content}
        )
      `
    } else {
      await sql`
        INSERT INTO blog_posts (slug, title, date, tags, cover, content)
        VALUES (
          ${post.slug},
          ${post.title},
          ${post.date},
          ${tagsArray}::text[],
          ${post.cover || ''},
          ${post.content}
        )
      `
    }
    console.log(`✅ Blog post "${post.slug}" created successfully`)
    return { success: true }
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
      const errorMsg = `Blog post with slug "${post.slug}" already exists (unique constraint)`
      console.error(errorMsg, error)
      return { success: false, error: errorMsg }
    }
    
    // Handle other SQL errors
    const errorMsg = error.message || `Error creating blog post: ${String(error)}`
    console.error(`❌ Error creating blog post ${post.slug}:`, error)
    return { success: false, error: errorMsg }
  }
}

export async function updateBlogPost(slug: string, post: BlogPost): Promise<boolean> {
  if (!isPostgresAvailable()) {
    return false
  }

  try {
    // Format tags array for PostgreSQL
    const tagsArray = Array.isArray(post.tags) ? post.tags : []
    
    // For empty arrays, PostgreSQL needs ARRAY[]::text[]
    // For non-empty, we can pass the array directly
    if (tagsArray.length === 0) {
      await sql`
        UPDATE blog_posts
        SET 
          title = ${post.title},
          date = ${post.date},
          tags = ARRAY[]::text[],
          cover = ${post.cover || ''},
          content = ${post.content},
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${slug}
      `
    } else {
      await sql`
        UPDATE blog_posts
        SET 
          title = ${post.title},
          date = ${post.date},
          tags = ${tagsArray}::text[],
          cover = ${post.cover || ''},
          content = ${post.content},
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${slug}
      `
    }
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

