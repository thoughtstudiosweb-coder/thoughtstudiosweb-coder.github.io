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
  const success = await initDatabase()
  
  if (success) {
    console.log('✅ Database migration completed successfully')
    return { success: true, message: 'Database initialized' }
  } else {
    console.error('❌ Database migration failed')
    return { success: false, message: 'Database initialization failed' }
  }
}

