'use server'

import { writeJSON, readJSON } from '@/lib/content'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export interface LogoConfig {
  type: 'text' | 'image'
  // For text type
  text?: string
  fontSize?: number
  // For image type
  imageUrl?: string
  width?: number
  height?: number
}

export async function saveLogo(config: LogoConfig) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await writeJSON('logo.json', config)
  
  if (success) {
    // Revalidate all pages that use the logo
    revalidatePath('/')
    revalidatePath('/believe')
    revalidatePath('/explore')
    revalidatePath('/studio-notes')
    revalidatePath('/development')
    revalidatePath('/blog')
    revalidatePath('/admin/logo')
    return { success: true }
  }
  
  throw new Error('Failed to save logo configuration')
}

export async function getLogo(): Promise<LogoConfig | null> {
  return await readJSON<LogoConfig>('logo.json')
}

