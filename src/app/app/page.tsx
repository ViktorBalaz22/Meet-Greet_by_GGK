'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import ProfileForm from '@/components/ProfileForm'
import DirectoryList from '@/components/DirectoryList'
import Navigation from '@/components/Navigation'

export default function AppPage() {
  const router = useRouter()
  const { supabase, user, loading: authLoading } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase || !user) {
        setLoading(false)
        return
      }

      try {
        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single()

        if (profileError) {
          console.error('Error getting profile:', profileError)
        } else {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

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
                onClick={() => router.push('/profile/edit')}
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
