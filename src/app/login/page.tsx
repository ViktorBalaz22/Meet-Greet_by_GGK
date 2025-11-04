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
      console.log('Captcha enabled:', isCaptchaEnabled)
      console.log('Captcha token present:', !!captchaToken)
      
      const signInOptions: any = {
        shouldCreateUser: true, // Allow new users to sign up
      }
      
      if (isCaptchaEnabled && captchaToken) {
        signInOptions.captchaToken = captchaToken
        console.log('Including captcha token in request')
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: signInOptions,
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
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
            background: "linear-gradient(135deg, #232323 75%, #232323 100%)",
          }}>
            <img
              src="/Octopus-icon.png"
              alt="Octopus Icon"
              className="w-10 h-10"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Prihlásenie
          </h2>
          <p className="text-gray-600 font-bold">
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
              className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              style={{ borderColor: '#232323' }}
              placeholder="vas@email.sk"
            />
          </div>

          {isCaptchaEnabled && (
            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={captchaSiteKey}
                onVerify={(token) => {
                  console.log('hCaptcha verified, token received:', token ? 'yes' : 'no')
                  setCaptchaToken(token)
                  if (token) {
                    setMessage('')
                  }
                }}
                onExpire={() => {
                  console.log('hCaptcha expired')
                  setCaptchaToken(null)
                }}
                onError={(err) => {
                  console.error('hCaptcha error:', err)
                  setCaptchaToken(null)
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-8 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
            }}
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
