import { getPageData } from '@/lib/page-data'
import { getSiteContent } from '@/lib/site-content'
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
  // Fetch page data and site content in parallel for performance
  const [pageData, siteContent] = await Promise.all([
    getPageData(),
    getSiteContent(),
  ])

  const { welcome, beliefs, explore, blogPosts } = pageData

  // Fetch logo server-side (no API routes, no connection pooling delays)
  const logo = <LogoServer />

  return (
    <>
      <Header logo={logo} navigation={siteContent.navigation} />
      <ScrollAnimations />
      {scrollToSectionId && <ScrollToSection sectionId={scrollToSectionId} />}
      <main className="main">
        {/* Components handle null/empty data gracefully */}
        <Hero data={welcome} />
        <Beliefs data={beliefs || []} sectionTitle={siteContent.sections.believe.title} />
        <Explore data={explore || []} sectionTitle={siteContent.sections.explore.title} />
        <StudioNotes posts={blogPosts || []} sectionTitle={siteContent.sections.studioNotes.title} />
        <Development 
          sectionTitle={siteContent.sections.development.title}
          intro={siteContent.sections.development.intro}
          outro={siteContent.sections.development.outro}
        />
      </main>
      <Footer 
        tagline={siteContent.footer.tagline}
        copyright={siteContent.footer.copyright}
        navigation={siteContent.navigation}
      />
    </>
  )
}
