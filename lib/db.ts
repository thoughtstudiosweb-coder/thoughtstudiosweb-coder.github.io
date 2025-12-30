import { sql } from '@vercel/postgres'

// Check if Postgres is available
export function isPostgresAvailable(): boolean {
  // Supports both Vercel Postgres and Neon DB
  // Neon DB uses POSTGRES_URL, which is compatible with @vercel/postgres
  // Also check for POSTGRES_PRISMA_URL or POSTGRES_URL_NON_POOLING
  return !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL)
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
    console.log(`💾 Saving content for key: ${key}`)
    const result = await sql`
      INSERT INTO content (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = ${JSON.stringify(value)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
    `
    
    // Wait a brief moment for the database to commit (connection pooling can cause delays)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verify the content was saved
    const verify = await getContent(key)
    if (verify) {
      console.log(`✅ Content saved and verified for key: ${key}`)
      return true
    } else {
      console.error(`❌ Content saved but cannot be retrieved for key: ${key}`)
      // Wait and retry once (connection pooling issue)
      await new Promise(resolve => setTimeout(resolve, 300))
      const retryVerify = await getContent(key)
      if (retryVerify) {
        console.log(`✅ Content verified on retry for key: ${key}`)
        return true
      }
      return false
    }
  } catch (error: any) {
    console.error(`❌ Error writing content ${key}:`, error)
    console.error('Error details:', error.message, error.code)
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
    console.warn('⚠️ Postgres not available, returning empty blog posts array')
    return []
  }

  try {
    console.log('🔍 Querying blog_posts table...')
    const result = await sql`
      SELECT slug, title, date, tags, cover, content
      FROM blog_posts
      ORDER BY date DESC, created_at DESC
    `
    
    console.log(`✅ Found ${result.rows.length} blog posts in database`)
    
    const posts = result.rows.map(row => {
      // Ensure date is formatted as YYYY-MM-DD string
      let dateStr = row.date
      if (dateStr instanceof Date) {
        dateStr = dateStr.toISOString().split('T')[0]
      } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0]
      } else if (typeof dateStr === 'string') {
        dateStr = dateStr
      } else {
        dateStr = String(dateStr)
      }
      
      return {
        slug: row.slug,
        title: row.title,
        date: dateStr,
        tags: Array.isArray(row.tags) ? row.tags : [],
        cover: row.cover || '',
        content: row.content || '',
      }
    })
    
    console.log(`📋 Returning ${posts.length} formatted blog posts`)
    return posts
  } catch (error: any) {
    console.error('❌ Error reading blog posts:', error)
    console.error('Error details:', error.message, error.code)
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
      console.log(`⚠️ Blog post with slug "${slug}" not found in database`)
      return null
    }
    const row = result.rows[0]
    
    // Format date as YYYY-MM-DD string
    let dateStr = row.date
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0]
    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0]
    } else if (typeof dateStr !== 'string') {
      dateStr = String(dateStr)
    }
    
    return {
      slug: row.slug,
      title: row.title,
      date: dateStr,
      tags: Array.isArray(row.tags) ? row.tags : [],
      cover: row.cover || '',
      content: row.content || '',
    }
  } catch (error: any) {
    console.error(`❌ Error reading blog post ${slug}:`, error)
    console.error('Error details:', error.message, error.code)
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
    
    // Format as PostgreSQL array literal: '{}' for empty, '{tag1,tag2}' for non-empty
    // Escape single quotes in tag values
    const tagsString = tagsArray.length === 0 
      ? '{}'
      : `{${tagsArray.map(tag => `"${String(tag).replace(/"/g, '\\"')}"`).join(',')}}`
    
    console.log(`📝 Inserting blog post "${post.slug}" into database...`)
    console.log(`   Title: ${post.title}`)
    console.log(`   Date: ${post.date}`)
    console.log(`   Tags: ${tagsString}`)
    console.log(`   Content length: ${(post.content || '').length} chars`)
    
    // Insert the post
    const insertResult = await sql`
      INSERT INTO blog_posts (slug, title, date, tags, cover, content)
      VALUES (
        ${post.slug},
        ${post.title},
        ${post.date}::date,
        ${tagsString}::text[],
        ${post.cover || ''},
        ${post.content}
      )
      RETURNING slug
    `
    
    if (insertResult.rows.length === 0) {
      console.error(`❌ Blog post "${post.slug}" INSERT returned no rows`)
      return { success: false, error: 'Post insertion failed - no rows returned' }
    }
    
    console.log(`✅ Blog post "${post.slug}" inserted successfully`)
    
    // Wait a brief moment for the database to commit (connection pooling can cause delays)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verify the post was actually inserted by querying it back
    const verifyPost = await getBlogPost(post.slug)
    if (verifyPost) {
      console.log(`✅ Blog post "${post.slug}" created and verified in database`)
      return { success: true }
    } else {
      // Try one more time after a longer delay (connection pooling issue)
      console.log(`⏳ Retrying verification for "${post.slug}" after delay...`)
      await new Promise(resolve => setTimeout(resolve, 500))
      const retryVerify = await getBlogPost(post.slug)
      if (retryVerify) {
        console.log(`✅ Blog post "${post.slug}" verified on retry`)
        return { success: true }
      }
      
      console.error(`❌ Blog post "${post.slug}" was inserted but cannot be retrieved after retry`)
      console.error(`   Insert returned: ${insertResult.rows.length} rows`)
      return { success: false, error: 'Post was created but cannot be retrieved. This may be a connection pooling issue. Please refresh and check again.' }
    }
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
    
    // Format as PostgreSQL array literal: '{}' for empty, '{tag1,tag2}' for non-empty
    // Escape double quotes in tag values
    const tagsString = tagsArray.length === 0 
      ? '{}'
      : `{${tagsArray.map(tag => `"${String(tag).replace(/"/g, '\\"')}"`).join(',')}}`
    
    await sql`
      UPDATE blog_posts
      SET 
        title = ${post.title},
        date = ${post.date},
        tags = ${tagsString}::text[],
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

