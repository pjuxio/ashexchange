import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function Signup() {
  const location = useLocation()
  const initialRole = location.state?.role || null

  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!role) {
      setError('Please select your account type.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, role)

      if (error) {
        setError(error.message)
        return
      }

      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h1>
            <p className="text-gray-600 mb-2">
              We sent a verification link to{' '}
              <span className="font-semibold text-gray-900">{email}</span>.
            </p>
            <p className="text-gray-600 mb-6">
              Click the link in the email to verify your account before logging in.
            </p>
            <p className="text-sm text-gray-400">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="underline underline-offset-2"
                style={{ color: 'var(--brand-plum)' }}
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Join aSHE XCHNGE — it&apos;s free
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">I am joining as…</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('artist')}
                className="flex flex-col items-center gap-1 py-5 px-4 rounded-xl border-2 text-center transition-all"
                style={role === 'artist'
                  ? { borderColor: 'var(--brand-plum)', backgroundColor: '#f5eef4' }
                  : { borderColor: '#e5e7eb' }}
              >
                <span className="text-base font-bold" style={{ color: 'var(--brand-text)' }}>Artist</span>
                <span className="text-xs text-gray-500">Build a profile &amp; find opportunities</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('organization')}
                className="flex flex-col items-center gap-1 py-5 px-4 rounded-xl border-2 text-center transition-all"
                style={role === 'organization'
                  ? { borderColor: 'var(--brand-plum)', backgroundColor: '#f5eef4' }
                  : { borderColor: '#e5e7eb' }}
              >
                <span className="text-base font-bold" style={{ color: 'var(--brand-text)' }}>Organization</span>
                <span className="text-xs text-gray-500">Post opportunities &amp; find talent</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
              style={{ backgroundColor: 'var(--brand-plum)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: 'var(--brand-plum)' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
