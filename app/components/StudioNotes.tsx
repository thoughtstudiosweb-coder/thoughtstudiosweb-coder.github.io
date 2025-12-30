'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  cover: string
  excerpt: string
  content: string
}

interface StudioNotesProps {
  posts: BlogPost[]
}

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect fill='%231a1a1a' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='24' fill='%23666'%3EThought Studios%3C/text%3E%3C/svg%3E"

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export default function StudioNotes({ posts }: StudioNotesProps) {
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Show 3 posts per page

  useEffect(() => {
    // Always use pagination if there are more than 3 posts
    if (posts.length > itemsPerPage) {
      const start = (currentPage - 1) * itemsPerPage
      setDisplayedPosts(posts.slice(start, start + itemsPerPage))
    } else {
      // Show all posts if 3 or fewer
      setDisplayedPosts(posts)
    }
  }, [posts, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to section top smoothly
    const section = document.getElementById('studio-notes')
    if (section) {
      const headerOffset = 120
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const totalPages = Math.ceil(posts.length / itemsPerPage)

  if (posts.length === 0) return null

  return (
    <section id="studio-notes" className="content-section studio-notes-section">
      <div className="container">
        <h2 className="section-title">Studio Notes</h2>
        <div className="studio-notes-grid" id="studioNotesGrid">
          {displayedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="studio-note-card"
            >
              <div className="studio-note-image-container">
                <img
                  src={post.cover || PLACEHOLDER_IMAGE}
                  alt={post.title}
                  className="studio-note-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = PLACEHOLDER_IMAGE
                  }}
                />
              </div>
              <div className="studio-note-date">{formatDate(post.date)}</div>
              <h3 className="studio-note-title">{post.title}</h3>
              <p className="studio-note-excerpt">{post.excerpt}</p>
              <span className="studio-note-read-more">Read More</span>
            </Link>
          ))}
        </div>

        {posts.length > itemsPerPage && (
          <div className="pagination" id="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              id="paginationPrev"
            >
              Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                
                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="pagination-ellipsis">
                        ...
                      </span>
                    )
                  }
                  return null
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              id="paginationNext"
            >
              Next
            </button>
            
            <div className="pagination-info" id="paginationInfo">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

