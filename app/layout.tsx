import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './components/ThemeProvider'
import { getFavicon } from './admin/favicon/actions'

// Force dynamic rendering to ensure theme and favicon are always fresh
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Generate metadata dynamically including favicon
export async function generateMetadata(): Promise<Metadata> {
  const faviconConfig = await getFavicon()
  let faviconUrl = faviconConfig?.url || '/favicon.svg'
  
  // Add cache-busting parameter based on URL hash to force browser reload when favicon changes
  // Using URL hash ensures same URL = same version, different URL = different version
  const urlHash = faviconUrl.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0
  }, 0)
  const separator = faviconUrl.includes('?') ? '&' : '?'
  faviconUrl = `${faviconUrl}${separator}v=${Math.abs(urlHash)}`

  return {
    title: 'Thought Studios™',
    description: 'A place to think clearly',
    icons: {
      icon: [
        { url: faviconUrl, sizes: 'any' },
        { url: faviconUrl, type: 'image/svg+xml' },
      ],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider />
        {children}
      </body>
    </html>
  )
}

