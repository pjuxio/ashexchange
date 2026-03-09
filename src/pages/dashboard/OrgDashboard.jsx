import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export function OrgDashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
        <p className="mt-2 text-gray-500">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/profile/org/edit"
          className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl mb-3">🏛️</div>
          <h2 className="font-semibold text-gray-900">Organization Profile</h2>
          <p className="mt-1 text-sm text-gray-500">Edit your organization profile</p>
        </Link>

        <Link
          to="/opportunities/create"
          className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl mb-3">📢</div>
          <h2 className="font-semibold text-gray-900">Post Opportunity</h2>
          <p className="mt-1 text-sm text-gray-500">Share a job, residency, or fellowship</p>
        </Link>

        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <div className="text-3xl mb-3">🎨</div>
          <h2 className="font-semibold text-gray-900">Saved Artists</h2>
          <p className="mt-1 text-sm text-gray-500">Artists you&apos;ve saved for later</p>
          <p className="mt-3 text-xs text-gray-400">Coming soon</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <div className="text-3xl mb-3">📊</div>
          <h2 className="font-semibold text-gray-900">Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">Track views and engagement on your postings</p>
          <p className="mt-3 text-xs text-gray-400">Coming soon</p>
        </div>
      </div>
    </div>
  )
}
