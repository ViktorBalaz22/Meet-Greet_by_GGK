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
    
    // Get the user ID from the request body (sent from ProfileForm)
    const { userId } = profileData
    if (!userId) {
      console.error('No userId provided')
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('User ID from request:', userId)

    // Use service role client for database operations (bypasses RLS)
    console.log('Environment variables check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    })

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

    const profileToInsert = {
      id: userId,
      email: profileData.email,
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
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}