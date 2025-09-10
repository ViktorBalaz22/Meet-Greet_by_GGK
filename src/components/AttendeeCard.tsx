'use client'

import { Profile } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useState } from 'react'

interface AttendeeCardProps {
  profile: Profile
}

export default function AttendeeCard({ profile }: AttendeeCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  // Get photo URL from Supabase Storage
  const getPhotoUrl = async () => {
    if (profile.photo_path) {
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(profile.photo_path)
      setPhotoUrl(data.publicUrl)
    }
  }

  useState(() => {
    getPhotoUrl()
  })

  const handleDownloadVCard = () => {
    // Generate vCard content
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.first_name} ${profile.last_name}
N:${profile.last_name};${profile.first_name};;;
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
    link.download = `${profile.last_name}_${profile.company}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareData = {
      title: `${profile.first_name} ${profile.last_name} - ${profile.company}`,
      text: `Pozrite si profil ${profile.first_name} ${profile.last_name} z ${profile.company}`,
      url: `${window.location.origin}/profile/${profile.id}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url)
      alert('Odkaz bol skopírovaný do schránky')
    }
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={photoUrl}
              alt={`${profile.first_name} ${profile.last_name}`}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-sm text-gray-600">
                {profile.position} {profile.position && profile.company && '•'} {profile.company}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadVCard}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                vCard
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Zdieľať
              </button>
              <Link
                href={`/profile/${profile.id}`}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Detail
              </Link>
            </div>
          </div>

          {/* Additional info */}
          {(profile.phone || profile.linkedin_url || profile.about) && (
            <div className="mt-2 space-y-1">
              {profile.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tel:</span> {profile.phone}
                </p>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  LinkedIn profil
                </a>
              )}
              {profile.about && (
                <p className="text-sm text-gray-600 mt-2">
                  {profile.about}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
