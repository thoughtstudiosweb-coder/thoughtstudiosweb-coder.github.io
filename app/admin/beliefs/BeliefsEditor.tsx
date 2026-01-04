'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SaveButton from '../components/SaveButton'
import ImageUpload from '../components/ImageUpload'
import { saveBeliefs } from './actions'

interface Belief {
  title: string
  description: string
  icon: string
}

interface BeliefsEditorProps {
  initialData: Belief[]
}

export default function BeliefsEditor({ initialData }: BeliefsEditorProps) {
  const router = useRouter()
  const [beliefs, setBeliefs] = useState<Belief[]>(initialData)

  // Sync with server props when they change (after router.refresh())
  useEffect(() => {
    setBeliefs(initialData)
  }, [initialData])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveBeliefs(beliefs)
      setSaveSuccess(true)
      setMessage('Saved successfully! Refreshing...')
      // Refresh the page to get latest data from server
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Beliefs</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base flex-1 sm:flex-initial"
            title="Refresh data from server"
          >
            🔄 Refresh
          </button>
          <button
            onClick={addBelief}
            className="px-4 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark text-sm sm:text-base flex-1 sm:flex-initial"
          >
            Add Belief
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        {beliefs.map((belief, index) => (
          <div key={index} className="bg-gray-800 p-4 sm:p-6 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Belief {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeBelief(index)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base w-full sm:w-auto"
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

