'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ColorInput from '../components/ColorInput'
import GradientBuilder from '../components/GradientBuilder'
import SaveButton from '../components/SaveButton'
import { saveTheme } from './actions'

interface ThemeColors {
  bgDark: string
  bgCard: string
  bgCardHover: string
  textWhite: string
  textGray: string
  accentRoseGold: string
  accentRoseGoldLight: string
  accentRoseGoldDark: string
  borderColor: string
  headerBg: string
  footerBg: string
  shadowColor: string
}

interface Theme {
  dark: ThemeColors
  light: ThemeColors
}

interface ThemeEditorProps {
  initialData: Theme | null
}

const COLOR_EXAMPLES = {
  hex: '#C19A6B',
  rgb: 'rgb(193, 154, 107)',
  rgba: 'rgba(193, 154, 107, 0.8)',
  hsl: 'hsl(30, 40%, 59%)',
  hsla: 'hsla(30, 40%, 59%, 0.8)',
  linearGradient: 'linear-gradient(135deg, #D4A574 0%, #C19A6B 50%, #B8860B 100%)',
  radialGradient: 'radial-gradient(circle, #D4A574 0%, #C19A6B 100%)',
}

const COLOR_DESCRIPTIONS: Record<keyof ThemeColors, string> = {
  bgDark: 'Main background color',
  bgCard: 'Card/container background',
  bgCardHover: 'Card background on hover',
  textWhite: 'Primary text color',
  textGray: 'Secondary/muted text color',
  accentRoseGold: 'Primary accent color',
  accentRoseGoldLight: 'Light accent variant',
  accentRoseGoldDark: 'Dark accent variant',
  borderColor: 'Border and divider color',
  headerBg: 'Header background (supports transparency)',
  footerBg: 'Footer background (supports transparency)',
  shadowColor: 'Shadow color (supports transparency)',
}

