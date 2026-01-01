'use server'

import { writeJSON, readJSON } from '@/lib/content'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export interface FaviconConfig {
  url: string
}

export async function saveFavicon(config: FaviconConfig) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await writeJSON('favicon.json', config)
  
  if (success) {
    // Revalidate all pages to update favicon
    revalidatePath('/', 'layout')
    revalidatePath('/believe')
    revalidatePath('/explore')
    revalidatePath('/studio-notes')
    revalidatePath('/development')
    revalidatePath('/blog')
    revalidatePath('/admin/favicon')
    return { success: true }
  }
  
  throw new Error('Failed to save favicon configuration')
}

export async function getFavicon(): Promise<FaviconConfig | null> {
  return await readJSON<FaviconConfig>('favicon.json')
}

