import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const OPPORTUNITY_TYPES = ['job', 'residency', 'fellowship', 'grant', 'commission', 'teaching', 'volunteer']
const LOCATION_TYPES = ['remote', 'in_person', 'hybrid']
const COMPENSATION_TYPES = ['paid', 'stipend', 'grant_amount', 'unpaid']

const TYPE_LABELS = {
  job: 'Job', residency: 'Residency', fellowship: 'Fellowship',
  grant: 'Grant', commission: 'Commission', teaching: 'Teaching', volunteer: 'Volunteer',
}
const LOCATION_LABELS = { remote: 'Remote', in_person: 'In person', hybrid: 'Hybrid' }
const COMPENSATION_LABELS = { paid: 'Paid', stipend: 'Stipend', grant_amount: 'Grant', unpaid: 'Unpaid' }

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
  return 'Due ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isPastDeadline(deadline, isRolling) {
  if (isRolling || !deadline) return false
  return new Date(deadline + 'T00:00:00') < new Date()
}

export function OpportunityList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [opportunities, setOpportunities] = useState([])
  const [disciplines, setDisciplines] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Filters from URL params
  const search = searchParams.get('q') ?? ''
  const typeFilter = searchParams.get('type') ?? ''
  const locationFilter = searchParams.get('location') ?? ''
  const compensationFilter = searchParams.get('compensation') ?? ''
  const disciplineFilter = searchParams.get('discipline') ?? ''

  // Local search input state (debounced into URL)
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    supabase
      .from('taxonomy')
      .select('id, label, slug')
      .eq('type', 'discipline')
      .order('label')
      .then(({ data }) => setDisciplines(data ?? []))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setParam('q', searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    async function fetch() {
      setLoading(true)

      let query = supabase
        .from('opportunities')
        .select(`
          id, title, type, location_type, compensation_type, compensation_details,
          city, region, country, deadline, is_rolling, created_at,
          org_profiles (id, name, org_type)
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (search) query = query.ilike('title', `%${search}%`)
      if (typeFilter) query = query.eq('type', typeFilter)
      if (locationFilter) query = query.eq('location_type', locationFilter)
      if (compensationFilter) query = query.eq('compensation_type', compensationFilter)

      const { data, error, count } = await query

      if (error) {
        setLoading(false)
        return
      }

      let results = data ?? []

      // Filter by discipline via opportunity_tags (client-side after main query)
      if (disciplineFilter) {
        const { data: taggedIds } = await supabase
          .from('opportunity_tags')
          .select('opportunity_id, taxonomy!inner(slug)')
          .eq('taxonomy.slug', disciplineFilter)
        const idSet = new Set((taggedIds ?? []).map((t) => t.opportunity_id))
        results = results.filter((o) => idSet.has(o.id))
      }

      setOpportunities(results)
      setTotal(count ?? 0)
      setLoading(false)
    }
    fetch()
  }, [search, typeFilter, locationFilter, compensationFilter, disciplineFilter])

  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  function clearFilters() {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilters = search || typeFilter || locationFilter || compensationFilter || disciplineFilter

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Browse Opportunities</h1>
        <p className="mt-1 text-gray-500">Jobs, residencies, fellowships, grants, and more for creatives.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar filters */}
        <aside className="lg:w-56 flex-shrink-0 space-y-5">

          {/* Search */}
          <div>
            <label htmlFor="search" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Search
            </label>
            <input
              id="search"
              type="search"
              placeholder="Keyword…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Type */}
          <FilterGroup
            label="Type"
            options={OPPORTUNITY_TYPES.map((v) => ({ value: v, label: TYPE_LABELS[v] }))}
            value={typeFilter}
            onChange={(v) => setParam('type', v)}
          />

          {/* Location */}
          <FilterGroup
            label="Location"
            options={LOCATION_TYPES.map((v) => ({ value: v, label: LOCATION_LABELS[v] }))}
            value={locationFilter}
            onChange={(v) => setParam('location', v)}
          />

          {/* Compensation */}
          <FilterGroup
            label="Compensation"
            options={COMPENSATION_TYPES.map((v) => ({ value: v, label: COMPENSATION_LABELS[v] }))}
            value={compensationFilter}
            onChange={(v) => setParam('compensation', v)}
          />

          {/* Discipline */}
          {disciplines.length > 0 && (
            <FilterGroup
              label="Discipline"
              options={disciplines.map((d) => ({ value: d.slug, label: d.label }))}
              value={disciplineFilter}
              onChange={(v) => setParam('discipline', v)}
            />
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading…</div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-medium">No opportunities found.</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-2 text-sm text-indigo-600 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {total} {total === 1 ? 'opportunity' : 'opportunities'}
                {hasFilters ? ' matching your filters' : ''}
              </p>
              <ul className="space-y-3">
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opp={opp} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
      <ul className="space-y-1">
        {options.map((o) => (
          <li key={o.value}>
            <button
              onClick={() => onChange(value === o.value ? '' : o.value)}
              className={[
                'w-full text-left text-sm px-2 py-1 rounded-md transition-colors',
                value === o.value
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function OpportunityCard({ opp }) {
  const location = [opp.city, opp.region, opp.country].filter(Boolean).join(', ')
  const deadline = formatDeadline(opp.deadline, opp.is_rolling)
  const past = isPastDeadline(opp.deadline, opp.is_rolling)

  return (
    <li>
      <Link
        to={`/opportunities/${opp.id}`}
        className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">{opp.title}</h2>
            {opp.org_profiles?.name && (
              <p className="text-sm text-gray-500 mt-0.5">{opp.org_profiles.name}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 flex-shrink-0">
            {opp.type && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[opp.type] ?? 'bg-gray-100 text-gray-700'}`}>
                {TYPE_LABELS[opp.type] ?? opp.type}
              </span>
            )}
            {opp.location_type && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LOCATION_COLORS[opp.location_type] ?? 'bg-gray-100 text-gray-700'}`}>
                {LOCATION_LABELS[opp.location_type] ?? opp.location_type}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {location && <span>{location}</span>}
          {opp.compensation_type && (
            <span>{COMPENSATION_LABELS[opp.compensation_type] ?? opp.compensation_type}
              {opp.compensation_details ? ` · ${opp.compensation_details}` : ''}
            </span>
          )}
          {deadline && (
            <span className={past ? 'text-red-500' : ''}>
              {deadline}
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}
