-- Artist Profiles
create table artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text,
  pronouns text,
  headshot_url text,
  bio text,
  artist_statement text,
  city text,
  region text,
  country text,
  availability text check (availability in ('open', 'not_available', 'selective')),
  career_stage text check (career_stage in ('emerging', 'mid_career', 'established')),
  website_url text,
  links jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Org Profiles
create table org_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text,
  logo_url text,
  org_type text check (org_type in ('nonprofit', 'gallery', 'university', 'government', 'company', 'individual')),
  about text,
  city text,
  region text,
  country text,
  website_url text,
  links jsonb default '[]',
  verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Work Samples
create table work_samples (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  type text check (type in ('upload', 'embed')),
  file_url text,
  file_type text,
  file_size integer,
  embed_url text,
  embed_platform text,
  title text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Taxonomy
create table taxonomy (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text not null unique,
  type text check (type in ('discipline', 'medium', 'skill')),
  parent_id uuid references taxonomy(id)
);

-- Artist Tags
create table artist_tags (
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  taxonomy_id uuid references taxonomy(id) on delete cascade,
  primary key (artist_profile_id, taxonomy_id)
);

-- Opportunities
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  org_profile_id uuid references org_profiles(id) on delete cascade,
  title text not null,
  description text,
  type text check (type in ('job', 'residency', 'fellowship', 'grant', 'commission', 'teaching', 'volunteer')),
  compensation_type text check (compensation_type in ('paid', 'stipend', 'grant_amount', 'unpaid')),
  compensation_details text,
  location_type text check (location_type in ('remote', 'in_person', 'hybrid')),
  city text,
  region text,
  country text,
  apply_url text,
  deadline date,
  is_rolling boolean default false,
  career_stage_eligibility text[],
  status text default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Opportunity Tags
create table opportunity_tags (
  opportunity_id uuid references opportunities(id) on delete cascade,
  taxonomy_id uuid references taxonomy(id) on delete cascade,
  primary key (opportunity_id, taxonomy_id)
);

-- Saved Opportunities (artist saves an opportunity)
create table saved_opportunities (
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (artist_profile_id, opportunity_id)
);

-- Saved Artists (org saves an artist)
create table saved_artists (
  org_profile_id uuid references org_profiles(id) on delete cascade,
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (org_profile_id, artist_profile_id)
);

-- Opportunity Analytics
create table opportunity_analytics (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade unique,
  views integer default 0,
  saves integer default 0,
  click_throughs integer default 0
);

-- Taxonomy seed data
insert into taxonomy (label, slug, type, parent_id) values
('Visual Art', 'visual-art', 'discipline', null),
('Design', 'design', 'discipline', null),
('Performing Arts', 'performing-arts', 'discipline', null),
('Music', 'music', 'discipline', null),
('Literary Arts', 'literary-arts', 'discipline', null),
('Film & Video', 'film-video', 'discipline', null),
('Craft', 'craft', 'discipline', null),
('Public Art', 'public-art', 'discipline', null),
('Digital & New Media', 'digital-new-media', 'discipline', null),
('Multidisciplinary', 'multidisciplinary', 'discipline', null);
