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

  const profile = await getProfile(user.id)

  // If user doesn't have a complete profile, show the form
  if (!profile || !profile.full_name || !profile.company || !profile.gdpr_consent) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zoznam účastníkov
          </h1>
          <p className="text-gray-600">
            Prepojte sa s ostatnými účastníkmi eventu
          </p>
        </div>
        <DirectoryList />
      </div>
    </div>
  )
}
