'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  cover: string
  excerpt: string
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const res = await fetch('/api/blog')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const res = await fetch(`/api/blog/delete/${slug}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      fetchPosts()
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.slug} className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{post.date}</p>
              <p className="text-gray-300">{post.excerpt.substring(0, 150)}...</p>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/admin/blog/edit/${post.slug}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
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

