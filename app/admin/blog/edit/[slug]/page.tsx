import { getPost } from '../../actions'
import EditBlogPost from './EditBlogPost'
import { notFound } from 'next/navigation'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditBlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  console.log(`🔍 Edit blog post page: Fetching post "${params.slug}" from Postgres...`)
  const post = await getPost(params.slug)
  
  if (!post) {
    console.log(`⚠️ Post "${params.slug}" not found`)
    notFound()
  }
  
  console.log(`✅ Edit blog post page: Retrieved post "${params.slug}"`)
  return <EditBlogPost slug={params.slug} initialData={post} />
}
