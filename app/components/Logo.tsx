'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { normalizeToHttps } from '@/lib/url-utils'

interface LogoConfig {
  type: 'text' | 'image'
  text?: string
  fontSize?: number
  imageUrl?: string
  width?: number
  height?: number
}

const DEFAULT_LOGO: LogoConfig = {
  type: 'text',
  text: 'Thought Studios™',
  fontSize: 24,
}

export default function Logo() {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_LOGO)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch logo configuration from API
    const fetchLogo = async () => {
      try {
        const response = await fetch(`/api/content/logo?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
        if (response.ok) {
          const logo = await response.json()
          if (logo) {
            setConfig(logo)
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error)
      }
    }
    fetchLogo()
  }, [])

  if (!mounted) {
    // Return default during SSR/hydration
    return (
      <Link href="/" className="logo">
        <span style={{ fontSize: '24px' }}>Thought Studios™</span>
      </Link>
    )
  }

  return (
    <Link href="/" className="logo">
      {config.type === 'text' ? (
        <span
          style={{
            fontSize: `${config.fontSize || 24}px`,
          }}
        >
          {config.text || 'Thought Studios™'}
        </span>
      ) : (
        config.imageUrl && (
          <img
            src={normalizeToHttps(config.imageUrl)}
            alt="Logo"
            style={{
              width: `${config.width || 200}px`,
              height: `${config.height || 50}px`,
              objectFit: 'contain',
            }}
          />
        )
      )}
    </Link>
  )
}

