import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const TYPE_LABELS = {
  job: 'Job', residency: 'Residency', fellowship: 'Fellowship',
  grant: 'Grant', commission: 'Commission', teaching: 'Teaching', volunteer: 'Volunteer',
}
const LOCATION_LABELS = { remote: 'Remote', in_person: 'In person', hybrid: 'Hybrid' }
const COMPENSATION_LABELS = { paid: 'Paid', stipend: 'Stipend', grant_amount: 'Grant', unpaid: 'Unpaid' }
const CAREER_STAGE_LABELS = { emerging: 'Emerging', mid_career: 'Mid-career', established: 'Established' }

const LOCATION_COLORS = {
  remote: 'bg-blue-100 text-blue-800',
  in_person: 'bg-orange-100 text-orange-800',
  hybrid: 'bg-purple-100 text-purple-800',
}
const TYPE_COLORS = {
  job: 'bg-green-100 text-green-800',
  residency: 'bg-pink-100 text-pink-800',
  fellowship: 'bg-yellow-100 text-yellow-800',
  grant: 'bg-teal-100 text-teal-800',
  commission: 'bg-indigo-100 text-indigo-800',
  teaching: 'bg-cyan-100 text-cyan-800',
  volunteer: 'bg-gray-100 text-gray-700',
}

function formatDeadline(deadline, isRolling) {
  if (isRolling) return 'Rolling deadline'
  if (!deadline) return null
  const d = new Date(deadline + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function isPastDeadline(deadline, isRolling) {
  if (isRolling || !deadline) return false
  return new Date(deadline + 'T00:00:00') < new Date()
}

export function OpportunityDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [opp, setOpp] = useState(null)
  const [disciplines, setDisciplines] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Save state — only relevant for artists
  const [artistProfileId, setArtistProfileId] = useState(null)
  const [saved, setSaved] = useState(false)
  const [savingToggle, setSavingToggle] = useState(false)

  const isArtist = user?.user_metadata?.role === 'artist'

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [oppResult, tagsResult] = await Promise.all([
        supabase
          .from('opportunities')
          .select('*, org_profiles (id, name, org_type, city, region, country, website_url)')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('opportunity_tags')
          .select('taxonomy_id, taxonomy(label)')
          .eq('opportunity_id', id),
      ])

      if (oppResult.error || !oppResult.data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setOpp(oppResult.data)
      setDisciplines((tagsResult.data ?? []).map((t) => t.taxonomy?.label).filter(Boolean))
      setLoading(false)
    }
    load()
  }, [id])

  // Load artist profile + saved state once we know the user is an artist
  useEffect(() => {
    if (!user || !isArtist) return
    async function loadSaveState() {
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!profile) return
      setArtistProfileId(profile.id)

      const { data: savedRow } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('artist_profile_id', profile.id)
        .eq('opportunity_id', id)
        .maybeSingle()
      setSaved(!!savedRow)
    }
    loadSaveState()
  }, [user, isArtist, id])

  async function toggleSave() {
    if (!artistProfileId) return
    setSavingToggle(true)
    if (saved) {
      await supabase
        .from('saved_opportunities')
        .delete()
        .eq('artist_profile_id', artistProfileId)
        .eq('opportunity_id', id)
      setSaved(false)
    } else {
      await supabase
        .from('saved_opportunities')
        .insert({ artist_profile_id: artistProfileId, opportunity_id: id })
      setSaved(true)
    }
    setSavingToggle(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
        Loading…
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Opportunity not found</h1>
        <p className="mt-2 text-gray-500">This listing doesn't exist or has been removed.</p>
        <Link to="/opportunities" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          ← Browse opportunities
        </Link>
      </div>
    )
  }

  const location = [opp.city, opp.region, opp.country].filter(Boolean).join(', ')
  const deadline = formatDeadline(opp.deadline, opp.is_rolling)
  const past = isPastDeadline(opp.deadline, opp.is_rolling)
  const org = opp.org_profiles

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      <Link to="/opportunities" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        ← Browse opportunities
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {opp.type && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[opp.type] ?? 'bg-gray-100 text-gray-700'}`}>
              {TYPE_LABELS[opp.type] ?? opp.type}
            </span>
          )}
          {opp.location_type && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LOCATION_COLORS[opp.location_type] ?? 'bg-gray-100 text-gray-700'}`}>
              {LOCATION_LABELS[opp.location_type] ?? opp.location_type}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{opp.title}</h1>

        {org && (
          <Link to={`/profile/org/${org.id}`} className="mt-1 inline-block text-sm text-indigo-600 hover:underline">
            {org.name}
          </Link>
        )}

        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {location && <MetaItem label="Location" value={location} />}
          {opp.compensation_type && (
            <MetaItem
              label="Compensation"
              value={`${COMPENSATION_LABELS[opp.compensation_type] ?? opp.compensation_type}${opp.compensation_details ? ` — ${opp.compensation_details}` : ''}`}
            />
          )}
          {deadline && (
            <MetaItem label="Deadline" value={deadline} valueClass={past ? 'text-red-600 font-medium' : undefined} />
          )}
          {opp.career_stage_eligibility?.length > 0 && (
            <MetaItem
              label="Career stage"
              value={opp.career_stage_eligibility.map((s) => CAREER_STAGE_LABELS[s] ?? s).join(', ')}
            />
          )}
        </dl>

        {disciplines.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <span key={d} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{d}</span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {opp.apply_url && (
            <a
              href={opp.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors',
                past
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700',
              ].join(' ')}
            >
              {past ? 'Deadline passed' : 'Apply now →'}
            </a>
          )}

          {isArtist && artistProfileId && (
            <button
              onClick={toggleSave}
              disabled={savingToggle}
              className={[
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50',
                saved
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:text-indigo-700',
              ].join(' ')}
            >
              {saved ? '★ Saved' : '☆ Save'}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {opp.description && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">About this opportunity</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{opp.description}</p>
        </div>
      )}

      {/* About the org */}
      {org && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Posted by{' '}
            <Link to={`/profile/org/${org.id}`} className="text-indigo-600 hover:underline">
              {org.name}
            </Link>
          </h2>
          {[org.city, org.region, org.country].filter(Boolean).length > 0 && (
            <p className="text-sm text-gray-500">
              {[org.city, org.region, org.country].filter(Boolean).join(', ')}
            </p>
          )}
          {org.website_url && (
            <a href={org.website_url} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              {org.website_url}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function MetaItem({ label, value, valueClass }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-0.5 text-sm text-gray-900 ${valueClass ?? ''}`}>{value}</dd>
    </div>
  )
}
