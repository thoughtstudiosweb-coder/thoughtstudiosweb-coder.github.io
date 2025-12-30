import { getPageData } from '@/lib/page-data'
import Header from './components/Header'
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
  const { welcome, beliefs, explore, blogPosts } = await getPageData()

  return (
    <>
      <Header />
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

