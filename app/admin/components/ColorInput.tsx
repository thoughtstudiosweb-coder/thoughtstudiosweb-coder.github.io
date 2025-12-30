'use client'

import { useState, useEffect } from 'react'

interface ColorInputProps {
  value: string
  onChange: (value: string) => void
  label: string
  description?: string
}

export default function ColorInput({ value, onChange, label, description }: ColorInputProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  // Sync input with value prop
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Check if value is a gradient
  const isGradient = value.includes('gradient') || value.includes('linear-gradient') || value.includes('radial-gradient')

  // Extract hex color from value (for color picker)
  const extractHex = (val: string): string => {
    // Try to extract hex from various formats
    const hexMatch = val.match(/#[0-9A-Fa-f]{6}/)
    if (hexMatch) return hexMatch[0]
    
    // Try rgb/rgba
    const rgbMatch = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
    
    return '#000000'
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setInputValue(hex)
    onChange(hex)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        {!isGradient && (
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="text-xs text-rose-gold hover:text-rose-gold-light"
          >
            {showPicker ? 'Hide' : 'Show'} Picker
          </button>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}

      {/* Preview */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded border-2 border-gray-600 flex-shrink-0"
          style={{
            background: value || '#000000',
          }}
        />
        <div className="flex-1">
          {showPicker && !isGradient ? (
            <div className="space-y-2">
              <input
                type="color"
                value={extractHex(value)}
                onChange={handlePickerChange}
                className="w-full h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000 or linear-gradient(...)"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white text-sm"
              />
            </div>
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#000000, rgb(0,0,0), linear-gradient(...)"
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white text-sm"
            />
          )}
        </div>
      </div>
    </div>
  )
}

