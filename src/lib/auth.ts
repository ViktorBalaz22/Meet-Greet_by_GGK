import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Profile, User } from './types'

export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string) {
          cookieStore.delete(name)
        },
      },
    }
  )
}

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at
    }
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = await createServerClient()
    
    // First get the user to get their email
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error getting user in getProfile:', userError)
      return null
    }
    if (!user) return null
    
    // Then get profile by email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .single()

    if (error) {
      console.error('Error getting profile:', error)
      return null
    }
    if (!profile) return null
    
    return profile
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireAuth()
  const profile = await getProfile()
  
  if (!profile || !profile.is_admin) {
    throw new Error('Admin access required')
  }
  
  return profile
}
