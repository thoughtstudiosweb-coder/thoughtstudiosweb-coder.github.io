import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './components/ThemeProvider'

// Force dynamic rendering to ensure theme is always fresh
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Thought Studios™',
  description: 'A place to think clearly',
  icons: {
    icon: '/favicon.svg',
  },
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

