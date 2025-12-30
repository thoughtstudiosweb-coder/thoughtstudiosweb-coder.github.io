import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/welcome"
          className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Welcome Section</h2>
          <p className="text-gray-400">Edit hero title, subtitle, and CTA</p>
        </Link>

        <Link
          href="/admin/beliefs"
          className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Beliefs</h2>
          <p className="text-gray-400">Manage belief cards</p>
        </Link>

        <Link
          href="/admin/explore"
          className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Explore</h2>
          <p className="text-gray-400">Manage explore section cards</p>
        </Link>

        <Link
          href="/admin/blog"
          className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Blog Posts</h2>
          <p className="text-gray-400">Create and manage blog posts</p>
        </Link>

        <Link
          href="/admin/theme"
          className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Theme Colors</h2>
          <p className="text-gray-400">Customize light & dark mode colors</p>
        </Link>
      </div>
    </div>
  )
}

