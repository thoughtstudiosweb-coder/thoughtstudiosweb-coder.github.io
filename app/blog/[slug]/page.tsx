import { readMarkdownFile } from '@/lib/content'
import matter from 'gray-matter'
import { marked } from 'marked'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import BlogImage from '@/app/components/BlogImage'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const content = await readMarkdownFile(params.slug)
  
  if (!content) {
    notFound()
  }

  const { data, content: body } = matter(content)
  const htmlContent = marked.parse(body)

  return (
    <>
      <Header />
      <main className="main">
        <div className="blog-post-detail">
          <div className="blog-post-header">
            <div className="blog-post-image-container">
              <BlogImage
                src={data.cover || ''}
                alt={data.title || ''}
                className="blog-post-image"
              />
            </div>
            <div className="blog-post-meta">
              <div className="blog-post-date">{formatDate(data.date || '')}</div>
              <h1 className="blog-post-title">{data.title}</h1>
            </div>
          </div>
          <div
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

