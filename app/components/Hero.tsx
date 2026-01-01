'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface HeroProps {
  data: {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    image: string
  } | null
}

export default function Hero({ data }: HeroProps) {
  const pathname = usePathname()
  
  if (!data) {
    console.warn('Hero: No data provided')
    return (
      <section id="home" className="hero">
        <div className="container">
          <h1 className="hero-title">A place to think clearly</h1>
          <p className="hero-description">For decisions and ideas that deserve time and care.</p>
        </div>
      </section>
    )
  }

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ctaLink = data.ctaLink || '/explore'
    
    // If we're on homepage and link is to explore section, scroll instead of navigate
    if (pathname === '/' && (ctaLink === '/explore' || ctaLink === '#explore')) {
      e.preventDefault()
      const exploreSection = document.getElementById('explore')
      if (exploreSection) {
        const headerHeight = 100
        const elementPosition = exploreSection.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    } else if (ctaLink.startsWith('/')) {
      // For navigation to other pages, preserve scroll and set target section
      const currentScroll = window.scrollY
      if (currentScroll > 0) {
        sessionStorage.setItem('preserveScroll', currentScroll.toString())
      }
      // Store target section if it's a section link
      const sectionMap: Record<string, string> = {
        '/explore': 'explore',
        '/believe': 'believe',
        '/studio-notes': 'studio-notes',
        '/development': 'development',
      }
      const sectionId = sectionMap[ctaLink]
      if (sectionId) {
        sessionStorage.setItem('targetSection', sectionId)
      }
    }
  }

  return (
    <section id="home" className="hero">
      <div className="container">
        <h1 className="hero-title">{data.title}</h1>
        <p className="hero-description">{data.subtitle}</p>
        {data.ctaText && (
          <Link 
            href={data.ctaLink || '/explore'} 
            className="hero-cta"
            onClick={handleCtaClick}
          >
            <span>{data.ctaText}</span>
            <svg className="arrow-down" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
      </div>
    </section>
  )
}

