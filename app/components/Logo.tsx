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

interface LogoProps {
  className?: string
  showLink?: boolean
}

const DEFAULT_LOGO: LogoConfig = {
  type: 'text',
  text: 'Thought Studios™',
  fontSize: 24,
}

export default function Logo({ className, showLink = true }: LogoProps = { showLink: true }) {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_LOGO)
  const [mounted, setMounted] = useState(false)

  const fetchLogo = async () => {
    try {
      const response = await fetch(`/api/content/logo?t=${Date.now()}&r=${Math.random()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
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

  useEffect(() => {
    setMounted(true)
    // Fetch logo configuration from API
    fetchLogo()
    
    // Listen for storage events to refresh logo when updated in CMS
    const handleStorageChange = () => {
      fetchLogo()
    }
    
    // Listen for custom event when logo is updated
    window.addEventListener('logo-updated', handleStorageChange)
    
    // Also poll periodically to catch updates (every 5 seconds)
    const interval = setInterval(fetchLogo, 5000)
    
    return () => {
      window.removeEventListener('logo-updated', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const logoContent = config.type === 'text' ? (
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
  )

  if (!mounted) {
    // Return default during SSR/hydration
    const defaultContent = <span style={{ fontSize: '24px' }}>Thought Studios™</span>
    return showLink ? (
      <Link href="/" className={className || 'logo'}>
        {defaultContent}
      </Link>
    ) : (
      <div className={className || 'logo'}>
        {defaultContent}
      </div>
    )
  }

  return showLink ? (
    <Link href="/" className={className || 'logo'}>
      {logoContent}
    </Link>
  ) : (
    <div className={className || 'logo'}>
      {logoContent}
    </div>
  )
}

