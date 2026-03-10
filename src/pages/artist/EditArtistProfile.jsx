import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const AVAILABILITY_OPTIONS = [
  { value: 'open', label: 'Open to opportunities' },
  { value: 'selective', label: 'Selectively available' },
  { value: 'not_available', label: 'Not available' },
]

const CAREER_STAGE_OPTIONS = [
  { value: 'emerging', label: 'Emerging' },
  { value: 'mid_career', label: 'Mid-career' },
  { value: 'established', label: 'Established' },
]

export function EditArtistProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [profileId, setProfileId] = useState(null)

  const [disciplines, setDisciplines] = useState([]) // all taxonomy disciplines
  const [selectedDisciplines, setSelectedDisciplines] = useState(new Set())

  const [form, setForm] = useState({
    name: '',
    pronouns: '',
    bio: '',
    artist_statement: '',
    city: '',
    region: '',
    country: '',
    availability: '',
    career_stage: '',
    website_url: '',
    links: [],
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Load taxonomy disciplines
        const { data: taxData, error: taxErr } = await supabase
          .from('taxonomy')
          .select('id, label, slug')
          .eq('type', 'discipline')
          .order('label')
        if (taxErr) throw taxErr
        setDisciplines(taxData ?? [])

        // Load existing profile
        const { data: profile, error: profileErr } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        if (profileErr) throw profileErr

        if (profile) {
          setProfileId(profile.id)
          setForm({
            name: profile.name ?? '',
            pronouns: profile.pronouns ?? '',
            bio: profile.bio ?? '',
            artist_statement: profile.artist_statement ?? '',
            city: profile.city ?? '',
            region: profile.region ?? '',
            country: profile.country ?? '',
            availability: profile.availability ?? '',
            career_stage: profile.career_stage ?? '',
            website_url: profile.website_url ?? '',
            links: profile.links ?? [],
          })

          // Load selected disciplines
          const { data: tags, error: tagsErr } = await supabase
            .from('artist_tags')
            .select('taxonomy_id')
            .eq('artist_profile_id', profile.id)
          if (tagsErr) throw tagsErr
          setSelectedDisciplines(new Set((tags ?? []).map((t) => t.taxonomy_id)))
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

  function toggleDiscipline(id) {
    setSelectedDisciplines((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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
        pronouns: form.pronouns || null,
        bio: form.bio || null,
        artist_statement: form.artist_statement || null,
        city: form.city || null,
        region: form.region || null,
        country: form.country || null,
        availability: form.availability || null,
        career_stage: form.career_stage || null,
        website_url: form.website_url || null,
        links: form.links.filter((l) => l.url),
        updated_at: new Date().toISOString(),
      }

      let currentProfileId = profileId
      if (profileId) {
        const { error: updateErr } = await supabase
          .from('artist_profiles')
          .update(profileData)
          .eq('id', profileId)
        if (updateErr) throw updateErr
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('artist_profiles')
          .insert(profileData)
          .select('id')
          .single()
        if (insertErr) throw insertErr
        currentProfileId = inserted.id
        setProfileId(currentProfileId)
      }

      // Sync discipline tags
      await supabase
        .from('artist_tags')
        .delete()
        .eq('artist_profile_id', currentProfileId)

      if (selectedDisciplines.size > 0) {
        const tagRows = [...selectedDisciplines].map((taxonomy_id) => ({
          artist_profile_id: currentProfileId,
          taxonomy_id,
        }))
        const { error: tagErr } = await supabase.from('artist_tags').insert(tagRows)
        if (tagErr) throw tagErr
      }

      setSuccess(true)
      setTimeout(() => navigate(`/profile/artist/${currentProfileId}`), 1200)
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
      <h1 className="text-3xl font-bold text-gray-900">Edit Creative Profile</h1>
      <p className="mt-1 text-gray-500">This is how organizations and collaborators will find you.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">

        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="name"
              name="name"
              label="Full name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleField}
            />
            <Input
              id="pronouns"
              name="pronouns"
              label="Pronouns"
              placeholder="she/her"
              value={form.pronouns}
              onChange={handleField}
            />
          </div>
          <div>
            <label htmlFor="bio" className="text-sm font-medium text-gray-700 block mb-1">
              Bio <span className="text-gray-400 font-normal">(short, shown in listings)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={500}
              placeholder="A brief intro about yourself…"
              value={form.bio}
              onChange={handleField}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
          </div>
          <div>
            <label htmlFor="artist_statement" className="text-sm font-medium text-gray-700 block mb-1">
              Creative statement
            </label>
            <textarea
              id="artist_statement"
              name="artist_statement"
              rows={5}
              placeholder="Describe your practice, themes, and approach…"
              value={form.artist_statement}
              onChange={handleField}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </section>

        {/* Disciplines */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Disciplines</h2>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => {
              const selected = selectedDisciplines.has(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDiscipline(d.id)}
                  className={[
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Career */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Career</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="career_stage" className="text-sm font-medium text-gray-700 block mb-1">
                Career stage
              </label>
              <select
                id="career_stage"
                name="career_stage"
                value={form.career_stage}
                onChange={handleField}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select…</option>
                {CAREER_STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="availability" className="text-sm font-medium text-gray-700 block mb-1">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                value={form.availability}
                onChange={handleField}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select…</option>
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
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
              placeholder="Portland"
              value={form.city}
              onChange={handleField}
            />
            <Input
              id="region"
              name="region"
              label="State / Province"
              placeholder="OR"
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
            placeholder="https://yoursite.com"
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
                      placeholder="https://instagram.com/yourhandle"
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