// Default theme structure
const DEFAULT_THEME: Theme = {
  dark: {
    bgDark: '#1a1a1a',
    bgCard: '#2a2a2a',
    bgCardHover: '#3a3a3a',
    textWhite: '#ffffff',
    textGray: '#a0a0a0',
    accentRoseGold: '#C19A6B',
    accentRoseGoldLight: '#D4A574',
    accentRoseGoldDark: '#B8860B',
    borderColor: '#404040',
    headerBg: 'rgba(26, 26, 26, 0.95)',
    footerBg: 'rgba(26, 26, 26, 0.95)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  light: {
    bgDark: '#f5f5f5',
    bgCard: '#ffffff',
    bgCardHover: '#f0f0f0',
    textWhite: '#1a1a1a',
    textGray: '#666666',
    accentRoseGold: '#C19A6B',
    accentRoseGoldLight: '#D4A574',
    accentRoseGoldDark: '#B8860B',
    borderColor: '#e0e0e0',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    footerBg: 'rgba(255, 255, 255, 0.95)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
}

export default function ThemeEditor({ initialData }: ThemeEditorProps) {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>(initialData || DEFAULT_THEME)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTheme, setLastSavedTheme] = useState<Theme | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeMode, setActiveMode] = useState<'dark' | 'light'>('dark')
  const [gradientBuilder, setGradientBuilder] = useState<{
    mode: 'dark' | 'light'
    key: keyof ThemeColors
  } | null>(null)
  const [showExamples, setShowExamples] = useState(false)

  // Sync with server props when they change (after router.refresh())
  // But don't overwrite if we just saved (to prevent reverting user changes)
  useEffect(() => {
    // Only sync if we're not currently saving and the data is different from what we just saved
    if (!isSaving) {
      if (initialData) {
        // Only update if it's different from what we just saved
        if (!lastSavedTheme || JSON.stringify(initialData) !== JSON.stringify(lastSavedTheme)) {
          console.log('🔄 ThemeEditor: Updating theme from server data', initialData)
          setTheme(initialData)
          setLastSavedTheme(null) // Reset after syncing
        }
      } else {
        console.log('⚠️ ThemeEditor: No initial data, using default theme')
        setTheme(DEFAULT_THEME)
      }
    }
  }, [initialData, isSaving, lastSavedTheme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theme) return

    setSaving(true)
    setIsSaving(true)
    setMessage('')

    try {
      await saveTheme(theme)
      setSaveSuccess(true)
      setMessage('Saved successfully!')
      
      // Mark this theme as the last saved one to prevent reverting
      setLastSavedTheme(JSON.parse(JSON.stringify(theme)))
      
      // Wait for database write to propagate (connection pooling delay)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch fresh data from API (don't use router.refresh to avoid race conditions)
      try {
        const response = await fetch(`/api/content/theme?t=${Date.now()}&r=${Math.random()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
        if (response.ok) {
          const updatedTheme = await response.json()
          if (updatedTheme) {
            console.log('✅ ThemeEditor: Fetched updated theme from API', updatedTheme)
            // Only update if it matches what we saved (to prevent stale data from overwriting)
            if (JSON.stringify(updatedTheme) === JSON.stringify(theme)) {
              setTheme(updatedTheme)
              setLastSavedTheme(updatedTheme)
            } else {
              console.log('⚠️ ThemeEditor: Fetched theme differs from saved, keeping current state')
            }
          }
        }
      } catch (error) {
        console.error('❌ ThemeEditor: Error fetching updated theme', error)
      }
      
      setTimeout(() => {
        setMessage('')
        setSaveSuccess(false)
      }, 2000)
    } catch (error: any) {
      setMessage(error.message || 'Error saving')
      setSaveSuccess(false)
    } finally {
      setSaving(false)
      setIsSaving(false)
    }
  }

  const updateColor = (mode: 'dark' | 'light', key: keyof ThemeColors, value: string) => {
    if (!theme) return
    setTheme({
      ...theme,
      [mode]: {
        ...theme[mode],
        [key]: value,
      },
    })
  }

  const openGradientBuilder = (mode: 'dark' | 'light', key: keyof ThemeColors) => {
    setGradientBuilder({ mode, key })
  }

  const currentTheme = theme[activeMode]
  const colorKeys: (keyof ThemeColors)[] = [
    'bgDark',
    'bgCard',
    'bgCardHover',
    'textWhite',
    'textGray',
    'accentRoseGold',
    'accentRoseGoldLight',
    'accentRoseGoldDark',
    'borderColor',
    'headerBg',
    'footerBg',
    'shadowColor',
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Theme Editor</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={async () => {
              // Force refresh with cache-busting
              const response = await fetch(`/api/content/theme?t=${Date.now()}&r=${Math.random()}`, {
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0',
                },
              })
              if (response.ok) {
                const updatedTheme = await response.json()
                if (updatedTheme) {
                  setTheme(updatedTheme)
                  setMessage('Data refreshed!')
                  setTimeout(() => setMessage(''), 2000)
                }
              }
              router.refresh()
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base flex-1 sm:flex-initial"
            title="Refresh data from server"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm sm:text-base flex-1 sm:flex-initial"
          >
            {showExamples ? 'Hide' : 'Show'} Examples
          </button>
        </div>
      </div>

      {/* Examples Panel */}
      {showExamples && (
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Color Format Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Solid Colors</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="text-rose-gold">Hex:</code>
                  <code className="text-gray-300 ml-2">{COLOR_EXAMPLES.hex}</code>
                </div>
                <div>
                  <code className="text-rose-gold">RGB:</code>
                  <code className="text-gray-300 ml-2">{COLOR_EXAMPLES.rgb}</code>
                </div>
                <div>
                  <code className="text-rose-gold">RGBA:</code>
                  <code className="text-gray-300 ml-2">{COLOR_EXAMPLES.rgba}</code>
                </div>
                <div>
                  <code className="text-rose-gold">HSL:</code>
                  <code className="text-gray-300 ml-2">{COLOR_EXAMPLES.hsl}</code>
                </div>
                <div>
                  <code className="text-rose-gold">HSLA:</code>
                  <code className="text-gray-300 ml-2">{COLOR_EXAMPLES.hsla}</code>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Gradients</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="text-rose-gold">Linear:</code>
                  <code className="text-gray-300 ml-2 text-xs break-all">{COLOR_EXAMPLES.linearGradient}</code>
                </div>
                <div>
                  <code className="text-rose-gold">Radial:</code>
                  <code className="text-gray-300 ml-2 text-xs break-all">{COLOR_EXAMPLES.radialGradient}</code>
                </div>
                <div className="mt-3 p-3 bg-gray-900 rounded text-xs text-gray-400">
                  <strong className="text-white">Tip:</strong> Use the gradient builder button (🎨) next to any color field to create custom gradients visually.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setActiveMode('dark')}
          className={`px-4 py-2 rounded ${activeMode === 'dark' ? 'bg-rose-gold text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Dark Mode
        </button>
        <button
          onClick={() => setActiveMode('light')}
          className={`px-4 py-2 rounded ${activeMode === 'light' ? 'bg-rose-gold text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Light Mode
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        <h2 className="text-xl font-semibold text-white mb-4">
          {activeMode === 'dark' ? 'Dark' : 'Light'} Mode Colors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorKeys.map((key) => {
            const isGradient = currentTheme[key].includes('gradient')
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <ColorInput
                    value={currentTheme[key]}
                    onChange={(value) => updateColor(activeMode, key, value)}
                    label={key}
                    description={COLOR_DESCRIPTIONS[key]}
                  />
                  <button
                    type="button"
                    onClick={() => openGradientBuilder(activeMode, key)}
                    className="ml-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                    title="Open gradient builder"
                  >
                    🎨
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded text-sm text-gray-400">
          <strong className="text-white">Quick Tips:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Use hex codes (#RRGGBB) for solid colors</li>
            <li>Use rgba() or hsla() for colors with transparency</li>
            <li>Click the 🎨 button to build gradients visually</li>
            <li>Gradients work great for backgrounds and accents</li>
            <li>After saving, refresh the page to see changes</li>
          </ul>
        </div>

        <SaveButton saving={saving} success={saveSuccess} />
      </form>

      {/* Gradient Builder Modal */}
      {gradientBuilder && (
        <GradientBuilder
          value={theme[gradientBuilder.mode][gradientBuilder.key]}
          onChange={(value) => updateColor(gradientBuilder.mode, gradientBuilder.key, value)}
          onClose={() => setGradientBuilder(null)}
        />
      )}
    </div>
  )
}

