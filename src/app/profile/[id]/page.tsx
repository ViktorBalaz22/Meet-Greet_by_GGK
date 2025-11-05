'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import ProfileDetail from '@/components/ProfileDetail'
import Navigation from '@/components/Navigation'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter()
  const { supabase, user, loading: authLoading } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Profile page - Auth state:', { supabase: !!supabase, user: !!user, authLoading })
      
      if (!supabase) {
        console.log('No supabase client, redirecting to login')
        router.push('/login')
        setLoading(false)
        return
      }

      // Wait for auth to load before checking user
      if (authLoading) {
        console.log('Auth still loading, waiting...')
        return
      }

      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!user) {
        console.log('No user found after auth loaded, redirecting to login')
        router.push('/login')
        setLoading(false)
        return
      }

      try {
        console.log('Fetching profile for ID:', params.id)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .eq('hidden', false)
          .single()

        if (profileError) {
          console.error('Error getting profile:', profileError)
          router.push('/app') // Redirect to main app if profile not found
        } else {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error)
        router.push('/app')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user, authLoading, params.id, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#232323] mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ProfileDetail profile={profile} />
        </div>
      </div>
    </div>
  )
}
