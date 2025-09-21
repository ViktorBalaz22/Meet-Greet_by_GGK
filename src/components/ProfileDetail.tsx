'use client'

import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import QRModal from './QRModal'

interface ProfileDetailProps {
  profile: Profile
}

export default function ProfileDetail({ profile }: ProfileDetailProps) {
  const { supabase } = useSupabase()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  // Get photo URL from Supabase Storage
  useEffect(() => {
    if (supabase && profile.photo_path) {
      console.log('ProfileDetail: Getting photo URL for path:', profile.photo_path)
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(profile.photo_path)
      
      console.log('ProfileDetail: Generated photo URL:', data.publicUrl)
      setPhotoUrl(data.publicUrl)
    } else {
      console.log('ProfileDetail: No photo path or supabase client:', { 
        hasSupabase: !!supabase, 
        photoPath: profile.photo_path 
      })
    }
  }, [supabase, profile.photo_path])

  const handleDownloadVCard = () => {
    // Generate vCard content
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${`${profile.first_name || ""} ${profile.last_name || ""}`.trim()}
N:${`${profile.first_name || ""} ${profile.last_name || ""}`.trim()};;;
ORG:${profile.company}
TITLE:${profile.position || ''}
TEL:${profile.phone || ''}
EMAIL:${profile.email}
URL:${profile.linkedin_url || ''}
NOTE:${profile.about || ''}
END:VCARD`

    // Create and download file
    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${`${profile.first_name || ""} ${profile.last_name || ""}`.trim().replace(/\s+/g, '_')}_${profile.company}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }


  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8" style={{
          background: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
        }}>
          <div className="flex items-center justify-between">
            <Link
              href="/app"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Profil účastníka</h1>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img
                  className="h-32 w-32 rounded-full object-cover"
                  src={photoUrl}
                  alt={`${profile.first_name || ""} ${profile.last_name || ""}`.trim()}
                  onError={(e) => {
                    console.error('ProfileDetail: Image failed to load:', photoUrl)
                    console.error('ProfileDetail: Error event:', e)
                    setPhotoUrl(null)
                  }}
                  onLoad={() => {
                    console.log('ProfileDetail: Image loaded successfully:', photoUrl)
                  }}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {`${profile.first_name || ""} ${profile.last_name || ""}`.trim()}
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                {profile.position} {profile.position && profile.company && '•'} {profile.company}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                {profile.phone && (
                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                {profile.linkedin_url && (
                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 font-bold transition-colors duration-200"
                    >
                      LinkedIn profil
                    </a>
                  </div>
                )}
              </div>

              {/* About */}
              {profile.about && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">O mne</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Moved to bottom of card */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start w-full">
              <button
                onClick={handleDownloadVCard}
                className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
                style={{
                  background: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Stiahnuť vCard
              </button>
              <button
                onClick={() => setShowQR(true)}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR kód
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRModal
          url={`${window.location.origin}/profile/${profile.id}`}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  )
}
