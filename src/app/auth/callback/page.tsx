'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback page loaded')
        console.log('Current URL:', window.location.href)
        console.log('User Agent:', navigator.userAgent)
        
        // Create Supabase client dynamically to avoid SSR issues
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Missing Supabase environment variables')
          setError('Configuration error: Missing Supabase credentials')
          return
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Try to get tokens from both hash fragment and query parameters
        // This handles different mobile email app behaviors
        const hash = window.location.hash.substring(1)
        const search = window.location.search.substring(1)
        
        console.log('Hash fragment:', hash)
        console.log('Search params:', search)
        
        let accessToken: string | null = null
        let refreshToken: string | null = null
        let error: string | null = null
        let errorDescription: string | null = null
        
        // First try query parameters (better for mobile)
        if (search) {
          const searchParams = new URLSearchParams(search)
          accessToken = searchParams.get('access_token')
          refreshToken = searchParams.get('refresh_token')
          error = searchParams.get('error')
          errorDescription = searchParams.get('error_description')
        }
        
        // If no tokens in query params, try hash fragment (fallback)
        if (!accessToken && hash) {
          const hashParams = new URLSearchParams(hash)
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
          error = hashParams.get('error')
          errorDescription = hashParams.get('error_description')
        }
        
        console.log('Extracted params:', { 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          error: error || 'none',
          errorDescription: errorDescription || 'none'
        })

        // Check for errors first
        if (error) {
          console.log('Authentication error:', error, errorDescription)
          let errorMessage = 'Authentication failed'
          
          if (error === 'otp_expired') {
            errorMessage = 'Prihlasovací odkaz vypršal. Požiadajte o nový odkaz.'
          } else if (error === 'access_denied') {
            errorMessage = 'Prístup zamietnutý. Skúste sa prihlásiť znova.'
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription)
          }
          
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
          return
        }

        if (!accessToken || !refreshToken) {
          console.log('Missing tokens, trying server-side fallback')
          
          // Try server-side API route as fallback
          const serverUrl = new URL('/api/auth/callback', window.location.origin)
          serverUrl.search = window.location.search
          
          console.log('Redirecting to server-side callback:', serverUrl.toString())
          window.location.href = serverUrl.toString()
          return
        }

        // Set the session directly using Supabase client
        console.log('Setting session directly with Supabase client')
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          console.error('Error setting session:', sessionError)
          setError('Failed to authenticate: ' + sessionError.message)
          return
        }

        console.log('Session set successfully:', data)
        
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Verify the session is working
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Session verification failed:', userError)
          setError('Session verification failed')
          return
        }
        
        console.log('Session verified, user:', user.email)
        
        // Clear the URL to remove sensitive tokens
        window.history.replaceState({}, document.title, '/auth/callback')
        
        // Redirect to main app (attendees list)
        console.log('Redirecting to /app')
        window.location.href = '/app'
        
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}
