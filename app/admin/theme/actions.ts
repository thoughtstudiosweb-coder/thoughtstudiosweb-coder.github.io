'use server'

import { writeJSON } from '@/lib/content'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

interface ThemeColors {
  bgDark: string
  bgCard: string
  bgCardHover: string
  textWhite: string
  textGray: string
  accentRoseGold: string
  accentRoseGoldLight: string
  accentRoseGoldDark: string
  borderColor: string
  headerBg: string
  footerBg: string
  shadowColor: string
}

interface Theme {
  dark: ThemeColors
  light: ThemeColors
}

export async function saveTheme(data: Theme) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await writeJSON('theme.json', data)
  
  if (success) {
    // Revalidate both CMS and website pages
    revalidatePath('/admin/theme')
    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/studio-notes')
    revalidatePath('/development')
    return { success: true }
  }
  
  throw new Error('Failed to save theme')
}

