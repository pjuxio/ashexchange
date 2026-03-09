import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const AVAILABILITY_LABELS = {
  open: 'Open to opportunities',
  selective: 'Selectively available',
  not_available: 'Not available',
}

const CAREER_STAGE_LABELS = {
  emerging: 'Emerging',
  mid_career: 'Mid-career',
  established: 'Established',
}

const AVAILABILITY_COLORS = {
  open: 'bg-green-100 text-green-800',
  selective: 'bg-yellow-100 text-yellow-800',
  not_available: 'bg-gray-100 text-gray-600',
}

export function ArtistProfile() {
  const { id } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [disciplines, setDisciplines] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Save state — only relevant for orgs
  const [orgProfileId, setOrgProfileId] = useState(null)
  const [saved, setSaved] = useState(false)
  const [savingToggle, setSavingToggle] = useState(false)

  const isOrg = user?.user_metadata?.role === 'organization'

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [profileResult, tagsResult] = await Promise.all([
        supabase.from('artist_profiles').select('*').eq('id', id).maybeSingle(),
        supabase.from('artist_tags').select('taxonomy_id, taxonomy(label)').eq('artist_profile_id', id),
      ])

      if (profileResult.error || !profileResult.data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(profileResult.data)
      setDisciplines((tagsResult.data ?? []).map((t) => t.taxonomy?.label).filter(Boolean))
      setLoading(false)
    }
    load()
  }, [id])

  // Load org profile + saved state for orgs
  useEffect(() => {
    if (!user || !isOrg) return
    async function loadSaveState() {
      const { data: org } = await supabase
        .from('org_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!org) return
      setOrgProfileId(org.id)

      const { data: savedRow } = await supabase
        .from('saved_artists')
        .select('artist_profile_id')
        .eq('org_profile_id', org.id)
        .eq('artist_profile_id', id)
        .maybeSingle()
      setSaved(!!savedRow)
    }
    loadSaveState()
  }, [user, isOrg, id])

  async function toggleSave() {
    if (!orgProfileId) return
    setSavingToggle(true)
    if (saved) {
      await supabase
        .from('saved_artists')
        .delete()
        .eq('org_profile_id', orgProfileId)
        .eq('artist_profile_id', id)
      setSaved(false)
    } else {
      await supabase
        .from('saved_artists')
        .insert({ org_profile_id: orgProfileId, artist_profile_id: id })
      setSaved(true)
    }
    setSavingToggle(false)
  }

  const isOwner = user?.id === profile?.user_id

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
        <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
        <p className="mt-2 text-gray-500">This artist profile doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.name || 'Unnamed Artist'}
              {profile.pronouns && (
                <span className="ml-2 text-base font-normal text-gray-500">({profile.pronouns})</span>
              )}
            </h1>
            {(profile.city || profile.region || profile.country) && (
              <p className="mt-1 text-sm text-gray-500">
                {[profile.city, profile.region, profile.country].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.availability && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${AVAILABILITY_COLORS[profile.availability] ?? 'bg-gray-100 text-gray-600'}`}>
                  {AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
                </span>
              )}
              {profile.career_stage && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {CAREER_STAGE_LABELS[profile.career_stage] ?? profile.career_stage}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {isOwner && (
              <Link
                to="/profile/artist/edit"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors text-center"
              >
                Edit profile
              </Link>
            )}
            {isOrg && orgProfileId && (
              <button
                onClick={toggleSave}
                disabled={savingToggle}
                className={[
                  'text-sm font-medium border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50',
                  saved
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:text-indigo-700',
                ].join(' ')}
              >
                {saved ? '★ Saved' : '☆ Save artist'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disciplines */}
      {disciplines.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Disciplines</h2>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <span key={d} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Artist statement */}
      {profile.artist_statement && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Artist Statement</h2>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{profile.artist_statement}</p>
        </div>
      )}

      {/* Links */}
      {(profile.website_url || (profile.links && profile.links.length > 0)) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Links</h2>
          <ul className="space-y-2">
            {profile.website_url && (
              <li>
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline">
                  Website →
                </a>
              </li>
            )}
            {(profile.links ?? []).map((link, i) => (
              <li key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline">
                  {link.label || link.url} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
