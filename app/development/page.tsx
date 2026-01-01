import PageLayout from '../components/PageLayout'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Development page - uses shared PageLayout for consistency
 * Scrolls to "development" section on load
 */
export default async function DevelopmentPage() {
  return <PageLayout scrollToSectionId="development" />
}

