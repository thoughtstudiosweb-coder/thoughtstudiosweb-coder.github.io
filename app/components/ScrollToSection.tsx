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

  // Prevent scroll-to-top on navigation by preserving scroll position
  useLayoutEffect(() => {
    if (pathname !== '/') {
      const preservedScroll = sessionStorage.getItem('preserveScroll')
      if (preservedScroll) {
        const scrollPos = parseInt(preservedScroll, 10)
        if (scrollPos > 0) {
          // Restore scroll position synchronously before paint to prevent jump to top
          window.scrollTo(0, scrollPos)
          sessionStorage.removeItem('preserveScroll')
        }
      } else {
        // If no preserved scroll, don't jump to top - stay at current position
        // This allows smooth scrolling from current position
        const currentScroll = window.scrollY
        if (currentScroll > 0) {
          window.scrollTo(0, currentScroll)
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
          // Reduced header offset for better centering (less space above section)
          const headerHeight = 100
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const elementTop = rect.top + scrollTop
          const offsetPosition = elementTop - headerHeight
          const currentScroll = window.scrollY

          // Calculate if we need to scroll up or down
          const scrollDirection = offsetPosition > currentScroll ? 'down' : 'up'
          
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
      }, 100) // Slightly longer delay to ensure page has rendered

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

