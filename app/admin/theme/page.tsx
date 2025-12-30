import { readJSON } from '@/lib/content'
import ThemeEditor from './ThemeEditor'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export default async function ThemePage() {
  console.log('🔍 Theme page: Fetching data from Postgres...')
  const theme = await readJSON<Theme>('theme.json')
  console.log(`✅ Theme page: Retrieved theme data ${theme ? '(exists)' : '(null)'}`)
  
  return <ThemeEditor initialData={theme} />
}
