import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const ORG_TYPE_OPTIONS = [
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'university', label: 'University / College' },
  { value: 'government', label: 'Government / Public Agency' },
  { value: 'company', label: 'Company' },
  { value: 'individual', label: 'Individual / Fiscal Sponsor' },
]

export function EditOrgProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [profileId, setProfileId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    org_type: '',
    about: '',
    city: '',
    region: '',
    country: '',
    website_url: '',
    links: [],
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: profile, error: profileErr } = await supabase
          .from('org_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        if (profileErr) throw profileErr

        if (profile) {
          setProfileId(profile.id)
          setForm({
            name: profile.name ?? '',
            org_type: profile.org_type ?? '',
            about: profile.about ?? '',
            city: profile.city ?? '',
            region: profile.region ?? '',
            country: profile.country ?? '',
            website_url: profile.website_url ?? '',
            links: profile.links ?? [],
          })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  function handleField(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function addLink() {
    setForm((f) => ({ ...f, links: [...f.links, { label: '', url: '' }] }))
  }

  function removeLink(i) {
    setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
  }

  function handleLink(i, field, value) {
    setForm((f) => {
      const links = [...f.links]
      links[i] = { ...links[i], [field]: value }
      return { ...f, links }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const profileData = {
        user_id: user.id,
        name: form.name || null,
        org_type: form.org_type || null,
        about: form.about || null,
        city: form.city || null,
        region: form.region || null,
        country: form.country || null,
        website_url: form.website_url || null,
        links: form.links.filter((l) => l.url),
        updated_at: new Date().toISOString(),
      }

      let currentProfileId = profileId
      if (profileId) {
        const { error: updateErr } = await supabase
          .from('org_profiles')
          .update(profileData)
          .eq('id', profileId)
        if (updateErr) throw updateErr
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('org_profiles')
          .insert(profileData)
          .select('id')
          .single()
        if (insertErr) throw insertErr
        currentProfileId = inserted.id
        setProfileId(currentProfileId)
      }

      setSuccess(true)
      setTimeout(() => navigate(`/profile/org/${currentProfileId}`), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
        Loading your profile…
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Edit Organization Profile</h1>
      <p className="mt-1 text-gray-500">This is how artists will discover and learn about your organization.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">

        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>
          <Input
            id="name"
            name="name"
            label="Organization name"
            placeholder="Arts Council of Example City"
            value={form.name}
            onChange={handleField}
          />
          <div>
            <label htmlFor="org_type" className="text-sm font-medium text-gray-700 block mb-1">
              Organization type
            </label>
            <select
              id="org_type"
              name="org_type"
              value={form.org_type}
              onChange={handleField}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select…</option>
              {ORG_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="about" className="text-sm font-medium text-gray-700 block mb-1">
              About
            </label>
            <textarea
              id="about"
              name="about"
              rows={5}
              placeholder="Describe your organization's mission, programs, and what kinds of artists you work with…"
              value={form.about}
              onChange={handleField}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="city"
              name="city"
              label="City"
              placeholder="Chicago"
              value={form.city}
              onChange={handleField}
            />
            <Input
              id="region"
              name="region"
              label="State / Province"
              placeholder="IL"
              value={form.region}
              onChange={handleField}
            />
            <Input
              id="country"
              name="country"
              label="Country"
              placeholder="US"
              value={form.country}
              onChange={handleField}
            />
          </div>
        </section>

        {/* Links */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Links</h2>
          <Input
            id="website_url"
            name="website_url"
            label="Website"
            type="url"
            placeholder="https://yourorg.org"
            value={form.website_url}
            onChange={handleField}
          />
          {form.links.length > 0 && (
            <div className="space-y-3">
              {form.links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      id={`link-label-${i}`}
                      label={i === 0 ? 'Label' : undefined}
                      placeholder="Instagram"
                      value={link.label}
                      onChange={(e) => handleLink(i, 'label', e.target.value)}
                    />
                  </div>
                  <div className="flex-[2]">
                    <Input
                      id={`link-url-${i}`}
                      type="url"
                      label={i === 0 ? 'URL' : undefined}
                      placeholder="https://instagram.com/yourorg"
                      value={link.url}
                      onChange={(e) => handleLink(i, 'url', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className={`text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ${i === 0 ? 'mt-6' : ''}`}
                    aria-label="Remove link"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={addLink}>
            + Add link
          </Button>
        </section>

        {/* Errors / success */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Profile saved! Redirecting…
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
