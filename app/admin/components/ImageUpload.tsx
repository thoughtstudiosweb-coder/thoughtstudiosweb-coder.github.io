'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  required?: boolean
}

export default function ImageUpload({ value, onChange, label = 'Image', required = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  // Sync preview with value prop
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.url) {
        onChange(data.url)
        setPreview(data.url)
      } else {
        const errorMsg = data.error || 'Upload failed'
        const hint = data.hint ? `\n\n${data.hint}` : ''
        alert(`${errorMsg}${hint}`)
        setPreview(null)
      }
    } catch (error) {
      alert('Upload failed. Please try again.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    if (url) {
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    
    // Check if pasted text is an image URL
    if (pastedText.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || pastedText.startsWith('http')) {
      e.preventDefault()
      onChange(pastedText)
      setPreview(pastedText)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.url) {
        onChange(data.url)
        setPreview(data.url)
      } else {
        const errorMsg = data.error || 'Upload failed'
        const hint = data.hint ? `\n\n${data.hint}` : ''
        alert(`${errorMsg}${hint}`)
        setPreview(null)
      }
    } catch (error) {
      alert('Upload failed. Please try again.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Preview */}
      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-32 object-contain bg-gray-700 rounded border border-gray-600 p-2"
            onError={() => setPreview(null)}
          />
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-2">
        <input
          ref={urlInputRef}
          type="text"
          value={value}
          onChange={handleUrlChange}
          onPaste={handlePaste}
          placeholder="Paste image URL or upload file below"
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400"
          required={required}
        />

        {/* Upload Section */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center hover:border-rose-gold transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <div className="text-gray-400">Uploading...</div>
          ) : (
            <div className="text-gray-400">
              <div className="mb-2">Click to upload or drag and drop</div>
              <div className="text-sm">PNG, JPG, GIF, WEBP, SVG (max 5MB)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

