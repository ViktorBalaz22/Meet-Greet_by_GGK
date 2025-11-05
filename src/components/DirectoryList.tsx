'use client'

import { useState, useEffect, useCallback } from 'react'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import AttendeeCard from './AttendeeCard'

export default function DirectoryList() {
  const { supabase } = useSupabase()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProfiles = useCallback(async () => {
    if (!supabase) return

    try {
      console.log('DirectoryList: Fetching profiles...')
      
      // First try with hidden filter
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('hidden', false)
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('DirectoryList: Error with hidden filter:', queryError)
        // Fallback: try without filter to see if RLS is the issue
        console.log('DirectoryList: Trying without hidden filter...')
        const fallbackResult = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (fallbackResult.error) {
          console.error('DirectoryList: Error without filter too:', fallbackResult.error)
          throw fallbackResult.error
        }
        
        console.log('DirectoryList: Fallback query successful, got profiles:', fallbackResult.data)
        setProfiles(fallbackResult.data || [])
      } else {
        console.log('DirectoryList: Fetched profiles:', data)
        setProfiles(data || [])
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (supabase) {
      fetchProfiles()
    }
  }, [supabase, fetchProfiles])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (!supabase) {
      console.log('DirectoryList: No supabase client available for search')
      return
    }
    
    if (!query.trim()) {
      console.log('DirectoryList: Empty query, fetching all profiles')
      fetchProfiles()
      return
    }

    try {
      console.log('DirectoryList: Searching for:', query)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('hidden', false)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,company.ilike.%${query}%,position.ilike.%${query}%,about.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('DirectoryList: Search error:', error)
        throw error
      }
      
      console.log('DirectoryList: Search results:', data)
      setProfiles(data || [])
    } catch (error) {
      console.error('Error searching profiles:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232323]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Hľadať podľa mena, firmy, pozície..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#232323] focus:border-transparent text-gray-900"
            style={{ borderColor: '#232323' }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? 'Žiadne výsledky' : 'Žiadni účastníci'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Skúste zmeniť vyhľadávací výraz' : 'Zatiaľ sa nikto neprihlásil'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {profiles.map((profile) => (
              <AttendeeCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
