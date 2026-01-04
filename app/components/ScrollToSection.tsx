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
  const scrollPrevented = useRef(false)

  // CRITICAL: Prevent Next.js from scrolling to top on navigation
  useLayoutEffect(() => {
    if (pathname !== '/') {
      // Check if we have a target section from navigation
      const targetSection = sessionStorage.getItem('targetSection')
      const preservedScroll = sessionStorage.getItem('preserveScroll')
      
      if (targetSection === sectionId && !scrollPrevented.current) {
        // Prevent Next.js default scroll-to-top behavior
        // This must happen synchronously before Next.js scrolls
        const preventScroll = () => {
          if (preservedScroll) {
            const scrollPos = parseInt(preservedScroll, 10)
            if (scrollPos > 0) {
              window.scrollTo(0, scrollPos)
            }
          }
        }
        
        // Immediately prevent scroll
        preventScroll()
        
        // Also prevent scroll on next frame to catch any delayed scrolls
        requestAnimationFrame(preventScroll)
        
        scrollPrevented.current = true
        sessionStorage.removeItem('targetSection')
        sessionStorage.removeItem('preserveScroll')
      }
    }
  }, [pathname, sectionId])

  useEffect(() => {
    // Only scroll if we're on a route page (not the homepage)
    if (pathname !== '/') {
      // Check if this is a navigation from a different route
      const isNewNavigation = previousPathname.current !== pathname
      previousPathname.current = pathname

      const scrollToElement = () => {
        const element = document.getElementById(sectionId)
        if (element && !hasScrolled.current) {
          const headerHeight = 100
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const elementTop = rect.top + scrollTop
          const offsetPosition = elementTop - headerHeight
          const currentScroll = window.scrollY

          // Calculate scroll direction for smooth animation
          const needsScroll = Math.abs(currentScroll - offsetPosition) > 10
          
          if (needsScroll) {
            // Smooth scroll from current position to target
            // This creates smooth animation without jumping to top first
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
      // Use requestAnimationFrame for immediate execution after render
      let rafId1: number
      let rafId2: number
      let timeoutId: NodeJS.Timeout
      
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          // Double RAF ensures DOM is ready
          if (!scrollToElement()) {
            // Retry if element not found yet
            timeoutId = setTimeout(() => {
              if (!scrollToElement()) {
                setTimeout(scrollToElement, 50)
              }
            }, 50)
          }
        })
      })

      return () => {
        cancelAnimationFrame(rafId1)
        if (rafId2) cancelAnimationFrame(rafId2)
        if (timeoutId) clearTimeout(timeoutId)
        hasScrolled.current = false
        scrollPrevented.current = false
      }
    } else {
      // Reset flags on homepage
      hasScrolled.current = false
      scrollPrevented.current = false
      previousPathname.current = pathname
      sessionStorage.removeItem('targetSection')
    }
  }, [pathname, sectionId])

  return null
}

