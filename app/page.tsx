import PageLayout from './components/PageLayout'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Homepage - uses shared PageLayout for consistency
 * No scrollToSectionId since this is the homepage
 */
export default async function Home() {
  return <PageLayout />
}

