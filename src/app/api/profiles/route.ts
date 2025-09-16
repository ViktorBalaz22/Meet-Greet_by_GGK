import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Profiles API is working' })
}

export async function POST(request: NextRequest) {
  console.log('API route hit!')
  
  try {
    const profileData = await request.json()
    console.log('Received profile data:', profileData)
    
    // First, verify the user is authenticated using the anon client
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header found')
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token received:', token ? 'present' : 'missing')

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token)
    
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

    // Use service role client for database operations (bypasses RLS)
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

    // Insert/update the profile using admin client
    console.log('Attempting to upsert profile with admin client:', profileToInsert)
    
    const { data, error } = await supabaseAdmin
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