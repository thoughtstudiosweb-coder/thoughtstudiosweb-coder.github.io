'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/welcome', label: 'Welcome' },
    { href: '/admin/beliefs', label: 'Beliefs' },
    { href: '/admin/explore', label: 'Explore' },
    { href: '/admin/blog', label: 'Blog' },
    { href: '/admin/site-content', label: 'Site Content' },
    { href: '/admin/theme', label: 'Theme' },
    { href: '/admin/logo', label: 'Logo' },
  ]

  return (
    <>
      {/* Mobile Top Bar */}
      <nav className="lg:hidden bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <span className="ml-2 text-white font-semibold text-sm">CMS</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white px-2 py-1 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 z-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-bold">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded text-sm ${
                      pathname === item.href
                        ? 'bg-gray-700 text-rose-gold font-medium'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 bg-gray-800 border-r border-gray-700">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <span className="text-white font-bold text-lg">Thought Studios CMS</span>
          </div>
          <nav className="p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded text-sm mb-1 ${
                  pathname === item.href
                    ? 'bg-gray-700 text-rose-gold font-medium'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-gray-300 rounded hover:bg-gray-700 hover:text-white text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

