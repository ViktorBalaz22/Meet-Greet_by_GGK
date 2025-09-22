'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { useSupabase } from '@/contexts/SupabaseContext'
import imageCompression from 'browser-image-compression'

interface ProfileFormProps {
  profile?: Profile | null
  onProfileSaved?: () => void
}

export default function ProfileForm({ profile, onProfileSaved }: ProfileFormProps) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    company: profile?.company || '',
    position: profile?.position || '',
    phone: profile?.phone || '',
    linkedin_url: profile?.linkedin_url || '',
    about: profile?.about || '',
    agreed_gdpr: profile?.agreed_gdpr || false,
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Get photo URL from Supabase Storage
  useEffect(() => {
    if (supabase && profile?.photo_path) {
      console.log('ProfileForm: Getting photo URL for path:', profile.photo_path)
      
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(profile.photo_path)
      
      console.log('ProfileForm: Generated photo URL:', data.publicUrl)
      
      // Test if the URL is accessible
      fetch(data.publicUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('ProfileForm: Photo URL is accessible')
            setPhotoPreview(data.publicUrl)
          } else {
            console.error('ProfileForm: Photo URL returned status:', response.status)
            setPhotoPreview(null)
          }
        })
        .catch(error => {
          console.error('ProfileForm: Error testing photo URL:', error)
          setPhotoPreview(null)
        })
    } else {
      console.log('ProfileForm: No photo path or supabase client:', { 
        hasSupabase: !!supabase, 
        photoPath: profile?.photo_path 
      })
      setPhotoPreview(null)
    }
  }, [supabase, profile?.photo_path])

  // Update form data when profile prop changes (fixes refresh issue)
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        company: profile.company || '',
        position: profile.position || '',
        phone: profile.phone || '',
        linkedin_url: profile.linkedin_url || '',
        about: profile.about || '',
        agreed_gdpr: profile.agreed_gdpr || false,
      })
    }
  }, [profile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }, [])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Prosím vyberte obrázok (JPG, PNG, GIF, WebP)')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Obrázok je príliš veľký. Maximálna veľkosť je 5MB')
        return
      }

      try {
        setMessage('Komprimujem obrázok...')
        
        // Compress image
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1, // Compress to max 1MB
          maxWidthOrHeight: 1920, // Max resolution
          useWebWorker: true,
          fileType: 'image/jpeg', // Convert to JPEG for better compression
          initialQuality: 0.8
        })

        // Ensure the compressed file has the correct name and type
        // Extract original extension or default to jpg
        const originalExt = file.name.split('.').pop()?.toLowerCase()
        const validExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(originalExt || '') ? originalExt : 'jpg'
        const correctedFileName = file.name.replace(/\.[^/.]+$/, '') + '.' + validExt
        
        const correctedFile = new File([compressedFile], correctedFileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        })

        console.log('Image compressed:', {
          originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
          compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
          compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
        })

        setPhotoFile(correctedFile)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPhotoPreview(e.target?.result as string)
          setMessage('Obrázok pripravený na nahratie')
        }
        reader.readAsDataURL(compressedFile)
        
      } catch (error) {
        console.error('Image compression error:', error)
        setMessage('Chyba pri kompresii obrázka. Skúste iný súbor.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!supabase || !user) {
        throw new Error('Nie ste prihlásený')
      }
      
      console.log('User authentication status:', { 
        id: user.id, 
        email: user.email
      })

      let photoPath = profile?.photo_path

      // Handle photo upload if a new file is selected
      if (photoFile) {
        console.log('Uploading photo...')
        const uploadFormData = new FormData()
        uploadFormData.append('file', photoFile)
        uploadFormData.append('userId', user.id)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          console.error('Photo upload error:', uploadError)
          throw new Error('Chyba pri nahrávaní fotky: ' + uploadError.error)
        }

        const uploadResult = await uploadResponse.json()
        photoPath = uploadResult.filePath
        console.log('Photo uploaded successfully:', uploadResult)
      }

      // Update or insert profile using email as unique identifier
      const profileData = {
        id: user.id, // Keep user.id for foreign key relationship
        email: user.email!, // Use email as the unique identifier for upsert
        first_name: formData.first_name,
        last_name: formData.last_name,
        company: formData.company,
        position: formData.position,
        phone: formData.phone,
        linkedin_url: formData.linkedin_url,
        about: formData.about,
        photo_path: photoPath,
        agreed_gdpr: formData.agreed_gdpr,
        hidden: false, // Make profile visible by default (correct column name)
      }
      
      console.log('Profile data being sent to Supabase:', profileData)

      // Use server-side API route with service role key to bypass RLS
      console.log('Attempting upsert via API route with service role key')
      console.log('User ID from auth:', user.id)
      console.log('Profile ID in data:', profileData.id)
      
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error('Chyba pri ukladaní profilu: ' + errorData.error)
      }

      const result = await response.json()
      console.log('Profile saved successfully via API:', result)

      setMessage('Profil bol úspešne uložený! Presmerovávam na zoznam účastníkov...')
      
      // Notify parent component that profile was saved
      if (onProfileSaved) {
        onProfileSaved()
      }
      
      // Use router.push instead of window.location.href to maintain session
      setTimeout(() => {
        router.push('/app')
      }, 2000)
    } catch (error: unknown) {
      setMessage('Chyba pri ukladaní profilu: ' + (error instanceof Error ? error.message : 'Neznáma chyba'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
            Meno *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            required
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 input-container"
            style={{ 
              borderColor: '#232323',
              fontSize: '16px', // Prevent zoom on iOS
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            autoComplete="given-name"
            autoCapitalize="words"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
            Priezvisko *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            required
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900 input-container"
            style={{ 
              borderColor: '#232323',
              fontSize: '16px',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            autoComplete="family-name"
            autoCapitalize="words"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Spoločnosť *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            style={{ borderColor: '#232323' }}
          />
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
            Pozícia
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            style={{ borderColor: '#232323' }}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefón
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            style={{ borderColor: '#232323' }}
          />
        </div>

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            style={{ borderColor: '#232323' }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
          O mne / Hobby
        </label>
        <textarea
          id="about"
          name="about"
          rows={3}
          value={formData.about}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
          style={{ borderColor: '#232323' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotka
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center px-4 py-2 text-white font-semibold rounded-lg cursor-pointer transition-opacity duration-200 hover:opacity-90"
                style={{
                  background: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
                }}
              >
                Vybrať súbor
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP do 2MB</p>
          </div>
          {photoPreview && (
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-full object-cover" 
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </div>
      </div>

      {/* GDPR Checkbox */}
      <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
        <label htmlFor="agreed_gdpr" className="flex items-start cursor-pointer">
          <input
            id="agreed_gdpr"
            name="agreed_gdpr"
            type="checkbox"
            required
            checked={formData.agreed_gdpr}
            onChange={handleInputChange}
            className="h-8 w-8 text-gray-900 focus:ring-gray-500 border-2 border-gray-600 rounded mt-1 flex-shrink-0"
            style={{ 
              accentColor: '#232323',
              display: 'block',
              visibility: 'visible',
              opacity: '1',
              backgroundColor: 'white',
              minWidth: '44px',
              minHeight: '44px',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          <span className="ml-3 text-sm text-gray-900 font-medium leading-relaxed">
            Súhlasím so spracovaním osobných údajov v súlade s GDPR *
          </span>
        </label>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes('Chyba') || message.includes('chyba') 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-4 px-8 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{
          background: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
        }}
      >
        {loading ? 'Ukladám...' : 'Uložiť profil'}
      </button>
    </form>
    </>
  )
}
