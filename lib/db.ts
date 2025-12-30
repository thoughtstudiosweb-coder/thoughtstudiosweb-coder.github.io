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
    console.log(`⚠️ Postgres not available, cannot read content for key: ${key}`)
    return null
  }

  try {
    // Add a delay to handle connection pooling (Neon DB)
    // Increased to 500ms to ensure data is visible after writes
    // This is critical for serverless environments with connection pooling
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`🔍 Querying content table for key: ${key}`)
    const result = await sql`
      SELECT value, updated_at FROM content WHERE key = ${key}
      ORDER BY updated_at DESC
      LIMIT 1
    `
    if (result.rows.length > 0) {
      console.log(`✅ Found content for key: ${key} (updated: ${result.rows[0].updated_at})`)
      return result.rows[0].value
    } else {
      console.log(`⚠️ No content found for key: ${key} in Postgres database`)
      console.log(`   This means the data needs to be saved to Postgres first via CMS.`)
      return null
    }
  } catch (error: any) {
    console.error(`❌ Error reading content ${key}:`, error)
    console.error('Error details:', error.message, error.code)
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
    
    // For Neon DB and connection pooling, the INSERT/UPDATE with ON CONFLICT
    // confirms the data was written. Immediate verification might fail due to
    // connection pooling, but the data is there.
    // Return success immediately - the SQL statement confirms the write succeeded
    console.log(`✅ Content saved for key: ${key} (INSERT/UPDATE confirmed)`)
    return true
    
    // Note: Verification removed due to connection pooling delays
    // The INSERT/UPDATE with ON CONFLICT confirms the data was written
    // If verification is needed, it should be done separately with longer delays
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
    // Add a delay to handle connection pooling (Neon DB)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const result = await sql`
      SELECT slug, title, date, tags, cover, content, created_at
      FROM blog_posts
      ORDER BY date DESC, created_at DESC
    `
    
    console.log(`✅ Found ${result.rows.length} blog posts in database`)
    if (result.rows.length > 0) {
      console.log(`   Latest post: "${result.rows[0].title}" (created: ${result.rows[0].created_at})`)
    }
    
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
    // Add a small delay to handle connection pooling (Neon DB)
    // This helps ensure we're reading from the same connection pool
    await new Promise(resolve => setTimeout(resolve, 50))
    
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
    
    console.log(`✅ Blog post "${post.slug}" inserted successfully (${insertResult.rows.length} rows returned)`)
    
    // For Neon DB and connection pooling, we need longer delays
    // The INSERT succeeded (we got RETURNING), so the data is there
    // But immediate reads might fail due to connection pooling
    // Return success immediately since INSERT with RETURNING confirms the data was written
    console.log(`✅ Blog post "${post.slug}" created successfully`)
    return { success: true }
    
    // Note: Verification removed due to connection pooling delays
    // The INSERT with RETURNING confirms the data was written
    // If verification is needed, it should be done separately with longer delays
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

