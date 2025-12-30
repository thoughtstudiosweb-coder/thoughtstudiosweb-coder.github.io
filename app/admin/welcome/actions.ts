'use server'

import { writeJSON } from '@/lib/content'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function saveWelcome(data: {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
}) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await writeJSON('welcome.json', data)
  
  if (success) {
    // Revalidate both CMS and website pages
    revalidatePath('/admin/welcome')
    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/studio-notes')
    revalidatePath('/development')
    return { success: true }
  }
  
  throw new Error('Failed to save welcome content')
}

