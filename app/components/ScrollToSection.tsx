'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface ScrollToSectionProps {
  sectionId: string
}

export default function ScrollToSection({ sectionId }: ScrollToSectionProps) {
  const pathname = usePathname()
  const hasScrolled = useRef(false)
  const previousPathname = useRef(pathname)

  // Restore scroll position immediately before paint to prevent jump
  useLayoutEffect(() => {
    if (pathname !== '/') {
      const preservedScroll = sessionStorage.getItem('preserveScroll')
      if (preservedScroll) {
        const scrollPos = parseInt(preservedScroll, 10)
        if (scrollPos > 0) {
          // Restore scroll position synchronously before paint
          window.scrollTo(0, scrollPos)
          sessionStorage.removeItem('preserveScroll')
        }
      }
    }
  }, [pathname])

  useEffect(() => {
    // Only scroll if we're on a route page (not the homepage)
    if (pathname !== '/') {
      // Check if this is a navigation from a different route
      const isNewNavigation = previousPathname.current !== pathname
      previousPathname.current = pathname

      const scrollToElement = () => {
        const element = document.getElementById(sectionId)
        if (element && !hasScrolled.current) {
          const headerOffset = 120
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const elementTop = rect.top + scrollTop
          const offsetPosition = elementTop - headerOffset
          const currentScroll = window.scrollY

          // Always use smooth scroll to continue from current position
          // This prevents the jump to top and creates smooth animation
          if (Math.abs(currentScroll - offsetPosition) > 10) {
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            })
            hasScrolled.current = true
            return true
          } else {
            // Already at target, just mark as done
            hasScrolled.current = true
            return true
          }
        }
        return false
      }

      // Wait for page to render, then scroll smoothly
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (!scrollToElement()) {
          // Retry if element not found yet
          requestAnimationFrame(() => {
            if (!scrollToElement()) {
              setTimeout(scrollToElement, 100)
            }
          })
        }
      }, 50)

      return () => {
        clearTimeout(timer)
        hasScrolled.current = false
      }
    } else {
      // Reset flag on homepage
      hasScrolled.current = false
      previousPathname.current = pathname
      sessionStorage.removeItem('preserveScroll')
    }
  }, [pathname, sectionId])

  return null
}

