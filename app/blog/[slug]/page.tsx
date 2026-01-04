import { getBlogPost } from '@/lib/db'
import { getSiteContent } from '@/lib/site-content'
import { marked } from 'marked'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import LogoServer from '@/app/components/LogoServer'
import Footer from '@/app/components/Footer'
import BlogImage from '@/app/components/BlogImage'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    notFound()
  }

  const htmlContent = marked.parse(post.content || '')

  // Fetch logo and site content server-side (no API routes, no connection pooling delays)
  const [logo, siteContent] = await Promise.all([
    Promise.resolve(<LogoServer />),
    getSiteContent(),
  ])

  return (
    <>
      <Header logo={logo} navigation={siteContent.navigation} />
      <main className="main">
        <div className="blog-post-detail">
          <div className="blog-post-header">
            <div className="blog-post-image-container">
              <BlogImage
                src={post.cover || ''}
                alt={post.title || ''}
                className="blog-post-image"
              />
            </div>
            <div className="blog-post-meta">
              <div className="blog-post-date">{formatDate(post.date || '')}</div>
              <h1 className="blog-post-title">{post.title}</h1>
            </div>
          </div>
          <div
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </main>
      <Footer 
        tagline={siteContent.footer.tagline}
        copyright={siteContent.footer.copyright}
        navigation={siteContent.navigation}
      />
    </>
  )
}

