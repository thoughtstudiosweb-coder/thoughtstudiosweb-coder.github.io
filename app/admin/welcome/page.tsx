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

  const fetchWelcome = async () => {
    try {
      // Add cache-busting timestamp and no-cache option
      const res = await fetch(`/api/content/welcome?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      const data = await res.json()
      console.log('📥 Fetched welcome from API:', data)
      console.log('📋 Data:', JSON.stringify(data, null, 2))
      // Force state update by creating a new object reference
      const newData = data ? { ...data } : {}
      console.log('🔄 Setting welcome state')
      setData(newData)
      setLoading(false)
      return data
    } catch (error) {
      console.error('Error loading welcome content:', error)
      setLoading(false)
      return {}
    }
  }

  useEffect(() => {
    fetchWelcome()
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
        setMessage('Saved successfully! Refreshing data...')
        // Wait for connection pooling delay, then refetch to show updated data
        // Increased delay to 2 seconds to ensure Postgres data is visible
        setTimeout(async () => {
          console.log('🔄 Refetching welcome after save...')
          await fetchWelcome()
          setMessage('Saved successfully!')
          setTimeout(() => {
            setMessage('')
            setSaveSuccess(false)
          }, 2000)
        }, 2000)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Welcome Section</h1>
        <button
          onClick={async () => {
            setLoading(true)
            await fetchWelcome()
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          title="Refresh data from server"
        >
          🔄 Refresh
        </button>
      </div>

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

