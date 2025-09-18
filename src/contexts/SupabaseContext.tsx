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
        // First check if there's a session without calling getUser
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) {
            console.error('Error getting user:', error)
          } else if (user) {
            setUser({
              id: user.id,
              email: user.email!,
              created_at: user.created_at
            })
          }
        }
      } catch (error) {
        console.error('Error in getUser:', error)
      } finally {
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

