import AdminNav from './components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware handles all auth protection
  // This layout only renders the admin UI structure
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav />
      <main className="p-8">{children}</main>
    </div>
  )
}
