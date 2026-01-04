'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost } from '../../actions'
import ImageUpload from '../../../components/ImageUpload'

interface EditBlogPostProps {
  slug: string
  initialData: {
    title: string
    date: string
    tags: string[]
    cover: string
    content: string
  }
}

export default function EditBlogPost({ slug, initialData }: EditBlogPostProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData.title || '')
  const [date, setDate] = useState(initialData.date || '')
  const [tags, setTags] = useState(initialData.tags?.join(', ') || '')
  const [cover, setCover] = useState(initialData.cover || '')
  const [content, setContent] = useState(initialData.content || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await updatePost(slug, {
        title,
        date,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        cover,
        content,
      })
      
      setMessage('Post updated successfully! Redirecting...')
      router.push('/admin/blog')
      router.refresh()
    } catch (error: any) {
      setMessage(error.message || 'Error updating post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Edit Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-4 sm:p-6 rounded-lg">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
          />
        </div>

        <div>
          <ImageUpload
            value={cover}
            onChange={setCover}
            label="Cover Image"
            required={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content (Markdown)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white font-mono"
            rows={20}
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

