'use client'

import { useState, useEffect } from 'react'

// Add keyframe animation via style tag
const addAnimationStyle = () => {
  if (typeof document === 'undefined') return
  
  if (!document.head.querySelector('style[data-save-button]')) {
    const style = document.createElement('style')
    style.setAttribute('data-save-button', 'true')
    style.textContent = `
      @keyframes scaleIn {
        from {
          transform: scale(0);
        }
        to {
          transform: scale(1);
        }
      }
    `
    document.head.appendChild(style)
  }
}

interface SaveButtonProps {
  saving: boolean
  success: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}

export default function SaveButton({ saving, success, onClick, children, className = '' }: SaveButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    addAnimationStyle()
  }, [])

  useEffect(() => {
    if (success && !saving) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [success, saving])

  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={saving}
      className={`relative px-6 py-2 bg-rose-gold text-white rounded-md hover:bg-rose-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Background animation */}
      {saving && (
        <span className="absolute inset-0 bg-rose-gold-dark animate-pulse" />
      )}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {saving ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Saving...</span>
          </>
        ) : showSuccess ? (
          <>
            <svg
              className="h-4 w-4"
              style={{
                animation: 'scaleIn 0.3s ease-out',
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Saved!</span>
          </>
        ) : (
          children || 'Save Changes'
        )}
      </span>

    </button>
  )
}

