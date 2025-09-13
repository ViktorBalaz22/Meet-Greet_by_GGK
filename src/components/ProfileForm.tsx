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
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    position: profile?.position || '',
    phone: profile?.phone || '',
    linkedin_url: profile?.linkedin_url || '',
    bio: profile?.bio || '',
    gdpr_consent: profile?.gdpr_consent || false,
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
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Nie ste prihlásený')

      let photoPath = profile?.photo_url

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${user.id}.${fileExt}`
        const filePath = `photos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError
        photoPath = filePath
      }

      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          ...formData,
          photo_url: photoPath,
        })

      if (error) throw error

      setMessage('Profil bol úspešne uložený!')
      router.refresh()
    } catch (error: unknown) {
      setMessage('Chyba pri ukladaní profilu: ' + (error instanceof Error ? error.message : 'Neznáma chyba'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Celé meno *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          O mne / Hobby
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={formData.bio}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            id="gdpr_consent"
            name="gdpr_consent"
            type="checkbox"
            required
            checked={formData.gdpr_consent}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="gdpr_consent" className="text-gray-700">
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
  )
}
