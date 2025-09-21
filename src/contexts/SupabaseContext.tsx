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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('SupabaseContext: Session check result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          sessionError: sessionError?.message 
        })
        
        if (session?.user) {
          console.log('SupabaseContext: Session found, getting user details...')
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) {
            console.error('SupabaseContext: Error getting user:', error)
            // If getUser fails but we have a session, try to use session user
            if (session.user) {
              console.log('SupabaseContext: Using session user as fallback')
              setUser({
                id: session.user.id,
                email: session.user.email!,
                created_at: session.user.created_at
              })
            }
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
          // Try to refresh the session in case tokens are stored but not active
          console.log('SupabaseContext: Attempting to refresh session...')
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.log('SupabaseContext: Refresh failed:', refreshError.message)
            // Try to restore from localStorage as last resort
            const storedSession = localStorage.getItem('sb-houxspywdwtxmsfqekvp-auth-token')
            if (storedSession) {
              console.log('SupabaseContext: Attempting to restore from localStorage')
              try {
                const parsedSession = JSON.parse(storedSession)
                if (parsedSession?.currentSession?.user) {
                  console.log('SupabaseContext: Restored session from localStorage')
                  setUser({
                    id: parsedSession.currentSession.user.id,
                    email: parsedSession.currentSession.user.email!,
                    created_at: parsedSession.currentSession.user.created_at
                  })
                }
              } catch (e) {
                console.log('SupabaseContext: Failed to parse stored session')
              }
            }
          } else if (refreshData.session?.user) {
            console.log('SupabaseContext: Session refreshed successfully')
            setUser({
              id: refreshData.session.user.id,
              email: refreshData.session.user.email!,
              created_at: refreshData.session.user.created_at
            })
          }
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
        console.log('SupabaseContext: Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user })
        
        if (session?.user) {
          console.log('SupabaseContext: Setting user from auth state change:', { id: session.user.id, email: session.user.email })
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          })
        } else {
          console.log('SupabaseContext: Clearing user from auth state change')
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Set up periodic session refresh to keep session alive
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('SupabaseContext: Refreshing session to keep it alive')
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error('SupabaseContext: Error refreshing session:', error)
      }
    }, 6 * 60 * 60 * 1000) // Refresh every 6 hours for 1-week session

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
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

