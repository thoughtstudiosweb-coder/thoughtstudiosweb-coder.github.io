'use client'

import { useEffect } from 'react'

export default function ScrollAnimations() {
  useEffect(() => {
    // Enhanced Intersection Observer for luxury scroll-triggered animations
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          // Once animated, we can unobserve for performance
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // Check immediately for elements already in viewport
    const checkInitialView = () => {
      const allElements = [
        ...Array.from(document.querySelectorAll('.content-section')),
        ...Array.from(document.querySelectorAll('.card')),
        ...Array.from(document.querySelectorAll('.section-title')),
        ...Array.from(document.querySelectorAll('.studio-note-card')),
        ...Array.from(document.querySelectorAll('.coming-item')),
        ...Array.from(document.querySelectorAll('.card-icon')),
        ...Array.from(document.querySelectorAll('.card-title')),
        ...Array.from(document.querySelectorAll('.card-description')),
        ...Array.from(document.querySelectorAll('.development-intro')),
        ...Array.from(document.querySelectorAll('.development-outro')),
      ]

      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        if (isVisible) {
          el.classList.add('animate-in')
        }
      })
    }

    // Observe all elements for luxury animations
    const sections = document.querySelectorAll('.content-section')
    const cards = document.querySelectorAll('.card')
    const titles = document.querySelectorAll('.section-title')
    const blogCards = document.querySelectorAll('.studio-note-card')
    const comingItems = document.querySelectorAll('.coming-item')
    const cardIcons = document.querySelectorAll('.card-icon')
    const cardTitles = document.querySelectorAll('.card-title')
    const cardDescriptions = document.querySelectorAll('.card-description')
    const devIntro = document.querySelectorAll('.development-intro')
    const devOutro = document.querySelectorAll('.development-outro')

    sections.forEach((section) => observer.observe(section))
    cards.forEach((card) => observer.observe(card))
    titles.forEach((title) => observer.observe(title))
    blogCards.forEach((blogCard) => observer.observe(blogCard))
    comingItems.forEach((comingItem) => observer.observe(comingItem))
    cardIcons.forEach((icon) => observer.observe(icon))
    cardTitles.forEach((title) => observer.observe(title))
    cardDescriptions.forEach((desc) => observer.observe(desc))
    devIntro.forEach((intro) => observer.observe(intro))
    devOutro.forEach((outro) => observer.observe(outro))

    // Check for elements already visible on load
    setTimeout(checkInitialView, 150)

    return () => {
      sections.forEach((section) => observer.unobserve(section))
      cards.forEach((card) => observer.unobserve(card))
      titles.forEach((title) => observer.unobserve(title))
      blogCards.forEach((blogCard) => observer.unobserve(blogCard))
      comingItems.forEach((comingItem) => observer.unobserve(comingItem))
      cardIcons.forEach((icon) => observer.unobserve(icon))
      cardTitles.forEach((title) => observer.unobserve(title))
      cardDescriptions.forEach((desc) => observer.unobserve(desc))
      devIntro.forEach((intro) => observer.unobserve(intro))
      devOutro.forEach((outro) => observer.unobserve(outro))
    }
  }, [])

  return null
}

