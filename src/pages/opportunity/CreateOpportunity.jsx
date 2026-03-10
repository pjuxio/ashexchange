import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const OPPORTUNITY_TYPES = [
  { value: 'job', label: 'Job' },
  { value: 'residency', label: 'Residency' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'grant', label: 'Grant' },
  { value: 'commission', label: 'Commission' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'volunteer', label: 'Volunteer' },
]

const COMPENSATION_TYPES = [
  { value: 'paid', label: 'Paid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'grant_amount', label: 'Grant amount' },
  { value: 'unpaid', label: 'Unpaid' },
]

const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'in_person', label: 'In person' },
  { value: 'hybrid', label: 'Hybrid' },
]

const CAREER_STAGES = [
  { value: 'emerging', label: 'Emerging' },
  { value: 'mid_career', label: 'Mid-career' },
  { value: 'established', label: 'Established' },
]

const EMPTY_FORM = {
  title: '',
  type: '',
  description: '',
  compensation_type: '',
  compensation_details: '',
  location_type: '',
  city: '',
  region: '',
  country: '',
  apply_url: '',
  deadline: '',
  is_rolling: false,
  career_stage_eligibility: [],
  status: 'draft',
}

export function CreateOpportunity() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [orgProfileId, setOrgProfileId] = useState(null)
  const [disciplines, setDisciplines] = useState([])
  const [selectedDisciplines, setSelectedDisciplines] = useState(new Set())

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: org, error: orgErr }, { data: tax, error: taxErr }] = await Promise.all([
          supabase.from('org_profiles').select('id').eq('user_id', user.id).maybeSingle(),
          supabase.from('taxonomy').select('id, label').eq('type', 'discipline').order('label'),
        ])
        if (orgErr) throw orgErr
        if (taxErr) throw taxErr
        if (!org) throw new Error('You need to complete your organization profile before posting an opportunity.')
        setOrgProfileId(org.id)
        setDisciplines(tax ?? [])
      } catch (err) {
        setLoadError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  function handleField(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function toggleCareerStage(value) {
    setForm((f) => {
      const stages = f.career_stage_eligibility.includes(value)
        ? f.career_stage_eligibility.filter((s) => s !== value)
        : [...f.career_stage_eligibility, value]
      return { ...f, career_stage_eligibility: stages }
    })
  }

  function toggleDiscipline(id) {
    setSelectedDisciplines((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.type) errs.type = 'Please select an opportunity type.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.location_type) errs.location_type = 'Please select a location type.'
    if (form.apply_url && !/^https?:\/\/.+/.test(form.apply_url)) {
      errs.apply_url = 'Must be a valid URL starting with http:// or https://'
    }
    return errs
  }

  async function handleSubmit(e, submitStatus) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)
    try {
      const payload = {
        org_profile_id: orgProfileId,
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        compensation_type: form.compensation_type || null,
        compensation_details: form.compensation_details || null,
        location_type: form.location_type,
        city: form.city || null,
        region: form.region || null,
        country: form.country || null,
        apply_url: form.apply_url || null,
        deadline: form.deadline || null,
        is_rolling: form.is_rolling,
        career_stage_eligibility: form.career_stage_eligibility.length > 0
          ? form.career_stage_eligibility
          : null,
        status: submitStatus,
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('opportunities')
        .insert(payload)
        .select('id')
        .single()
      if (insertErr) throw insertErr

      if (selectedDisciplines.size > 0) {
        const tagRows = [...selectedDisciplines].map((taxonomy_id) => ({
          opportunity_id: inserted.id,
          taxonomy_id,
        }))
        const { error: tagErr } = await supabase.from('opportunity_tags').insert(tagRows)
        if (tagErr) throw tagErr
      }

      navigate(`/opportunities/${inserted.id}`)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
        Loading…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    )
  }

  const locationNeedsPlace = form.location_type === 'in_person' || form.location_type === 'hybrid'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Post an Opportunity</h1>
      <p className="mt-1 text-gray-500">Share a job, residency, fellowship, or other opportunity with artists.</p>

      <form className="mt-8 space-y-8">

        {/* Basics */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basics</h2>

          <Input
            id="title"
            name="title"
            label="Title"
            placeholder="e.g. Artist-in-Residence, Summer 2025"
            value={form.title}
            onChange={handleField}
            error={errors.title}
          />

          <div>
            <label htmlFor="type" className="text-sm font-medium text-gray-700 block mb-1">
              Opportunity type
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleField}
              className={[
                'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                errors.type ? 'border-red-500' : 'border-gray-300',
              ].join(' ')}
            >
              <option value="">Select…</option>
              {OPPORTUNITY_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={7}
              placeholder="Describe the opportunity, what's expected, and what makes it special…"
              value={form.description}
              onChange={handleField}
              className={[
                'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                errors.description ? 'border-red-500' : 'border-gray-300',
              ].join(' ')}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>
        </section>

        {/* Compensation */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Compensation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="compensation_type" className="text-sm font-medium text-gray-700 block mb-1">
                Compensation type
              </label>
              <select
                id="compensation_type"
                name="compensation_type"
                value={form.compensation_type}
                onChange={handleField}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select…</option>
                {COMPENSATION_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <Input
              id="compensation_details"
              name="compensation_details"
              label="Details"
              placeholder="e.g. $5,000 stipend + housing"
              value={form.compensation_details}
              onChange={handleField}
            />
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div>
            <label htmlFor="location_type" className="text-sm font-medium text-gray-700 block mb-1">
              Location type
            </label>
            <select
              id="location_type"
              name="location_type"
              value={form.location_type}
              onChange={handleField}
              className={[
                'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                errors.location_type ? 'border-red-500' : 'border-gray-300',
              ].join(' ')}
            >
              <option value="">Select…</option>
              {LOCATION_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.location_type && <p className="text-xs text-red-600 mt-1">{errors.location_type}</p>}
          </div>

          {locationNeedsPlace && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                id="city"
                name="city"
                label="City"
                placeholder="Detroit"
                value={form.city}
                onChange={handleField}
              />
              <Input
                id="region"
                name="region"
                label="State / Province"
                placeholder="MI"
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
          )}
        </section>

        {/* Eligibility */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Eligibility</h2>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Career stage <span className="text-gray-400 font-normal">(leave blank for all)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {CAREER_STAGES.map((s) => {
                const selected = form.career_stage_eligibility.includes(s.value)
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleCareerStage(s.value)}
                    className={[
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400',
                    ].join(' ')}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {disciplines.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Disciplines <span className="text-gray-400 font-normal">(leave blank for all)</span>
              </p>
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
            </div>
          )}
        </section>

        {/* Application details */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Application</h2>

          <Input
            id="apply_url"
            name="apply_url"
            label="Application URL"
            type="url"
            placeholder="https://yourorg.org/apply"
            value={form.apply_url}
            onChange={handleField}
            error={errors.apply_url}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Input
              id="deadline"
              name="deadline"
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={handleField}
              disabled={form.is_rolling}
            />
            <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_rolling"
                checked={form.is_rolling}
                onChange={handleField}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Rolling deadline</span>
            </label>
          </div>
        </section>

        {/* Errors */}
        {errors.submit && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errors.submit}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'draft')}
          >
            Save as draft
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'active')}
          >
            {saving ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  )
}
