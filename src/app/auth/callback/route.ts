import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Auth callback route hit!')
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  console.log('Auth callback params:', { code: code ? 'present' : 'missing', next, origin })

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
