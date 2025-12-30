'use client'

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

  return (
    <section id="home" className="hero">
      <div className="container">
        <h1 className="hero-title">{data.title}</h1>
        <p className="hero-description">{data.subtitle}</p>
        {data.ctaText && (
          <Link 
            href={data.ctaLink || '/explore'} 
            className="hero-cta"
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

