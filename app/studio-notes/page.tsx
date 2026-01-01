import PageLayout from '../components/PageLayout'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Studio Notes page - uses shared PageLayout for consistency
 * Scrolls to "studio-notes" section on load
 */
export default async function StudioNotesPage() {
  return <PageLayout scrollToSectionId="studio-notes" />
}

