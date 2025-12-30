'use client'

import { useState, useEffect } from 'react'
import SaveButton from '../components/SaveButton'
import ImageUpload from '../components/ImageUpload'

interface Belief {
  title: string
  description: string
  icon: string
}

export default function BeliefsEditor() {
  const [beliefs, setBeliefs] = useState<Belief[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchBeliefs = async () => {
    try {
      // Add cache-busting timestamp and no-cache option
      const res = await fetch(`/api/content/beliefs?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      if (!res.ok) {
        console.error('Failed to load beliefs content:', res.status, res.statusText)
        return []
      }
      const data = await res.json()
      console.log('📥 Fetched beliefs from API:', data.length, 'items')
      console.log('📋 Data:', JSON.stringify(data, null, 2))
      // Force state update by creating a new array reference
      const newBeliefs = Array.isArray(data) ? [...data] : []
      console.log('🔄 Setting beliefs state with', newBeliefs.length, 'items')
      setBeliefs(newBeliefs)
      setLoading(false)
      return data
    } catch (error) {
      console.error('Error loading beliefs content:', error)
      setLoading(false)
      return []
    }
  }

  useEffect(() => {
    fetchBeliefs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/content/beliefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beliefs),
      })

      const data = await res.json()
      
      if (res.ok) {
        setSaveSuccess(true)
        setMessage('Saved successfully! Refreshing data...')
        // Wait for connection pooling delay, then refetch to show updated data
        // Increased delay to 2 seconds to ensure Postgres data is visible
        setTimeout(async () => {
          console.log('🔄 Refetching beliefs after save...')
          await fetchBeliefs()
          setMessage('Saved successfully!')
          setTimeout(() => {
            setMessage('')
            setSaveSuccess(false)
          }, 2000)
        }, 2000)
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

  const addBelief = () => {
    setBeliefs([...beliefs, { title: '', description: '', icon: '' }])
  }

  const removeBelief = (index: number) => {
    setBeliefs(beliefs.filter((_, i) => i !== index))
  }

  const updateBelief = (index: number, field: keyof Belief, value: string) => {
    const updated = [...beliefs]
    updated[index] = { ...updated[index], [field]: value }
    setBeliefs(updated)
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Beliefs</h1>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setLoading(true)
              await fetchBeliefs()
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            title="Refresh data from server"
          >
            🔄 Refresh
          </button>
          <button
            onClick={addBelief}
            className="px-4 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark"
          >
            Add Belief
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        {beliefs.map((belief, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Belief {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeBelief(index)}
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
                value={belief.title}
                onChange={(e) => updateBelief(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={belief.description}
                onChange={(e) => updateBelief(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <ImageUpload
                value={belief.icon}
                onChange={(url) => updateBelief(index, 'icon', url)}
                label="Icon (optional)"
                required={false}
              />
            </div>
          </div>
        ))}

        <SaveButton saving={saving} success={saveSuccess} />
      </form>
    </div>
  )
}

