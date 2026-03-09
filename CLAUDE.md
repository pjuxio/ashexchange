# aSHE XCHNGE — Claude Development Guide

## Project Overview

aSHE XCHNGE is a platform connecting artists with organizations for jobs, residencies, fellowships, grants, commissions, and other opportunities. Artists create profiles and save opportunities; organizations post listings and save artists.

## Tech Stack

- **React 19** with React Router v7
- **Supabase** — auth + Postgres database (via `@supabase/supabase-js`)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Vite 7** build tool

## Running Locally

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
```

See README.md for full Supabase setup instructions.

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx       # Outlet wrapper used by all routes
│   │   └── Navbar.jsx
│   └── ui/
│       ├── Button.jsx       # variants: primary, secondary, ghost, danger; sizes: sm, md, lg
│       └── Input.jsx        # wraps <input> with label and error display
├── contexts/
│   └── AuthContext.jsx      # useAuth() hook — exposes user, session, loading, signIn, signUp, signOut
├── lib/
│   └── supabase.js          # createClient singleton
└── pages/
    ├── Home.jsx
    ├── auth/
    │   ├── Login.jsx
    │   └── Signup.jsx
    ├── artist/
    │   ├── ArtistProfile.jsx     # public view; orgs can save/unsave
    │   └── EditArtistProfile.jsx # protected; upserts artist_profiles + artist_tags
    ├── org/
    │   ├── OrgProfile.jsx        # public view; owner sees edit button
    │   └── EditOrgProfile.jsx    # protected; upserts org_profiles
    ├── opportunity/
    │   ├── OpportunityList.jsx   # public; sidebar filters persisted in URL params
    │   ├── OpportunityDetail.jsx # public; artists can save/unsave
    │   └── CreateOpportunity.jsx # org-only; inserts opportunities + opportunity_tags
    └── dashboard/
        ├── ArtistDashboard.jsx   # shows saved opportunities list (live data)
        └── OrgDashboard.jsx      # shows my opportunities (with activate/close toggle) + saved artists
```

## Routing (`src/App.jsx`)

| Path | Access | Component |
|---|---|---|
| `/` | public | Home |
| `/login` | public | Login |
| `/signup` | public | Signup |
| `/opportunities` | public | OpportunityList |
| `/opportunities/:id` | public | OpportunityDetail |
| `/opportunities/create` | org only | CreateOpportunity |
| `/profile/artist/:id` | public | ArtistProfile |
| `/profile/artist/edit` | authenticated | EditArtistProfile |
| `/profile/org/:id` | public | OrgProfile |
| `/profile/org/edit` | authenticated | EditOrgProfile |
| `/dashboard/artist` | authenticated | ArtistDashboard |
| `/dashboard/org` | authenticated | OrgDashboard |

`ProtectedRoute` accepts an optional `requireRole` prop (`"artist"` or `"organization"`). Role is stored in `user.user_metadata.role` (set at signup).

## Database Schema

All tables live in Supabase. See `supabase/schema.sql` for the full DDL.

### Key tables

| Table | Purpose |
|---|---|
| `artist_profiles` | One per artist user. `user_id` → `auth.users`. Fields: name, pronouns, bio, artist_statement, city, region, country, availability, career_stage, website_url, links (jsonb array of `{label, url}`) |
| `org_profiles` | One per org user. Fields: name, org_type, about, city, region, country, website_url, links, verified |
| `taxonomy` | Discipline/medium/skill tags. Seeded with 10 disciplines. `type` ∈ `('discipline', 'medium', 'skill')` |
| `artist_tags` | Many-to-many: artist_profile ↔ taxonomy |
| `opportunities` | Posted by orgs. Fields: title, type, description, compensation_type, compensation_details, location_type, city, region, country, apply_url, deadline, is_rolling, career_stage_eligibility (text[]), status (`draft`/`active`/`closed`) |
| `opportunity_tags` | Many-to-many: opportunity ↔ taxonomy |
| `saved_opportunities` | Artist saves an opportunity |
| `saved_artists` | Org saves an artist |

### Enum values

```
availability:              open | selective | not_available
career_stage:              emerging | mid_career | established
org_type:                  nonprofit | gallery | university | government | company | individual
opportunity type:          job | residency | fellowship | grant | commission | teaching | volunteer
compensation_type:         paid | stipend | grant_amount | unpaid
location_type:             remote | in_person | hybrid
opportunity status:        draft | active | closed
```

## Code Conventions

### Supabase queries
- Always use `.maybeSingle()` (not `.single()`) when a row may not exist — `.single()` throws on no rows
- Use `Promise.all([...])` for independent parallel queries
- Check `user.user_metadata.role` to gate role-specific UI (e.g. save buttons)

### Forms
- Use the `Input` and `Button` UI components for consistency
- Validate before submitting; store field-level errors in a `errors` object keyed by field name
- Pass `error={errors.fieldName}` to `<Input>` for inline error display
- Use `maybeSingle()` to load existing data on mount, then upsert (insert if no `profileId`, update if one exists)

### Saving (bookmarking) pattern
```
// 1. On mount, load the user's profile id (artist or org)
// 2. Query saved_* table with .maybeSingle() to get initial saved state
// 3. Toggle: delete on unsave, insert on save
// 4. Gate the button behind: user exists AND role matches AND profile id loaded
```

### Filters in URL params (OpportunityList pattern)
- Read from `useSearchParams()`
- Write with `setSearchParams((prev) => { ... })` to preserve other params
- Debounce text search with `setTimeout` / `clearTimeout` in a `useEffect`

### Styling
- Tailwind utility classes throughout — no custom CSS except `src/App.css` (minimal resets)
- Consistent card style: `bg-white rounded-2xl border border-gray-200 p-6`
- Badge/chip style: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`
- Toggle chip (selected): `bg-indigo-600 text-white border-indigo-600`
- Toggle chip (unselected): `bg-white text-gray-700 border-gray-300 hover:border-indigo-400`

## What's Not Yet Built

- **Analytics** — `opportunity_analytics` table exists in schema (views, saves, click-throughs) but the dashboard card is still a placeholder
- **Edit Opportunity** — orgs can activate/close from dashboard but can't edit content after posting
- **Work Samples** — `work_samples` table exists in schema but upload UI is not implemented
- **Email notifications** — no transactional email set up
- **Search on artist profiles** — no browse/search page for orgs to discover artists

## Git

Active development branch: `claude/artist-job-matching-app-Euvqo`
No `main` branch exists yet — all work is on the feature branch above.
