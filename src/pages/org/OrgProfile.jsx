import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const ORG_TYPE_LABELS = {
  nonprofit: 'Nonprofit',
  gallery: 'Gallery',
  university: 'University / College',
  government: 'Government / Public Agency',
  company: 'Company',
  individual: 'Individual / Fiscal Sponsor',
}

export function OrgProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('org_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

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
        <h1 className="text-2xl font-bold text-gray-900">Organization not found</h1>
        <p className="mt-2 text-gray-500">This profile doesn't exist or has been removed.</p>
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
              {profile.name || 'Unnamed Organization'}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.org_type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {ORG_TYPE_LABELS[profile.org_type] ?? profile.org_type}
                </span>
              )}
              {profile.verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
            {(profile.city || profile.region || profile.country) && (
              <p className="mt-2 text-sm text-gray-500">
                {[profile.city, profile.region, profile.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {isOwner && (
            <Link
              to="/profile/org/edit"
              className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      {/* About */}
      {profile.about && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{profile.about}</p>
        </div>
      )}

      {/* Links */}
      {(profile.website_url || (profile.links && profile.links.length > 0)) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Links</h2>
          <ul className="space-y-2">
            {profile.website_url && (
              <li>
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Website →
                </a>
              </li>
            )}
            {(profile.links ?? []).map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
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
