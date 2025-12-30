'use client'

import { useState, useEffect } from 'react'
import ImageUpload from '../components/ImageUpload'
import SaveButton from '../components/SaveButton'

export default function WelcomeEditor() {
  const [data, setData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    image: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/content/welcome')
      .then((res) => res.json())
      .then((data) => {
        setData(data || {})
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/content/welcome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSaveSuccess(true)
        setMessage('Saved successfully!')
        setTimeout(() => {
          setMessage('')
          setSaveSuccess(false)
        }, 3000)
      } else {
        setMessage('Error saving')
        setSaveSuccess(false)
      }
    } catch (error) {
      setMessage('Error saving')
      setSaveSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Welcome Section</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
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

