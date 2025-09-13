import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import AdminPanel from '@/components/AdminPanel'
import Navigation from '@/components/Navigation'

export default async function AdminPage() {
  try {
    await requireAdmin()
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administrácia
            </h1>
            <p className="text-gray-600">
              Správa účastníkov a export dát
            </p>
          </div>
          <AdminPanel />
        </div>
      </div>
    )
  } catch {
    redirect('/app')
  }
}
