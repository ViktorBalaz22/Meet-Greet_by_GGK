export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  position: string | null
  phone: string | null
  linkedin_url: string | null
  about: string | null
  photo_path: string | null
  hidden: boolean
  is_admin: boolean
  agreed_gdpr: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: 'attendee' | 'admin'
  is_active: boolean
  last_login_at: string | null
}
