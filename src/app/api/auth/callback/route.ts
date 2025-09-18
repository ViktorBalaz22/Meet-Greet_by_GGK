import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('Server-side auth callback:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      error: error || 'none',
      errorDescription: errorDescription || 'none'
    })

    // Check for errors first
    if (error) {
      let errorMessage = 'Authentication failed'
      
      if (error === 'otp_expired') {
        errorMessage = 'Prihlasovací odkaz vypršal. Požiadajte o nový odkaz.'
      } else if (error === 'access_denied') {
        errorMessage = 'Prístup zamietnutý. Skúste sa prihlásiť znova.'
      } else if (errorDescription) {
        errorMessage = decodeURIComponent(errorDescription)
      }
      
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url))
    }

    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL('/login?error=Invalid authentication data', request.url))
    }

    // Use service role key to create a session
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Set the session using the service role
    const { data, error: sessionError } = await supabaseAdmin.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError) {
      console.error('Error setting session server-side:', sessionError)
      return NextResponse.redirect(new URL('/login?error=Failed to authenticate', request.url))
    }

    console.log('Server-side session set successfully:', data)

    // Create a response that redirects to the app
    const response = NextResponse.redirect(new URL('/app', request.url))
    
    // Set the session cookies for the client
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/'
      })
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
    }

    return response

  } catch (error) {
    console.error('Server-side auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url))
  }
}

