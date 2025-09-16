import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    
    const response = NextResponse.json({ success: true })

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

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    console.log('Server-side user authentication:', { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })

    // Ensure the profile data has the correct user ID
    const profileToInsert = {
      ...profileData,
      id: user.id,
      email: user.email
    }

    console.log('Server-side profile data:', profileToInsert)

    // Insert/update the profile using server-side client
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileToInsert)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Profile saved successfully:', data)
    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
