import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export function ArtistDashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
        <p className="mt-2 text-gray-500">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/profile/artist/edit"
          className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl mb-3">👤</div>
          <h2 className="font-semibold text-gray-900">My Profile</h2>
          <p className="mt-1 text-sm text-gray-500">Edit your artist profile and portfolio</p>
        </Link>

        <Link
          to="/opportunities"
          className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl mb-3">🔍</div>
          <h2 className="font-semibold text-gray-900">Browse Opportunities</h2>
          <p className="mt-1 text-sm text-gray-500">Discover jobs, residencies, and more</p>
        </Link>

        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <div className="text-3xl mb-3">🔖</div>
          <h2 className="font-semibold text-gray-900">Saved Opportunities</h2>
          <p className="mt-1 text-sm text-gray-500">View your saved opportunities</p>
          <p className="mt-3 text-xs text-gray-400">Coming soon</p>
        </div>
      </div>
    </div>
  )
}
