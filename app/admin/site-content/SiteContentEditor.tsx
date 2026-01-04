'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SaveButton from '../components/SaveButton'
import { saveSiteContent } from './actions'
import type { SiteContent } from '@/lib/site-content'

interface SiteContentEditorProps {
  initialData: SiteContent
}

export default function SiteContentEditor({ initialData }: SiteContentEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState<SiteContent>(initialData)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync with server props when they change
  useEffect(() => {
    setContent(initialData)
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await saveSiteContent(content)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Site Content</h1>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          title="Refresh data from server"
        >
          🔄 Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        {/* Navigation Labels */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Navigation Labels</h2>
          <p className="text-sm text-gray-400 mb-4">These appear in the header navigation menu.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What We Believe
              </label>
              <input
                type="text"
                value={content.navigation.believe}
                onChange={(e) => setContent({
                  ...content,
                  navigation: { ...content.navigation, believe: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What We Explore
              </label>
              <input
                type="text"
                value={content.navigation.explore}
                onChange={(e) => setContent({
                  ...content,
                  navigation: { ...content.navigation, explore: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Studio Notes
              </label>
              <input
                type="text"
                value={content.navigation.studioNotes}
                onChange={(e) => setContent({
                  ...content,
                  navigation: { ...content.navigation, studioNotes: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                In Development
              </label>
              <input
                type="text"
                value={content.navigation.development}
                onChange={(e) => setContent({
                  ...content,
                  navigation: { ...content.navigation, development: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Section Headers */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Section Headers</h2>
          <p className="text-sm text-gray-400 mb-4">These appear as the main title for each section on the page.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What We Believe Section Title
              </label>
              <input
                type="text"
                value={content.sections.believe.title}
                onChange={(e) => setContent({
                  ...content,
                  sections: {
                    ...content.sections,
                    believe: { ...content.sections.believe, title: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What We Explore Section Title
              </label>
              <input
                type="text"
                value={content.sections.explore.title}
                onChange={(e) => setContent({
                  ...content,
                  sections: {
                    ...content.sections,
                    explore: { ...content.sections.explore, title: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Studio Notes Section Title
              </label>
              <input
                type="text"
                value={content.sections.studioNotes.title}
                onChange={(e) => setContent({
                  ...content,
                  sections: {
                    ...content.sections,
                    studioNotes: { ...content.sections.studioNotes, title: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                In Development Section Title
              </label>
              <input
                type="text"
                value={content.sections.development.title}
                onChange={(e) => setContent({
                  ...content,
                  sections: {
                    ...content.sections,
                    development: { ...content.sections.development, title: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Development Section Content */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Development Section Content</h2>
          <p className="text-sm text-gray-400 mb-4">The intro and outro text for the "In Development" section.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intro Text
              </label>
              <textarea
                value={content.sections.development.intro}
                onChange={(e) => setContent({
                  ...content,
                  sections: {
                    ...content.sections,
                    development: { ...content.sections.development, intro: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                rows={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Outro Text
              </label>
              <textarea
                value={content.sections.development.outro}
                onChange={(e) => setContent({
                  ...content,
                  sections: {
                    ...content.sections,
                    development: { ...content.sections.development, outro: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Footer Content</h2>
          <p className="text-sm text-gray-400 mb-4">Footer tagline and copyright text.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={content.footer.tagline}
                onChange={(e) => setContent({
                  ...content,
                  footer: { ...content.footer, tagline: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Copyright Text
              </label>
              <textarea
                value={content.footer.copyright}
                onChange={(e) => setContent({
                  ...content,
                  footer: { ...content.footer, copyright: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                rows={2}
                required
              />
            </div>
          </div>
        </div>

        <SaveButton saving={saving} success={saveSuccess} />
      </form>
    </div>
  )
}

