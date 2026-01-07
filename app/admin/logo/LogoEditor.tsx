'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'
import SaveButton from '../components/SaveButton'
import { saveLogo, type LogoConfig } from './actions'

interface LogoEditorProps {
  initialData: LogoConfig | null
}

const DEFAULT_LOGO: LogoConfig = {
  type: 'text',
  text: 'Thought Studios™',
  fontSize: 24,
}

export default function LogoEditor({ initialData }: LogoEditorProps) {
  const router = useRouter()
  const [config, setConfig] = useState<LogoConfig>(initialData || DEFAULT_LOGO)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync with server props when they change
  useEffect(() => {
    if (initialData) {
      setConfig(initialData)
    } else {
      setConfig(DEFAULT_LOGO)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveLogo(config)
      setSaveSuccess(true)
      setMessage('Saved successfully!')
      
      // Wait for database write to propagate (connection pooling delay)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh to trigger server-side re-render
      router.refresh()
      
      setTimeout(() => {
        setMessage('')
        setSaveSuccess(false)
      }, 2000)
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Logo Configuration</h1>
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
            Logo Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={config.type === 'text'}
                onChange={(e) => {
                  const { imageUrl, width, height, ...rest } = config
                  setConfig({ 
                    ...rest, 
                    type: 'text' as const
                  })
                }}
                className="mr-2"
              />
              <span className="text-white">Text</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="image"
                checked={config.type === 'image'}
                onChange={(e) => {
                  const { text, fontSize, ...rest } = config
                  setConfig({ 
                    ...rest, 
                    type: 'image' as const
                  })
                }}
                className="mr-2"
              />
              <span className="text-white">Image</span>
            </label>
          </div>
        </div>

        {config.type === 'text' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo Text
              </label>
              <input
                type="text"
                value={config.text || ''}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                placeholder="Thought Studios™"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Font Size (px)
              </label>
              <input
                type="number"
                value={config.fontSize || 24}
                onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) || 24 })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                min="12"
                max="72"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <ImageUpload
                value={config.imageUrl || ''}
                onChange={(url) => setConfig({ ...config, imageUrl: url })}
                label="Logo Image"
                required={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={config.width || 200}
                  onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) || 200 })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  min="50"
                  max="500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={config.height || 50}
                  onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) || 50 })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  min="20"
                  max="200"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-900 rounded">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
          <div className="flex items-center">
            {config.type === 'text' ? (
              <div
                style={{
                  fontSize: `${config.fontSize || 24}px`,
                  color: 'var(--text-white)',
                  fontWeight: 600,
                  letterSpacing: '-0.5px',
                }}
              >
                {config.text || 'Thought Studios™'}
              </div>
            ) : (
              config.imageUrl && (
                <img
                  src={config.imageUrl}
                  alt="Logo preview"
                  style={{
                    width: `${config.width || 200}px`,
                    height: `${config.height || 50}px`,
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )
            )}
          </div>
        </div>

        <SaveButton saving={saving} success={saveSuccess} />
      </form>
    </div>
  )
}
