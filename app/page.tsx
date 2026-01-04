import { getPageData } from '@/lib/page-data'
import Header from './components/Header'
import LogoServer from './components/LogoServer'
import Hero from './components/Hero'
import Beliefs from './components/Beliefs'
import Explore from './components/Explore'
import StudioNotes from './components/StudioNotes'
import Development from './components/Development'
import Footer from './components/Footer'
import ScrollAnimations from './components/ScrollAnimations'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Fetch all page data using centralized function
  console.log('🏠 Home page: Fetching page data...')
  const { welcome, beliefs, explore, blogPosts } = await getPageData()
  console.log(`🏠 Home page: Received ${blogPosts.length} blog posts`)

  // Fetch logo server-side (no API routes, no connection pooling delays)
  const logo = <LogoServer />

  return (
    <>
      <Header logo={logo} />
      <ScrollAnimations />
      <main className="main">
        <Hero data={welcome} />
        <Beliefs data={beliefs} />
        <Explore data={explore} />
        <StudioNotes posts={blogPosts} />
        <Development />
      </main>
      <Footer />
    </>
  )
}

