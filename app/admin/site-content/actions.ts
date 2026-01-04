'use server'

import { writeJSON } from '@/lib/content'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import type { SiteContent } from '@/lib/site-content'

export async function saveSiteContent(data: SiteContent) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await writeJSON('site-content.json', data)
  
  if (success) {
    // Revalidate all pages that use site content
    revalidatePath('/admin/site-content')
    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/studio-notes')
    revalidatePath('/development')
    return { success: true }
  }
  
  throw new Error('Failed to save site content')
}

export async function getSiteContent() {
  const { getSiteContent: getContent } = await import('@/lib/site-content')
  return await getContent()
}

