'use client'

import { useEffect } from 'react'

export default function ScrollAnimations() {
  useEffect(() => {
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
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
      ]

      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        if (isVisible) {
          el.classList.add('animate-in')
        }
      })
    }

    // Observe all sections, cards, titles, blog cards, and coming items
    const sections = document.querySelectorAll('.content-section')
    const cards = document.querySelectorAll('.card')
    const titles = document.querySelectorAll('.section-title')
    const blogCards = document.querySelectorAll('.studio-note-card')
    const comingItems = document.querySelectorAll('.coming-item')

    sections.forEach((section) => observer.observe(section))
    cards.forEach((card) => observer.observe(card))
    titles.forEach((title) => observer.observe(title))
    blogCards.forEach((blogCard) => observer.observe(blogCard))
    comingItems.forEach((comingItem) => observer.observe(comingItem))

    // Check for elements already visible on load
    setTimeout(checkInitialView, 100)

    return () => {
      sections.forEach((section) => observer.unobserve(section))
      cards.forEach((card) => observer.unobserve(card))
      titles.forEach((title) => observer.unobserve(title))
      blogCards.forEach((blogCard) => observer.unobserve(blogCard))
      comingItems.forEach((comingItem) => observer.unobserve(comingItem))
    }
  }, [])

  return null
}

