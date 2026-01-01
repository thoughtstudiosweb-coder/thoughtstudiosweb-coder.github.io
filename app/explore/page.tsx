import PageLayout from '../components/PageLayout'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Explore page - uses shared PageLayout for consistency
 * Scrolls to "explore" section on load
 */
export default async function ExplorePage() {
  return <PageLayout scrollToSectionId="explore" />
}

