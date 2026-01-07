'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface FooterNavProps {
  navigation: {
    believe: string
    explore: string
    studioNotes: string
    development: string
  }
}

export default function FooterNav({ navigation }: FooterNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string, href: string) => {
    e.preventDefault()

    // If we're on the homepage, scroll to section smoothly without navigation
    if (pathname === '/') {
      const element = document.getElementById(sectionId)
      if (element) {
        const headerHeight = 100
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    } else {
      // If we're on a different page, navigate without scrolling to top
      // Store the target section ID and current scroll position
      const currentScroll = window.scrollY
      sessionStorage.setItem('targetSection', sectionId)
      if (currentScroll > 0) {
        sessionStorage.setItem('preserveScroll', currentScroll.toString())
      }
      
      // Navigate without scrolling to top using router.push
      router.push(href)
    }
  }

  return (
    <nav className="footer-nav">
      <Link 
        href="/believe" 
        className="footer-link"
        onClick={(e) => handleNavClick(e, 'believe', '/believe')}
        prefetch={true}
      >
        {navigation.believe}
      </Link>
      <Link 
        href="/explore" 
        className="footer-link"
        onClick={(e) => handleNavClick(e, 'explore', '/explore')}
        prefetch={true}
      >
        {navigation.explore}
      </Link>
      <Link 
        href="/studio-notes" 
        className="footer-link"
        onClick={(e) => handleNavClick(e, 'studio-notes', '/studio-notes')}
        prefetch={true}
      >
        {navigation.studioNotes}
      </Link>
      <Link 
        href="/development" 
        className="footer-link"
        onClick={(e) => handleNavClick(e, 'development', '/development')}
        prefetch={true}
      >
        {navigation.development}
      </Link>
    </nav>
  )
}

