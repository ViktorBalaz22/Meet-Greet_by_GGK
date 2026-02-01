'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'

function VerifyOTPForm() {
  const { theme } = useTheme()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (!emailParam) {
      router.push('/login?error=Chyba: E-mail nie je k dispozícii')
      return
    }
    setEmail(emailParam)
  }, [searchParams, router])

  useEffect(() => {
    // Start resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setMessage('Prosím zadajte 6-miestny kód')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      console.log('Verifying OTP for email:', email)
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        console.error('OTP verification error:', error)
        if (error.message.includes('expired')) {
          setMessage('Overovací kód vypršal. Požiadajte o nový kód.')
        } else if (error.message.includes('invalid')) {
          setMessage('Neplatný overovací kód. Skúste to znova.')
        } else {
          setMessage('Chyba pri overovaní: ' + error.message)
        }
      } else {
        console.log('OTP verification successful:', data)
        console.log('Session data:', data.session)
        console.log('User data:', data.user)
        
        // Show success message
        setMessage('Overenie úspešné! Presmerovávam...')
        
        // Store session data in URL parameters and redirect to callback (like magic link)
        if (data.session) {
          console.log('Storing session in URL and redirecting to callback...')
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
          const callbackUrl = new URL('/auth/callback', baseUrl)
          callbackUrl.searchParams.set('access_token', data.session.access_token)
          callbackUrl.searchParams.set('refresh_token', data.session.refresh_token)
          callbackUrl.searchParams.set('type', 'otp')
          
          console.log('Redirecting to callback:', callbackUrl.toString())
          window.location.href = callbackUrl.toString()
        } else {
          console.error('No session data in OTP response')
          setMessage('Chyba: Žiadne údaje o relácii')
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setMessage('Nastala neočakávaná chyba pri overovaní')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setResendLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Allow new users to sign up
        },
      })

      if (error) {
        setMessage('Chyba pri odosielaní nového kódu: ' + error.message)
      } else {
        setMessage('Nový overovací kód bol odoslaný!')
        setResendCooldown(60) // 60 second cooldown
      }
    } catch {
      setMessage('Nastala neočakávaná chyba')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6) // Only digits, max 6
    setOtp(value)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden" style={{
            background: theme.colors.logoContainerStyle,
          }}>
            <Image
              src={theme.logo}
              alt={theme.logoAlt}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              unoptimized={theme.logo.endsWith('.svg')}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Overenie kódu
          </h2>
          <p className="text-gray-600">
            Zadajte 6-miestny kód z e-mailu
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Overovací kód
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-4 py-3 text-center text-2xl font-mono border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent text-gray-900 tracking-widest"
              style={{ borderColor: theme.colors.primary }}
              placeholder="123456"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center py-4 px-8 text-white font-semibold rounded-lg transition-colors duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: theme.colors.buttonGradient,
            }}
          >
            {loading ? 'Overujem...' : 'Overiť kód'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              style={{ color: theme.colors.primary }}
              className="hover:opacity-80 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading 
                ? 'Odosielam...' 
                : resendCooldown > 0 
                  ? `Znovu odoslať za ${resendCooldown}s`
                  : 'Znovu odoslať kód'
              }
            </button>
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              message.includes('Chyba') || message.includes('chyba') || message.includes('Neplatný') || message.includes('vypršal')
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center">
          <Link 
            href="/login" 
            style={{ color: theme.colors.primary }}
            className="hover:opacity-80 text-sm font-medium transition-colors"
          >
            ← Späť na prihlásenie
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden" style={{
              background: "linear-gradient(135deg, #232323 75%, #232323 100%)",
            }}>
              <Image
                src="/Octopus-icon.png"
                alt="Octopus Icon"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Načítavam...
            </h2>
          </div>
        </div>
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  )
}
