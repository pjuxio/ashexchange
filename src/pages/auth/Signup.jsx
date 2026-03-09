import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

  const { signUp } = useAuth()
  const navigate = useNavigate()

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

      if (role === 'organization') {
        navigate('/profile/org/edit')
      } else {
        navigate('/profile/artist/edit')
      }
    } finally {
      setLoading(false)
    }
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
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all',
                  role === 'artist'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <span className="text-2xl">🎨</span>
                <span>An Artist</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('organization')}
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all',
                  role === 'organization'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <span className="text-2xl">🏛️</span>
                <span>An Organization</span>
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
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
