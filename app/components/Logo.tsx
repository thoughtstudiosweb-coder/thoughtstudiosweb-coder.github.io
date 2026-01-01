'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

// Helper to create a hash of config for change detection
function configHash(config: LogoConfig): string {
  return JSON.stringify(config)
}

export default function Logo({ className, showLink = true }: LogoProps = { showLink: true }) {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_LOGO)
  const [mounted, setMounted] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const lastConfigHashRef = useRef<string>('')
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)

  // Stable fetch function using useCallback
  const fetchLogo = useCallback(async () => {
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
          const newHash = configHash(logo)
          // Only update if config actually changed
          if (newHash !== lastConfigHashRef.current) {
            console.log('🔄 Logo: Config changed, updating...', logo)
            lastConfigHashRef.current = newHash
            setConfig(logo)
            // Force re-render by updating refresh key
            setRefreshKey(prev => prev + 1)
          }
        } else {
          // If API returns null, use default
          const defaultHash = configHash(DEFAULT_LOGO)
          if (defaultHash !== lastConfigHashRef.current) {
            console.log('⚠️ Logo: API returned null, using default')
            lastConfigHashRef.current = defaultHash
            setConfig(DEFAULT_LOGO)
            setRefreshKey(prev => prev + 1)
          }
        }
      } else {
        console.error('❌ Logo: Failed to fetch logo', response.status)
      }
    } catch (error) {
      console.error('❌ Logo: Error fetching logo:', error)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Initialize last hash
    lastConfigHashRef.current = configHash(DEFAULT_LOGO)
    
    // Fetch logo configuration from API immediately
    fetchLogo()
    
    // Listen for custom event when logo is updated (works if CMS and site are in same window)
    const handleLogoUpdate = () => {
      console.log('📢 Logo: Received logo-updated event, refreshing...')
      // Add small delay to ensure DB write has propagated
      setTimeout(() => {
        fetchLogo()
      }, 500)
    }
    
    window.addEventListener('logo-updated', handleLogoUpdate)
    
    // Listen for BroadcastChannel messages (works across tabs/windows)
    try {
      const channel = new BroadcastChannel('logo-updates')
      broadcastChannelRef.current = channel
      channel.onmessage = (event) => {
        if (event.data.type === 'logo-updated') {
          console.log('📢 Logo: Received logo-updated broadcast, refreshing...')
          setTimeout(() => {
            fetchLogo()
          }, 500)
        }
      }
    } catch (e) {
      // BroadcastChannel not supported, that's okay
      console.warn('⚠️ Logo: BroadcastChannel not supported')
    }
    
    // Poll to catch updates (every 2 seconds)
    const interval = setInterval(fetchLogo, 2000)
    
    // Also listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      fetchLogo()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('logo-updated', handleLogoUpdate)
      window.removeEventListener('focus', handleFocus)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close()
        broadcastChannelRef.current = null
      }
      clearInterval(interval)
    }
  }, [fetchLogo])

  // Generate logo content with refresh key to force re-render on changes
  const logoContent = config.type === 'text' ? (
    <span
      key={`text-${refreshKey}`}
      style={{
        fontSize: `${config.fontSize || 24}px`,
      }}
    >
      {config.text || 'Thought Studios™'}
    </span>
  ) : (
    config.imageUrl && (
      <img
        key={`img-${config.imageUrl}-${refreshKey}`}
        src={`${normalizeToHttps(config.imageUrl)}?v=${refreshKey}&t=${Date.now()}`}
        alt="Logo"
        style={{
          width: `${config.width || 200}px`,
          height: `${config.height || 50}px`,
          objectFit: 'contain',
        }}
        onError={(e) => {
          console.error('❌ Logo: Failed to load image', config.imageUrl)
          // Remove cache-busting params on error to try original URL
          const target = e.target as HTMLImageElement
          if (target.src.includes('?v=')) {
            target.src = normalizeToHttps(config.imageUrl || '')
          }
        }}
        onLoad={() => {
          console.log('✅ Logo: Image loaded successfully', config.imageUrl)
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

