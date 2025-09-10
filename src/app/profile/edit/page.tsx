import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/auth'
import ProfileForm from '@/components/ProfileForm'
import Navigation from '@/components/Navigation'

export default async function EditProfilePage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Upraviť profil
            </h1>
            <p className="text-gray-600 mb-6">
              Aktualizujte svoje údaje
            </p>
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}
