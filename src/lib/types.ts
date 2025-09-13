export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  company: string | null
  position: string | null
  phone: string | null
  bio: string | null
  photo_url: string | null
  is_admin: boolean
  gdpr_consent: boolean
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}
