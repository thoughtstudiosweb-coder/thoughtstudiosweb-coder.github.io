'use client'

import { useState } from 'react'
import { normalizeToHttps } from '@/lib/url-utils'

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect fill='%231a1a1a' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='24' fill='%23666'%3EThought Studios%3C/text%3E%3C/svg%3E"

interface BlogImageProps {
  src: string
  alt: string
  className?: string
}

export default function BlogImage({ src, alt, className }: BlogImageProps) {
  // Normalize URL to HTTPS to prevent mixed content issues
  const normalizedSrc = normalizeToHttps(src)
  const [imgSrc, setImgSrc] = useState(normalizedSrc || PLACEHOLDER_IMAGE)

  const handleError = () => {
    setImgSrc(PLACEHOLDER_IMAGE)
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}

