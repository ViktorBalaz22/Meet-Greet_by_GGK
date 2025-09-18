'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyOTPForm() {
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
        
        // Redirect immediately after successful verification
        console.log('Redirecting to /app after successful OTP verification')
        
        // Wait a bit longer for session to be established, then redirect
        setTimeout(async () => {
          console.log('Executing redirect to /app')
          
          // Try to refresh the page to ensure session is loaded
          try {
            // Force a page refresh to ensure the session is properly loaded
            window.location.href = '/app'
          } catch (error) {
            console.error('Redirect error:', error)
            // Fallback to router
            router.push('/app')
          }
        }, 2000)
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
          shouldCreateUser: false,
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
            </svg>
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
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 tracking-widest"
              placeholder="123456"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Overujem...' : 'Overiť kód'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
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
      <VerifyOTPForm />
    </Suspense>
  )
}
