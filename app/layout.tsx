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
  const faviconUrl = faviconConfig?.url || '/favicon.svg'

  return {
    title: 'Thought Studios™',
    description: 'A place to think clearly',
    icons: {
      icon: faviconUrl,
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

