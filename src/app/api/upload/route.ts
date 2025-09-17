import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({ error: 'Žiadny súbor nebol poskytnutý' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Chýba ID používateľa' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Súbor musí byť obrázok (JPG, PNG, GIF, WebP)' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Súbor je príliš veľký. Maximálna veľkosť je 5MB' }, { status: 400 })
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

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `profiles/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Chyba pri nahrávaní súboru: ' + uploadError.message }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(filePath)

    console.log('File uploaded successfully:', {
      fileName,
      filePath,
      publicUrl: urlData.publicUrl
    })

    return NextResponse.json({ 
      success: true, 
      fileName,
      filePath,
      publicUrl: urlData.publicUrl
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
