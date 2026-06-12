import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import ProfileSetupModal from './ProfileSetupModal'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [setupUser, setSetupUser] = useState(null)
  const [emailSent, setEmailSent] = useState(false)

  const isLogin = mode === 'login'

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_complete')
          .eq('id', data.user.id)
          .single()

        if (!profile?.profile_complete) {
          setSetupUser(data.user)
        } else {
          toast.success('Welcome back!')
          onClose()
        }
      } else {
        // Sign up — sends OTP email verification
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        })
        if (error) throw error

        if (data.user && !data.user.confirmed_at) {
          // Email not yet confirmed — show email sent screen
          setEmailSent(true)
          toast.success('Verification email sent! Check your inbox.')
        } else if (data.user) {
          // Already confirmed (shouldn't happen on first signup)
          setSetupUser(data.user)
        }
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Show profile setup after login if incomplete
  if (setupUser) {
    return <ProfileSetupModal user={setupUser} onComplete={onClose} />
  }

  // Email verification sent screen
  if (emailSent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-midnight/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-parchment rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 bg-ink-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-midnight mb-2">Check your email</h2>
          <p className="text-ink-500 text-sm mb-2">We sent a verification link to:</p>
          <p className="font-semibold text-midnight mb-6">{email}</p>
          <p className="text-xs text-ink-400 mb-6">
            Click the link in the email to verify your account, then come back and log in.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-ink-500 text-parchment py-3 rounded-xl font-semibold text-sm hover:bg-ink-600 transition-colors"
          >
            Got it!
          </button>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-3 text-xs text-ink-400 hover:text-ink-600 transition-colors"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-midnight/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-parchment rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex"
        style={{ minHeight: '560px', maxHeight: '90vh' }}
      >
        {/* LEFT: Form */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-ink-400 hover:text-midnight transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-7">
            <h2 className="font-display text-3xl font-bold text-midnight leading-tight">
              {isLogin ? 'Welcome back' : 'Join Ashiwrites'}
            </h2>
            <p className="text-sm text-ink-500 mt-2">
              {isLogin ? 'Continue your story.' : 'Read, write, and connect.'}
            </p>
          </div>

          {/* Google */}
          <div className="mb-5">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-ink-200 rounded-xl py-2.5 text-sm font-medium text-midnight hover:bg-ink-50 transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLogin ? 'Log in with Google' : 'Sign up with Google'}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ink-200" />
            <span className="text-xs text-ink-400">or</span>
            <div className="flex-1 h-px bg-ink-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white transition-all"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-ink-500 hover:text-ink-700 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-500 text-parchment py-3 rounded-xl font-semibold text-sm hover:bg-ink-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => onSwitch(isLogin ? 'signup' : 'login')}
              className="text-ink-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        {/* RIGHT: Benefits panel */}
        <div className="hidden md:flex w-80 bg-ink-50 border-l border-ink-200 flex-col items-center justify-center p-8 text-center gap-6">
          <div className="w-44 h-44">
            <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <ellipse cx="100" cy="155" rx="70" ry="8" fill="#e8b86d" opacity="0.3"/>
              <path d="M30 60 Q100 40 170 60 L165 140 Q100 125 35 140 Z" fill="#c97d1e" opacity="0.15"/>
              <path d="M30 60 Q100 40 170 60" stroke="#c97d1e" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M100 62 L100 142" stroke="#c97d1e" strokeWidth="2" strokeLinecap="round"/>
              <path d="M35 140 Q100 125 165 140" stroke="#c97d1e" strokeWidth="2" strokeLinecap="round"/>
              <line x1="50" y1="85" x2="92" y2="80" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="50" y1="95" x2="92" y2="91" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="50" y1="105" x2="92" y2="102" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="50" y1="115" x2="92" y2="113" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="108" y1="80" x2="150" y2="85" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="108" y1="91" x2="150" y2="95" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="108" y1="102" x2="150" y2="105" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="108" y1="113" x2="150" y2="115" stroke="#c97d1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              <circle cx="60" cy="40" r="3" fill="#dd9a3c" opacity="0.7"/>
              <circle cx="145" cy="30" r="2" fill="#dd9a3c" opacity="0.5"/>
              <circle cx="170" cy="55" r="2.5" fill="#dd9a3c" opacity="0.6"/>
              <circle cx="30" cy="50" r="2" fill="#dd9a3c" opacity="0.4"/>
              <circle cx="100" cy="20" r="3.5" fill="#c97d1e" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-midnight mb-4">Why join the community?</h3>
            <ul className="space-y-3 text-left">
              {[
                'Get personalized story recommendations',
                'Save your favorites to your Library',
                'Comment, vote, and build your community',
                'Write and publish your own story',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-midnight/70">
                  <svg className="w-4 h-4 text-ink-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}