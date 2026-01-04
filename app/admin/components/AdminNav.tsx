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

  const navGroups = [
    {
      title: 'Content',
      items: [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/welcome', label: 'Welcome', icon: '👋' },
        { href: '/admin/beliefs', label: 'Beliefs', icon: '💭' },
        { href: '/admin/explore', label: 'Explore', icon: '🔍' },
        { href: '/admin/blog', label: 'Blog', icon: '📝' },
        { href: '/admin/site-content', label: 'Site Content', icon: '⚙️' },
      ],
    },
    {
      title: 'Design',
      items: [
        { href: '/admin/theme', label: 'Theme', icon: '🎨' },
        { href: '/admin/logo', label: 'Logo', icon: '🖼️' },
      ],
    },
  ]

  const allNavItems = navGroups.flatMap(group => group.items)

  return (
    <>
      {/* Top Bar - Mobile */}
      <nav className="lg:hidden bg-gray-800 border-b border-gray-700">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2 rounded-md"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <span className="ml-3 text-white font-bold text-lg">Thought Studios CMS</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-800 border-b border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      pathname === item.href
                        ? 'bg-gray-900 text-rose-gold'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 px-6 border-b border-gray-700">
            <span className="text-white font-bold text-xl">Thought Studios CMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-6">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === item.href
                          ? 'bg-gray-900 text-rose-gold'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="px-3 py-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

