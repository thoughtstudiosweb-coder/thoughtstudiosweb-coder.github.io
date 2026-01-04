import AdminNav from './components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware handles all auth protection
  // This layout only renders the admin UI structure
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
