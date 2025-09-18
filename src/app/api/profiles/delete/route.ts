import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Chýba email používateľa' }, { status: 400 })
    }

    // Use service role key to bypass RLS
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

    // First, get the profile to find the photo path
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('photo_path')
      .eq('email', email)
      .single()

    if (fetchError) {
      console.error('Error fetching profile for deletion:', fetchError)
      return NextResponse.json({ error: 'Chyba pri načítavaní profilu' }, { status: 400 })
    }

    // Delete the profile from database
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('email', email)

    if (deleteError) {
      console.error('Error deleting profile:', deleteError)
      return NextResponse.json({ error: 'Chyba pri mazaní profilu z databázy' }, { status: 400 })
    }

    // Delete the photo from storage if it exists
    if (profile?.photo_path) {
      const { error: photoDeleteError } = await supabaseAdmin.storage
        .from('photos')
        .remove([profile.photo_path])

      if (photoDeleteError) {
        console.error('Error deleting photo:', photoDeleteError)
        // Don't fail the entire operation if photo deletion fails
      }
    }

    console.log('Profile deleted successfully:', { email, photoPath: profile?.photo_path })

    return NextResponse.json({ 
      success: true, 
      message: 'Profil bol úspešne odstránený' 
    })

  } catch (error) {
    console.error('Delete profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

