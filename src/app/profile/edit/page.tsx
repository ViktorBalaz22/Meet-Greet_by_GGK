'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import ProfileForm from '@/components/ProfileForm'
import Navigation from '@/components/Navigation'

export default function ProfileEditPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Upraviť môj profil
            </h1>
            <p className="text-gray-600 mb-6">
              Aktualizujte svoje údaje pre digitálnu vizitku
            </p>
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}