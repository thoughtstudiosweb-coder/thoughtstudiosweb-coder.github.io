'use client'

import { useState } from 'react'

interface GradientBuilderProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

export default function GradientBuilder({ value, onChange, onClose }: GradientBuilderProps) {
  // Parse existing gradient or use defaults
  const parseGradient = (val: string) => {
    if (val.includes('linear-gradient')) {
      const match = val.match(/linear-gradient\((\d+)deg,\s*(.+)\)/)
      if (match) {
        const angle = parseInt(match[1])
        const colors = match[2].split(',').map(c => c.trim())
        return { type: 'linear', angle, colors }
      }
    }
    if (val.includes('radial-gradient')) {
      const match = val.match(/radial-gradient\((.+)\)/)
      if (match) {
        const colors = match[1].split(',').map(c => c.trim())
        return { type: 'radial', angle: 0, colors }
      }
    }
    return { type: 'linear', angle: 135, colors: ['#C19A6B', '#B8860B'] }
  }

  const initial = parseGradient(value)
  const [type, setType] = useState<'linear' | 'radial'>(initial.type as 'linear' | 'radial')
  const [angle, setAngle] = useState(initial.angle)
  const [colors, setColors] = useState<string[]>(initial.colors)

  const addColor = () => {
    setColors([...colors, '#000000'])
  }

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index))
    }
  }

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors]
    newColors[index] = color
    setColors(newColors)
  }

  const generateGradient = () => {
    if (type === 'linear') {
      const colorStops = colors.map((c, i) => {
        const percent = Math.round((i / (colors.length - 1)) * 100)
        return `${c} ${percent}%`
      }).join(', ')
      return `linear-gradient(${angle}deg, ${colorStops})`
    } else {
      const colorStops = colors.map((c, i) => {
        const percent = Math.round((i / (colors.length - 1)) * 100)
        return `${c} ${percent}%`
      }).join(', ')
      return `radial-gradient(circle, ${colorStops})`
    }
  }

  const handleApply = () => {
    onChange(generateGradient())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Gradient Builder</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Gradient Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="linear"
                checked={type === 'linear'}
                onChange={(e) => setType(e.target.value as 'linear')}
                className="mr-2"
              />
              <span className="text-gray-300">Linear</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="radial"
                checked={type === 'radial'}
                onChange={(e) => setType(e.target.value as 'radial')}
                className="mr-2"
              />
              <span className="text-gray-300">Radial</span>
            </label>
          </div>
        </div>

        {/* Angle (for linear) */}
        {type === 'linear' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Angle: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Colors */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Colors
            </label>
            <button
              type="button"
              onClick={addColor}
              className="px-3 py-1 bg-rose-gold text-white rounded text-sm hover:bg-rose-gold-dark"
            >
              + Add Color
            </button>
          </div>
          <div className="space-y-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white text-sm"
                />
                {colors.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="w-full h-32 rounded border-2 border-gray-600"
            style={{ background: generateGradient() }}
          />
        </div>

        {/* Generated CSS */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Generated CSS
          </label>
          <code className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-gray-300 text-sm overflow-x-auto">
            {generateGradient()}
          </code>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-rose-gold text-white rounded hover:bg-rose-gold-dark"
          >
            Apply Gradient
          </button>
        </div>
      </div>
    </div>
  )
}

