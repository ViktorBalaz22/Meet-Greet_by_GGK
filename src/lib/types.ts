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
  is_admin: boolean
  agreed_gdpr: boolean
  hidden: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}
