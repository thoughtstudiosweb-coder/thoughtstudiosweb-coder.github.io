/**
 * Database Migration Script
 * 
 * Run this once to initialize the database tables.
 * This can be called from an API route or run manually.
 * 
 * Usage:
 * - API: POST /api/migrate (protected)
 * - Or import and call initDatabase() from lib/db.ts
 */

import { initDatabase } from './db'

export async function migrate() {
  console.log('Starting database migration...')
  
  // Check if Postgres is available
  const { isPostgresAvailable } = await import('./db')
  if (!isPostgresAvailable()) {
    const errorMsg = 'Postgres is not available. Please check POSTGRES_URL environment variable.'
    console.error('❌', errorMsg)
    return { success: false, message: errorMsg }
  }
  
  try {
    const success = await initDatabase()
    
    if (success) {
      console.log('✅ Database migration completed successfully')
      return { success: true, message: 'Database initialized successfully' }
    } else {
      console.error('❌ Database migration failed - initDatabase returned false')
      return { success: false, message: 'Database initialization failed. Check server logs for details.' }
    }
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error during migration'
    console.error('❌ Database migration error:', error)
    return { success: false, message: `Migration error: ${errorMsg}` }
  }
}

