'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface SupabaseContextType {
  supabase: SupabaseClient | null
  user: User | null
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  user: null,
  loading: true
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use the shared supabase client instance
    if (!supabase) {
      console.error('Supabase client not available')
      setLoading(false)
      return
    }

    // Get initial user only if there's a session
    const getUser = async () => {
      try {
        console.log('SupabaseContext: Getting initial session...')
        // First check if there's a session without calling getUser
        const { data: { session } } = await supabase.auth.getSession()
        console.log('SupabaseContext: Session check result:', { hasSession: !!session, hasUser: !!session?.user })
        
        if (session?.user) {
          console.log('SupabaseContext: Session found, getting user details...')
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) {
            console.error('SupabaseContext: Error getting user:', error)
          } else if (user) {
            console.log('SupabaseContext: User loaded successfully:', { id: user.id, email: user.email })
            setUser({
              id: user.id,
              email: user.email!,
              created_at: user.created_at
            })
          }
        } else {
          console.log('SupabaseContext: No session found')
        }
      } catch (error) {
        console.error('SupabaseContext: Error in getUser:', error)
      } finally {
        console.log('SupabaseContext: Setting loading to false')
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

