import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Skip auth check for auth callback to prevent server-side errors
    if (request.nextUrl.pathname === '/auth/callback') {
      return response
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Debug logging
    if (request.nextUrl.pathname === '/app' || request.nextUrl.pathname === '/login') {
      console.log(`Middleware: ${request.nextUrl.pathname}, User: ${user ? user.email : 'Not authenticated'}, Error: ${userError?.message || 'None'}`)
      console.log('Available cookies:', request.cookies.getAll().map(c => c.name))
    }

    // Protected routes
    if (request.nextUrl.pathname.startsWith('/app') || 
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        console.log(`Redirecting to login from ${request.nextUrl.pathname} - no user`)
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Redirect authenticated users away from login
    if (request.nextUrl.pathname === '/login' && user) {
      console.log(`Redirecting authenticated user to /app from login`)
      return NextResponse.redirect(new URL('/app', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a basic response to prevent server-side exceptions
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
