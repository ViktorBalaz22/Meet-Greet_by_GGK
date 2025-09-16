import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Profiles API is working' })
}

export async function POST(request: NextRequest) {
  console.log('API route hit!')
  
  try {
    const profileData = await request.json()
    console.log('Received profile data:', profileData)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // We'll set cookies after we create the response
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

    console.log('User authenticated successfully:', user.email)

    // Create response after we know user is authenticated
    const response = NextResponse.json({ success: true })

    console.log('Server-side user authentication:', { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })

    const profileToInsert = {
      id: user.id,
      email: user.email!,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      company: profileData.company,
      position: profileData.position,
      phone: profileData.phone,
      linkedin_url: profileData.linkedin_url,
      about: profileData.about,
      photo_path: profileData.photo_path,
      agreed_gdpr: profileData.agreed_gdpr,
    }

    console.log('Server-side profile data:', profileToInsert)

    // Insert/update the profile using server-side client
    console.log('Attempting to upsert profile with data:', profileToInsert)
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileToInsert)

    if (error) {
      console.error('Database error:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Profile saved successfully:', data)
    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}