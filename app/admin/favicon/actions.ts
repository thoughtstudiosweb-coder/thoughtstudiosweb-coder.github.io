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
    // Revalidate layout to update favicon metadata
    // Using 'layout' type ensures generateMetadata() is called again
    revalidatePath('/', 'layout')
    revalidatePath('/believe', 'layout')
    revalidatePath('/explore', 'layout')
    revalidatePath('/studio-notes', 'layout')
    revalidatePath('/development', 'layout')
    revalidatePath('/blog', 'layout')
    revalidatePath('/admin/favicon')
    return { success: true }
  }
  
  throw new Error('Failed to save favicon configuration')
}

export async function getFavicon(): Promise<FaviconConfig | null> {
  return await readJSON<FaviconConfig>('favicon.json')
}

