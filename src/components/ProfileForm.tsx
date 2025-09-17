'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  profile?: Profile | null
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Prosím vyberte obrázok')
        return
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Obrázok je príliš veľký. Maximálna veľkosť je 2MB')
        return
      }

      setPhotoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error getting user:', userError)
        throw new Error('Chyba pri overovaní používateľa: ' + userError.message)
      }
      if (!user) throw new Error('Nie ste prihlásený')
      
      console.log('User authentication status:', { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        aud: user.aud 
      })

      const photoPath = profile?.photo_path

      // Skip photo upload for now to avoid RLS issues
      // TODO: Implement photo upload via API route with service role key
      if (photoFile) {
        console.log('Photo upload skipped - will implement via API route later')
        // photoPath = 'placeholder' // Don't set photoPath for now
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

      setMessage('Profil bol úspešne uložený! Teraz môžete prehliadať ostatných účastníkov.')
      
      // Auto-redirect to main app after 2 seconds
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotka
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP do 2MB</p>
          </div>
          {photoPreview && (
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreed_gdpr"
            name="agreed_gdpr"
            type="checkbox"
            required
            checked={formData.agreed_gdpr}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreed_gdpr" className="text-gray-700">
            Súhlasím so spracovaním osobných údajov v súlade s GDPR *
          </label>
        </div>
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
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Ukladám...' : 'Uložiť profil'}
      </button>
    </form>

    {/* Navigation Section */}
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push('/app')}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          👥 Prehliadať účastníkov
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ✏️ Upraviť profil
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Po uložení profilu môžete prehliadať ostatných účastníkov
      </p>
    </div>
    </>
  )
}
