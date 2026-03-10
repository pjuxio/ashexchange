import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const role = user?.user_metadata?.role

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--brand-sienna)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/ashe-brand.svg" alt="" className="h-14 w-auto" style={{ filter: 'brightness(0) saturate(100%) invert(87%) sepia(47%) saturate(534%) hue-rotate(331deg) brightness(103%) contrast(101%)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--brand-yellow)' }}>aSHE XCHNGE</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden sm:block text-sm truncate max-w-xs" style={{ color: 'var(--brand-yellow)' }}>
                  {user.email}
                </span>
                <Link
                  to={role === 'organization' ? '/dashboard/org' : '/dashboard/artist'}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--brand-yellow)' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/20"
                  style={{ color: 'var(--brand-yellow)' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--brand-yellow)' }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-full transition-colors" style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-sienna)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f0c808'} onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--brand-yellow)'}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
