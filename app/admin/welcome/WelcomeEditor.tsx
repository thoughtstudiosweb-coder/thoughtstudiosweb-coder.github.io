'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'
import SaveButton from '../components/SaveButton'
import { saveWelcome } from './actions'

interface WelcomeData {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
}

interface WelcomeEditorProps {
  initialData: WelcomeData | null
}

export default function WelcomeEditor({ initialData }: WelcomeEditorProps) {
  const router = useRouter()
  const [data, setData] = useState<WelcomeData>(
    initialData || {
      title: '',
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      image: '',
    }
  )

  // Sync with server props when they change (after router.refresh())
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveWelcome(data)
      setSaveSuccess(true)
      setMessage('Saved successfully! Refreshing...')
      router.refresh()
      setTimeout(() => {
        setMessage('Saved successfully!')
        setTimeout(() => {
          setMessage('')
          setSaveSuccess(false)
        }, 2000)
      }, 500)
    } catch (error: any) {
      setMessage(error.message || 'Error saving')
      setSaveSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Welcome Section</h1>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base w-full sm:w-auto"
          title="Refresh data from server"
        >
          🔄 Refresh
        </button>
      </div>

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
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subtitle
          </label>
          <textarea
            value={data.subtitle}
            onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CTA Text
          </label>
          <input
            type="text"
            value={data.ctaText}
            onChange={(e) => setData({ ...data, ctaText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CTA Link
          </label>
          <input
            type="text"
            value={data.ctaLink}
            onChange={(e) => setData({ ...data, ctaLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
          />
        </div>

        <div>
          <ImageUpload
            value={data.image}
            onChange={(url) => setData({ ...data, image: url })}
            label="Image (optional)"
            required={false}
          />
        </div>

        <SaveButton saving={saving} success={saveSuccess} />
      </form>
    </div>
  )
}

