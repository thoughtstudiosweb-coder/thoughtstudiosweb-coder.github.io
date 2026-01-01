import { getPageData } from '@/lib/page-data'
import Header from '../components/Header'
import LogoServer from '../components/LogoServer'
import Hero from '../components/Hero'
import Beliefs from '../components/Beliefs'
import Explore from '../components/Explore'
import StudioNotes from '../components/StudioNotes'
import Development from '../components/Development'
import Footer from '../components/Footer'
import ScrollToSection from '../components/ScrollToSection'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudioNotesPage() {
  // Fetch all page data using centralized function
  const { welcome, beliefs, explore, blogPosts } = await getPageData()

  // Fetch logo server-side (no API routes, no connection pooling delays)
  const logo = <LogoServer />

  return (
    <>
      <Header logo={logo} />
      <ScrollToSection sectionId="studio-notes" />
      <main className="main">
        <Hero data={welcome || { title: '', subtitle: '', ctaText: '', ctaLink: '', image: '' }} />
        <Beliefs data={beliefs || []} />
        <Explore data={explore || []} />
        <StudioNotes posts={blogPosts} />
        <Development />
      </main>
      <Footer />
    </>
  )
}

