'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export default function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllProfiles()
  }, [])

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleHidden = async (profileId: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_hidden: !currentHidden })
        .eq('id', profileId)

      if (error) throw error

      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, is_hidden: !currentHidden }
          : profile
      ))
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Chyba pri aktualizácii profilu')
    }
  }

  const exportCSV = () => {
    const headers = ['Celé meno', 'Spoločnosť', 'Pozícia', 'E-mail', 'Telefón', 'LinkedIn', 'O mne', 'Dátum vytvorenia']
    
    const csvContent = [
      headers.join(','),
      ...profiles.map(profile => [
        `"${profile.full_name || ''}"`,
        `"${profile.company || ''}"`,
        `"${profile.position || ''}"`,
        `"${profile.email}"`,
        `"${profile.phone || ''}"`,
        `"${profile.linkedin_url || ''}"`,
        `"${profile.bio || ''}"`,
        `"${new Date(profile.created_at).toLocaleDateString('sk-SK')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ucastnici_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportVCards = () => {
    const vcards = profiles.map(profile => {
      return `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
N:${profile.full_name};;;
ORG:${profile.company}
TITLE:${profile.position || ''}
TEL:${profile.phone || ''}
EMAIL:${profile.email}
URL:${profile.linkedin_url || ''}
NOTE:${profile.bio || ''}
END:VCARD`
    }).join('\n\n')

    const blob = new Blob([vcards], { type: 'text/vcard' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ucastnici_${new Date().toISOString().split('T')[0]}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export dát</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={exportVCards}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export vCards
          </button>
        </div>
      </div>

      {/* Profiles List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Všetci účastníci ({profiles.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {profiles.map((profile) => (
            <div key={profile.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile.full_name}
                    </h3>
                    {profile.is_admin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                    {profile.is_hidden && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Skrytý
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {profile.position} {profile.position && profile.company && '•'} {profile.company}
                  </p>
                  <p className="text-sm text-gray-500">
                    {profile.email} • {new Date(profile.created_at).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleHidden(profile.id, profile.is_hidden)}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                      profile.is_hidden
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {profile.is_hidden ? 'Zobraziť' : 'Skryť'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
