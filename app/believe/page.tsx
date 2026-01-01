import PageLayout from '../components/PageLayout'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Believe page - uses shared PageLayout for consistency
 * Scrolls to "believe" section on load
 */
export default async function BelievePage() {
  return <PageLayout scrollToSectionId="believe" />
}

