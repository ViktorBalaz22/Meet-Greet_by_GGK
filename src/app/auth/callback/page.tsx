'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback page loaded')
        
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1)
        console.log('Hash fragment:', hash)
        
        if (!hash) {
          console.log('No hash fragment found, redirecting to login')
          router.push('/login?error=No authentication data found')
          return
        }

        // Parse the hash parameters
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('Tokens found:', { 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing'
        })

        if (!accessToken || !refreshToken) {
          console.log('Missing tokens, redirecting to login')
          router.push('/login?error=Invalid authentication data')
          return
        }

        // Set the session directly using Supabase client
        console.log('Setting session directly with Supabase client')
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (sessionError) {
          console.error('Error setting session:', sessionError)
          setError('Failed to authenticate: ' + sessionError.message)
          return
        }

        console.log('Session set successfully:', data)
        
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect to main app
        console.log('Redirecting to /app')
        router.push('/app')
        
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
