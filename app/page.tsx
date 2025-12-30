import { readJSON, readMarkdownFiles } from '@/lib/content'
import matter from 'gray-matter'
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
  let welcome = await readJSON<{
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    image: string
  }>('welcome.json')

  let beliefs = await readJSON<Array<{
    title: string
    description: string
    icon: string
  }>>('beliefs.json')

  let explore = await readJSON<Array<{
    title: string
    description: string
    icon: string
  }>>('explore.json')

  // Fallback to empty arrays if null
  if (!beliefs) beliefs = []
  if (!explore) explore = []

  const blogFiles = await readMarkdownFiles()
  const blogPosts = blogFiles
    .map(({ slug, content }: { slug: string; content: string }) => {
      try {
        const { data, content: body } = matter(content)
        return {
          slug,
          title: (data.title as string) || '',
          date: (data.date as string) || '',
          tags: (data.tags as string[]) || [],
          cover: (data.cover as string) || '',
          excerpt: body.split('\n').slice(0, 3).join(' ').substring(0, 200),
          content: body,
        }
      } catch (error) {
        console.error(`Error parsing blog post ${slug}:`, error)
        return null
      }
    })
        .filter((post: any): post is { slug: string; title: string; date: string; tags: string[]; cover: string; excerpt: string; content: string } => post !== null)
        .sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })

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

