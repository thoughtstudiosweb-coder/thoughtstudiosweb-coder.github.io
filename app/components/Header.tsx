'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface HeaderProps {
  logo: React.ReactNode
  navigation: {
    believe: string
    explore: string
    studioNotes: string
    development: string
  }
}

export default function Header({ logo, navigation }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme as 'light' | 'dark')
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  useEffect(() => {
    // Map route paths to section IDs - simple route-based highlighting
    const routeToSection: Record<string, string> = {
      '/believe': 'believe',
      '/explore': 'explore',
      '/studio-notes': 'studio-notes',
      '/development': 'development',
    }

    // Simple approach: Only highlight based on current route
    // This is more reliable than scroll-based detection
    if (pathname && routeToSection[pathname]) {
      setActiveSection(routeToSection[pathname])
    } else {
      setActiveSection('')
    }
  }, [pathname])

  const toggleTheme = () => {
    if (!mounted) return
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string, href: string) => {
    e.preventDefault()
    setMenuOpen(false)

    // Always navigate to sub-routes for consistency
    // This ensures URL changes, better for sharing/bookmarking, and consistent behavior
    // Store the target section ID for ScrollToSection to handle scrolling
    sessionStorage.setItem('targetSection', sectionId)
    // Clear preserveScroll to ensure we scroll to the section, not preserve position
    sessionStorage.removeItem('preserveScroll')
    
    // Navigate to the target page - ScrollToSection will handle scrolling to the section
    router.push(href, { scroll: false })
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {logo}
          <div className="header-actions">
            <button
              className="theme-toggle"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              <svg className="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <svg className="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="hamburger"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
          <nav className={`nav ${menuOpen ? 'active' : ''}`}>
            <Link 
              href="/believe" 
              className={`nav-link ${activeSection === 'believe' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick(e, 'believe', '/believe')}
              prefetch={true}
            >
              {navigation.believe}
            </Link>
            <Link 
              href="/explore" 
              className={`nav-link ${activeSection === 'explore' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick(e, 'explore', '/explore')}
              prefetch={true}
            >
              {navigation.explore}
            </Link>
            <Link 
              href="/studio-notes" 
              className={`nav-link ${activeSection === 'studio-notes' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick(e, 'studio-notes', '/studio-notes')}
              prefetch={true}
            >
              {navigation.studioNotes}
            </Link>
            <Link 
              href="/development" 
              className={`nav-link ${activeSection === 'development' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick(e, 'development', '/development')}
              prefetch={true}
            >
              {navigation.development}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

