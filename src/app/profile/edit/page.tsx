'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import ProfileForm from '@/components/ProfileForm'
import Navigation from '@/components/Navigation'

export default function ProfileEditPage() {
  const router = useRouter()
  const { supabase, user, loading: authLoading } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Profile edit page - Auth state:', { supabase: !!supabase, user: !!user, authLoading })
      
      if (!supabase) {
        console.log('No supabase client, redirecting to login')
        router.push('/login')
        setLoading(false)
        return
      }

      // Wait for auth to load before checking user
      if (authLoading) {
        return
      }

      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/login')
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
  }, [supabase, user, authLoading, router])

  const handleDeleteProfile = async () => {
    if (!user?.email) {
      alert('Chyba: Nie je možné identifikovať používateľa')
      return
    }

    if (!confirm('Ste si istí, že chcete odstrániť svoj profil? Táto akcia je nevratná.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/profiles/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Profil bol úspešne odstránený')
        // Redirect to login page
        router.push('/login')
      } else {
        alert(`Chyba pri mazaní profilu: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Chyba pri mazaní profilu. Skúste to znovu.')
    } finally {
      setDeleting(false)
    }
  }

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

  if (!user && !authLoading) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Upraviť môj profil
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Aktualizujte svoje údaje pre digitálnu vizitku
                  </p>
                </div>
                <Link
                  href="/app"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#232323] whitespace-nowrap self-start sm:self-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Prehliadať účastníkov
                </Link>
              </div>
            </div>
            <ProfileForm profile={profile} />
            
            {/* Delete Profile Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Odstrániť profil
                    </h3>
                    <p className="text-sm text-red-600 mt-1">
                      Táto akcia je nevratná. Všetky vaše údaje budú trvalo odstránené.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Maže sa...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Odstrániť profil
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}