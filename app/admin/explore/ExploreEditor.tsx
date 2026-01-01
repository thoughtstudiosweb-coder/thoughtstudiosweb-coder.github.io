'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SaveButton from '../components/SaveButton'
import ImageUpload from '../components/ImageUpload'
import { saveExplore } from './actions'

interface Explore {
  title: string
  description: string
  icon: string
}

interface ExploreEditorProps {
  initialData: Explore[]
}

export default function ExploreEditor({ initialData }: ExploreEditorProps) {
  const router = useRouter()
  const [explore, setExplore] = useState<Explore[]>(initialData)

  // Sync with server props when they change (after router.refresh())
  useEffect(() => {
    setExplore(initialData)
  }, [initialData])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveExplore(explore)
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Explore Section</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            title="Refresh data from server"
          >
            🔄 Refresh
          </button>
          <button
            onClick={addExplore}
            className="px-4 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark"
          >
            Add Card
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
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
                label="Icon (Optional)"
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

