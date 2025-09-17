import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/auth'
import ProfileForm from '@/components/ProfileForm'
import DirectoryList from '@/components/DirectoryList'
import Navigation from '@/components/Navigation'

export default async function AppPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile()

  // If user doesn't have a complete profile, show the form
  if (!profile || !profile.first_name || !profile.last_name || !profile.company || !profile.agreed_gdpr) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Dokončite svoj profil
              </h1>
              <p className="text-gray-600 mb-6">
                Vyplňte svoje údaje pre vytvorenie digitálnej vizitky
              </p>
              <ProfileForm profile={profile} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show directory if profile is complete
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Zoznam účastníkov
              </h1>
              <p className="text-gray-600">
                Prepojte sa s ostatnými účastníkmi eventu
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ✏️ Upraviť môj profil
              </button>
            </div>
          </div>
        </div>
        <DirectoryList />
      </div>
    </div>
  )
}
