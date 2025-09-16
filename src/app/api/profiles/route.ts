import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Profiles API is working', timestamp: new Date().toISOString() })
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    console.log('API route: Received profile data:', profileData)
    
    // Check environment variables
    console.log('API route: Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    })
    
    // Use service role key to bypass ALL RLS policies
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

    console.log('API route: Using service role key to bypass RLS')
    console.log('API route: Attempting upsert with data:', profileData)
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('API route: Database error:', error)
      console.error('API route: Full error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('API route: Profile saved successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API route: Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}