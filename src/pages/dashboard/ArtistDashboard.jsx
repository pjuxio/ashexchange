import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TYPE_LABELS = {
  job: 'Job', residency: 'Residency', fellowship: 'Fellowship',
  grant: 'Grant', commission: 'Commission', teaching: 'Teaching', volunteer: 'Volunteer',
}

function formatDeadline(deadline, isRolling) {
  if (isRolling) return 'Rolling'
  if (!deadline) return null
  const d = new Date(deadline + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isPast(deadline, isRolling) {
  if (isRolling || !deadline) return false
  return new Date(deadline + 'T00:00:00') < new Date()
}

export function ArtistDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [savedOpps, setSavedOpps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('id, name')
        .eq('user_id', user.id)
        .maybeSingle()
      setProfile(artistProfile)

      if (artistProfile) {
        const { data: saved } = await supabase
          .from('saved_opportunities')
          .select(`
            saved_at,
            opportunities (
              id, title, type, deadline, is_rolling, status,
              org_profiles (name)
            )
          `)
          .eq('artist_profile_id', artistProfile.id)
          .order('saved_at', { ascending: false })
          .limit(5)

        setSavedOpps(
          (saved ?? [])
            .map((s) => s.opportunities)
            .filter(Boolean)
            .filter((o) => o.status === 'active')
        )
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const displayName = profile?.name || user?.email

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Creative Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome back, {displayName}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/profile/artist/edit"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold text-gray-900">
              {profile ? 'Edit Profile' : 'Set Up Profile'}
            </p>
            <p className="text-sm text-gray-500">
              {profile ? 'Update your bio, disciplines, and links' : 'Create your creative profile to get discovered'}
            </p>
          </div>
        </Link>

        <Link
          to="/opportunities"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">🔍</span>
          <div>
            <p className="font-semibold text-gray-900">Browse Opportunities</p>
            <p className="text-sm text-gray-500">Discover jobs, residencies, grants, and more</p>
          </div>
        </Link>
      </div>

      {/* Saved opportunities */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved Opportunities</h2>
          <Link to="/opportunities" className="text-sm text-indigo-600 hover:underline">
            Browse all →
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400 py-6 text-center">Loading…</div>
        ) : savedOpps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">No saved opportunities yet.</p>
            <Link to="/opportunities" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              Start browsing →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {savedOpps.map((opp) => {
              const deadline = formatDeadline(opp.deadline, opp.is_rolling)
              const past = isPast(opp.deadline, opp.is_rolling)
              return (
                <li key={opp.id}>
                  <Link
                    to={`/opportunities/${opp.id}`}
                    className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{opp.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {opp.org_profiles?.name}
                        {opp.type ? ` · ${TYPE_LABELS[opp.type] ?? opp.type}` : ''}
                      </p>
                    </div>
                    {deadline && (
                      <span className={`text-xs flex-shrink-0 ${past ? 'text-red-500' : 'text-gray-400'}`}>
                        {deadline}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
