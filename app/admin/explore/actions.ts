'use server'

import { writeJSON } from '@/lib/content'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function saveExplore(data: Array<{
  title: string
  description: string
  icon: string
}>) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await writeJSON('explore.json', data)
  
  if (success) {
    // Revalidate both CMS and website pages
    revalidatePath('/admin/explore')
    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/studio-notes')
    revalidatePath('/development')
    return { success: true }
  }
  
  throw new Error('Failed to save explore content')
}

