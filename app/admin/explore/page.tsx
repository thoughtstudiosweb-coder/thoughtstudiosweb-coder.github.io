'use client'

import { useState, useEffect } from 'react'
import SaveButton from '../components/SaveButton'
import ImageUpload from '../components/ImageUpload'

interface Explore {
  title: string
  description: string
  icon: string
}

export default function ExploreEditor() {
  const [explore, setExplore] = useState<Explore[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/content/explore')
      .then((res) => {
        if (!res.ok) {
          console.error('Failed to load explore content:', res.status, res.statusText)
          return []
        }
        return res.json()
      })
      .then((data) => {
        setExplore(data || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading explore content:', error)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/content/explore', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(explore),
      })

      const data = await res.json()
      
      if (res.ok) {
        setSaveSuccess(true)
        setMessage('Saved successfully!')
        setTimeout(() => {
          setMessage('')
          setSaveSuccess(false)
        }, 3000)
      } else {
        const errorMsg = data.error || 'Error saving'
        const hint = data.hint ? `\n\n${data.hint}` : ''
        setMessage(`${errorMsg}${hint}`)
        setSaveSuccess(false)
      }
    } catch (error) {
      setMessage('Error saving')
      setSaveSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  const addExplore = () => {
    setExplore([...explore, { title: '', description: '', icon: '' }])
  }

  const removeExplore = (index: number) => {
    setExplore(explore.filter((_, i) => i !== index))
  }

  const updateExplore = (index: number, field: keyof Explore, value: string) => {
    const updated = [...explore]
    updated[index] = { ...updated[index], [field]: value }
    setExplore(updated)
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Explore Section</h1>
        <button
          onClick={addExplore}
          className="px-4 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark"
        >
          Add Card
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        {explore.map((item, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Card {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeExplore(index)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateExplore(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={item.description}
                onChange={(e) => updateExplore(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <ImageUpload
                value={item.icon}
                onChange={(url) => updateExplore(index, 'icon', url)}
                label="Icon"
                required={true}
              />
            </div>
          </div>
        ))}

        <SaveButton saving={saving} success={saveSuccess} />
      </form>
    </div>
  )
}

