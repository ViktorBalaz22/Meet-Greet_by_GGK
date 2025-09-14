import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Auth callback route hit!')
  const { searchParams, origin, hash } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  console.log('Auth callback params:', { code: code ? 'present' : 'missing', next, origin, hash })

  // Handle hash fragments (magic link tokens)
  if (hash && hash.includes('access_token=')) {
    console.log('Magic link with hash fragments detected')
    // Extract tokens from hash
    const hashParams = new URLSearchParams(hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      console.log('Tokens found in hash, creating session')
      
      const response = NextResponse.redirect(`${origin}${next}`)
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      // Set the session using the tokens
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      if (!error) {
        console.log('Session set successfully')
        return response
      } else {
        console.log('Error setting session:', error.message)
      }
    }
  }

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('Auth callback success:', data.user?.email)
      return response
    } else {
      console.log('Auth callback error:', error.message)
    }
  }

  // Return the user to an error page with instructions
  console.log('No code provided, redirecting to login with error')
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
