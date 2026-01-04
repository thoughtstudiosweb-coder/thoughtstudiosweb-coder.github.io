import PageLayout from '../components/PageLayout'
import ScrollAnimations from '../components/ScrollAnimations'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudioNotesPage() {
  return (
    <>
      <PageLayout scrollToSectionId="studio-notes" />
      <ScrollAnimations />
    </>
  )
}

