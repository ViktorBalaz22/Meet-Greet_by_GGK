'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import HCaptcha from '@hcaptcha/react-hcaptcha'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha | null>(null)
  const captchaSiteKey = process.env.NEXT_PUBLIC_SUPABASE_CAPTCHA_SITE_KEY ?? ''
  const isCaptchaEnabled = captchaSiteKey.length > 0
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error parameter in URL
    const error = searchParams.get('error')
    if (error) {
      setMessage(decodeURIComponent(error))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCaptchaEnabled && !captchaToken) {
      setMessage('Prosím potvrďte, že nie ste robot.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      console.log('Sending OTP to email:', email)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Allow new users to sign up
          captchaToken: isCaptchaEnabled ? captchaToken ?? undefined : undefined,
        },
      })

      if (error) {
        setMessage('Chyba pri odosielaní e-mailu: ' + error.message)
      } else {
        // Redirect to OTP verification page with email parameter
        window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`
      }
    } catch {
      setMessage('Nastala neočakávaná chyba')
    } finally {
      setLoading(false)
      if (isCaptchaEnabled) {
        captchaRef.current?.resetCaptcha()
        setCaptchaToken(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Prihlásenie
          </h2>
          <p className="text-gray-600">
            Zadajte svoj e-mail a pošleme vám 6-miestny overovací kód
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mailová adresa
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="vas@email.sk"
            />
          </div>

          {isCaptchaEnabled && (
            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={captchaSiteKey}
                onVerify={(token) => {
                  setCaptchaToken(token)
                  if (token) {
                    setMessage('')
                  }
                }}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Odosielam...' : 'Pošli overovací kód'}
          </button>

          {message && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              message.includes('Chyba') || message.includes('chyba') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Späť na úvodnú stránku
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Načítavam...
            </h2>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
