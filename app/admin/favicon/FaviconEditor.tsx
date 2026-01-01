'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'
import SaveButton from '../components/SaveButton'
import { saveFavicon, type FaviconConfig } from './actions'

interface FaviconEditorProps {
  initialData: FaviconConfig | null
}

const DEFAULT_FAVICON: FaviconConfig = {
  url: '/favicon.svg',
}

export default function FaviconEditor({ initialData }: FaviconEditorProps) {
  const router = useRouter()
  const [config, setConfig] = useState<FaviconConfig>(initialData || DEFAULT_FAVICON)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync with server props when they change
  useEffect(() => {
    setConfig(initialData || DEFAULT_FAVICON)
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveFavicon(config)
      setSaveSuccess(true)
      setMessage('Saved successfully! Refreshing...')
      
      // Wait for database write to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh to show updated favicon
      setTimeout(() => {
        router.refresh()
        setMessage('Saved successfully!')
        setTimeout(() => {
          setMessage('')
          setSaveSuccess(false)
        }, 2000)
      }, 1500)
    } catch (error: any) {
      setMessage(error.message || 'Error saving')
      setSaveSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Favicon Configuration</h1>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          title="Refresh data from server"
        >
          🔄 Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Favicon URL
          </label>
          <p className="text-sm text-gray-400 mb-3">
            Upload an image file (SVG, PNG, ICO) or enter a URL. Recommended size: 32x32px or 64x64px.
          </p>
          <ImageUpload
            value={config.url || ''}
            onChange={(url) => setConfig({ ...config, url })}
            label="Favicon Image"
            required={true}
          />
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-900 rounded">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
          <div className="flex items-center gap-4">
            {config.url && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400">16x16</div>
                  <img
                    src={config.url}
                    alt="Favicon preview 16x16"
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400">32x32</div>
                  <img
                    src={config.url}
                    alt="Favicon preview 32x32"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400">64x64</div>
                  <img
                    src={config.url}
                    alt="Favicon preview 64x64"
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <SaveButton saving={saving} success={saveSuccess} />
      </form>
    </div>
  )
}

