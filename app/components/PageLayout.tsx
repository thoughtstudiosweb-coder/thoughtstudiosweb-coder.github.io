import { getPageData } from '@/lib/page-data'
import Header from './Header'
import LogoServer from './LogoServer'
import Hero from './Hero'
import Beliefs from './Beliefs'
import Explore from './Explore'
import StudioNotes from './StudioNotes'
import Development from './Development'
import Footer from './Footer'
import ScrollAnimations from './ScrollAnimations'
import ScrollToSection from './ScrollToSection'

interface PageLayoutProps {
  /**
   * Optional section ID to scroll to on page load
   * Only used on sub-routes, not homepage
   */
  scrollToSectionId?: string
}

/**
 * Shared page layout component that ensures consistent behavior
 * across all routes (homepage and sub-routes).
 * 
 * All pages use the same data fetching, component structure, and rendering.
 * Components handle null/empty data gracefully.
 */
export default async function PageLayout({ scrollToSectionId }: PageLayoutProps) {
  // Fetch all page data using centralized function
  // This ensures consistent data fetching across all routes
  const { welcome, beliefs, explore, blogPosts } = await getPageData()

  // Fetch logo server-side (no API routes, no connection pooling delays)
  const logo = <LogoServer />

  return (
    <>
      <Header logo={logo} />
      <ScrollAnimations />
      {scrollToSectionId && <ScrollToSection sectionId={scrollToSectionId} />}
      <main className="main">
        {/* Components handle null/empty data gracefully */}
        <Hero data={welcome} />
        <Beliefs data={beliefs || []} />
        <Explore data={explore || []} />
        <StudioNotes posts={blogPosts || []} />
        <Development />
      </main>
      <Footer />
    </>
  )
}

