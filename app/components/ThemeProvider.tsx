import { readJSON } from '@/lib/content'

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

/**
 * Maps database theme property names to CSS variable names
 */
function mapThemeToCSSVars(themeColors: ThemeColors): Record<string, string> {
  return {
    '--bg-dark': themeColors.bgDark,
    '--bg-card': themeColors.bgCard,
    '--bg-card-hover': themeColors.bgCardHover,
    '--text-white': themeColors.textWhite,
    '--text-gray': themeColors.textGray,
    '--accent-rose-gold': themeColors.accentRoseGold,
    '--accent-rose-gold-light': themeColors.accentRoseGoldLight,
    '--accent-rose-gold-dark': themeColors.accentRoseGoldDark,
    '--border-color': themeColors.borderColor,
    '--header-bg': themeColors.headerBg,
    '--footer-bg': themeColors.footerBg,
    '--shadow-color': themeColors.shadowColor,
  }
}

export default async function ThemeProvider() {
  // Fetch theme data from database
  const theme = await readJSON<Theme>('theme.json')
  
  if (!theme) {
    // If no theme data, return null - CSS will use default values
    return null
  }

  // Map theme colors to CSS variables
  const darkVars = mapThemeToCSSVars(theme.dark)
  const lightVars = mapThemeToCSSVars(theme.light)

  // Generate CSS string with theme variables
  const darkCSS = Object.entries(darkVars)
    .map(([key, value]) => `    ${key}: ${value};`)
    .join('\n')

  const lightCSS = Object.entries(lightVars)
    .map(([key, value]) => `    ${key}: ${value};`)
    .join('\n')

  // Generate CSS string
  const css = `
    :root {
      /* Dark Mode - Dynamically loaded from database */
${darkCSS}
      /* Keep additional gradients and colors that aren't in theme */
      --accent-green: #00FF88;
      --accent-teal: #00D4AA;
      --accent-blue: ${theme.dark.accentRoseGold};
      --accent-rose-gold-metallic: linear-gradient(135deg, ${theme.dark.accentRoseGoldLight} 0%, ${theme.dark.accentRoseGold} 50%, ${theme.dark.accentRoseGoldDark} 100%);
      --gradient-blue-green: linear-gradient(135deg, #00B8FF 0%, #00D4AA 50%, #00FF88 100%);
    }

    [data-theme="light"] {
      /* Light Mode - Dynamically loaded from database */
${lightCSS}
      /* Keep additional gradients and colors that aren't in theme */
      --accent-green: #00C870;
      --accent-teal: #00B89A;
      --accent-blue: ${theme.light.accentRoseGold};
      --accent-rose-gold-metallic: linear-gradient(135deg, ${theme.light.accentRoseGoldLight} 0%, ${theme.light.accentRoseGold} 50%, ${theme.light.accentRoseGoldDark} 100%);
      --gradient-blue-green: linear-gradient(135deg, #0099CC 0%, #00B89A 50%, #00C870 100%);
    }
  `

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  )
}

