'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deletePost } from './actions'

interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  cover: string
  excerpt: string
}

interface BlogManagerProps {
  initialPosts: BlogPost[]
}

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Sync with server props when they change (after router.refresh())
  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setDeleting(slug)
    try {
      await deletePost(slug)
      // Refresh the page to get latest data from server
      router.refresh()
    } catch (error: any) {
      alert(`Failed to delete post: ${error.message}`)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Blog Posts</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base flex-1 sm:flex-initial"
            title="Refresh data from server"
          >
            🔄 Refresh
          </button>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark text-sm sm:text-base flex-1 sm:flex-initial text-center"
          >
            New Post
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.slug} className="bg-gray-800 p-4 sm:p-6 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 break-words">{post.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{post.date}</p>
              <p className="text-gray-300 text-sm sm:text-base break-words">{post.excerpt.substring(0, 150)}...</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href={`/admin/blog/edit/${post.slug}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base flex-1 sm:flex-initial text-center"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
                disabled={deleting === post.slug}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-initial"
              >
                {deleting === post.slug ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No blog posts yet. Create your first post!
          </div>
        )}
      </div>
    </div>
  )
}

