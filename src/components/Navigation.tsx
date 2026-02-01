'use client'

import { useState, useEffect, useCallback } from 'react'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'

export default function Navigation() {
  const { supabase, user } = useSupabase()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!supabase || !user) return

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (supabase && user) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [supabase, user, fetchProfile])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/app" className="flex items-center">
              {theme.mainPageLogoNoCircle ? (
                <div className="mr-3 flex h-8 items-center justify-center overflow-hidden">
                  <Image
                    src={theme.logo}
                    alt={theme.logoAlt}
                    width={80}
                    height={28}
                    className="h-7 w-auto object-contain"
                    unoptimized={theme.logo.endsWith('.svg')}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 overflow-hidden" style={{
                  background: theme.colors.logoContainerStyle,
                }}>
                  <Image
                    src={theme.logo}
                    alt={theme.logoAlt}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    unoptimized={theme.logo.endsWith('.svg')}
                  />
                </div>
              )}
              <span className="text-xl text-gray-900 font-bold">Meet&Greet</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {profile && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile/edit"
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-bold whitespace-nowrap"
                >
                  Môj profil
                </Link>
                
                {profile.is_admin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-bold whitespace-nowrap"
                >
                  Odhlásiť sa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
