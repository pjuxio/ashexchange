import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TYPE_LABELS = {
  job: 'Job', residency: 'Residency', fellowship: 'Fellowship',
  grant: 'Grant', commission: 'Commission', teaching: 'Teaching', volunteer: 'Volunteer',
}

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-600',
  closed: 'bg-red-100 text-red-700',
}

function formatDeadline(deadline, isRolling) {
  if (isRolling) return 'Rolling'
  if (!deadline) return null
  return new Date(deadline + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function OrgDashboard() {
  const { user } = useAuth()
  const [orgProfile, setOrgProfile] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [savedArtists, setSavedArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: org } = await supabase
        .from('org_profiles')
        .select('id, name')
        .eq('user_id', user.id)
        .maybeSingle()
      setOrgProfile(org)

      if (org) {
        const [oppsResult, savedResult] = await Promise.all([
          supabase
            .from('opportunities')
            .select('id, title, type, status, deadline, is_rolling, created_at')
            .eq('org_profile_id', org.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('saved_artists')
            .select('artist_profile_id, saved_at, artist_profiles (id, name, city, region, availability)')
            .eq('org_profile_id', org.id)
            .order('saved_at', { ascending: false })
            .limit(5),
        ])
        setOpportunities(oppsResult.data ?? [])
        setSavedArtists((savedResult.data ?? []).map((s) => s.artist_profiles).filter(Boolean))
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  async function toggleOppStatus(opp) {
    setTogglingId(opp.id)
    const newStatus = opp.status === 'active' ? 'closed' : 'active'
    const { data: updated } = await supabase
      .from('opportunities')
      .update({ status: newStatus })
      .eq('id', opp.id)
      .select('id, title, type, status, deadline, is_rolling, created_at')
      .single()
    if (updated) {
      setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? updated : o)))
    }
    setTogglingId(null)
  }

  const displayName = orgProfile?.name || user?.email

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome back, {displayName}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/profile/org/edit"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">🏛️</span>
          <div>
            <p className="font-semibold text-gray-900">
              {orgProfile ? 'Edit Profile' : 'Set Up Profile'}
            </p>
            <p className="text-sm text-gray-500">
              {orgProfile ? 'Update your org info and links' : 'Create your organization profile'}
            </p>
          </div>
        </Link>

        <Link
          to="/opportunities/create"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📢</span>
          <div>
            <p className="font-semibold text-gray-900">Post Opportunity</p>
            <p className="text-sm text-gray-500">Share a job, residency, or fellowship</p>
          </div>
        </Link>
      </div>

      <div className="space-y-10">

        {/* My opportunities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Opportunities</h2>
            <Link to="/opportunities/create" className="text-sm text-indigo-600 hover:underline">
              + Post new
            </Link>
          </div>

          {loading ? (
            <div className="text-sm text-gray-400 py-6 text-center">Loading…</div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No opportunities posted yet.</p>
              <Link to="/opportunities/create" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                Post your first opportunity →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {opportunities.map((opp) => {
                const deadline = formatDeadline(opp.deadline, opp.is_rolling)
                return (
                  <div key={opp.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600 truncate"
                        >
                          {opp.title}
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[opp.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {opp.type ? TYPE_LABELS[opp.type] : ''}
                        {deadline ? ` · ${deadline}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleOppStatus(opp)}
                      disabled={togglingId === opp.id}
                      className="flex-shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors disabled:opacity-40"
                    >
                      {opp.status === 'active' ? 'Close' : 'Activate'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Saved artists */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Creatives</h2>

          {loading ? (
            <div className="text-sm text-gray-400 py-6 text-center">Loading…</div>
          ) : savedArtists.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No saved creatives yet.</p>
              <p className="text-xs text-gray-400 mt-1">Visit a creative's profile and click "Save creative" to add them here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {savedArtists.map((artist) => {
                const location = [artist.city, artist.region].filter(Boolean).join(', ')
                return (
                  <li key={artist.id}>
                    <Link
                      to={`/profile/artist/${artist.id}`}
                      className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{artist.name || 'Unnamed Creative'}</p>
                        {location && <p className="text-sm text-gray-500 mt-0.5">{location}</p>}
                      </div>
                      {artist.availability === 'open' && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex-shrink-0">
                          Open
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
    </div>
  )
}
