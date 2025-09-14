import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/auth'
import { Profile } from '@/lib/types'
import ProfileDetail from '@/components/ProfileDetail'
import Navigation from '@/components/Navigation'

interface ProfilePageProps {
  params: {
    id: string
  }
}

async function getProfile(id: string): Promise<Profile | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('is_hidden', false)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfile(params.id)

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ProfileDetail profile={profile} />
        </div>
      </div>
    </div>
  )
}
