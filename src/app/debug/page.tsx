import { createServerClient } from '@/lib/auth'

export default async function DebugPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Authentication</h1>
      <div className="space-y-4">
        <div>
          <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not authenticated'}
        </div>
        <div>
          <strong>Error:</strong> {error ? error.message : 'None'}
        </div>
        <div>
          <strong>Environment Variables:</strong>
          <ul>
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
            <li>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

