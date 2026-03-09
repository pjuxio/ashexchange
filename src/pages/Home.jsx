import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Connect Creative Artists with{' '}
            <span style={{ color: 'var(--brand-red)' }}>Opportunities</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            aSHE XCHNGE is a dedicated platform where artists discover residencies,
            fellowships, grants, and jobs — and organizations find the creative
            talent they need.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              state={{ role: 'artist' }}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-full transition-colors shadow-lg" style={{ backgroundColor: 'var(--brand-red)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#b03520'} onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--brand-red)'}
            >
              I&apos;m an Artist
            </Link>
            <Link
              to="/signup"
              state={{ role: 'organization' }}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white rounded-full border-2 transition-colors"
              style={{ color: 'var(--brand-plum)', borderColor: 'var(--brand-plum)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor='#f5eef4' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor='white' }}
            >
              Post an Opportunity
            </Link>
          </div>
        </div>
      </section>

      {/* Banner image */}
      <div className="w-full">
        <img src="/banner.webp" alt="aSHE XCHNGE" className="w-full object-cover" />
      </div>

      {/* About */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--brand-text)' }}>
            Our Mission
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--brand-text)' }}>
            The aSHE XCHNGE designs programs, projects and products that center Black Women Creatives.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--brand-text)' }}>
            We highlight and amplify the voices of Black women creatives across various artistic disciplines.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--brand-yellow)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--brand-text)' }}>
            How aSHE XCHNGE Works
          </h2>
          <p className="text-center mb-14 max-w-2xl mx-auto" style={{ color: 'var(--brand-text)' }}>
            Whether you&apos;re an artist looking for your next opportunity or an
            organization searching for creative talent, we&apos;ve built aSHE XCHNGE
            for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For artists */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--brand-text)' }}>For Artists</h3>
              <ul className="space-y-3" style={{ color: 'var(--brand-text)' }}>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Build a profile with your bio, work, and artist statement
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Browse curated opportunities matched to your discipline
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Save opportunities and track deadlines in one place
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Be discovered by organizations looking for your skills
                </li>
              </ul>
              <div className="border-t border-gray-100 pt-4 mb-4 mt-5">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--brand-text)' }}>
                  Always free for artists.
                </p>
                <p className="text-sm text-gray-600">
                  Create your profile, browse opportunities, and get discovered —{' '}
                  <span className="font-medium" style={{ color: 'var(--brand-green)' }}>at no cost</span>.
                </p>
              </div>
              <Link
                to="/signup"
                state={{ role: 'artist' }}
                className="mt-2 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-colors"
                style={{ backgroundColor: 'var(--brand-plum)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#371330'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--brand-plum)'}
              >
                Create an artist profile
              </Link>
            </div>

            {/* For organizations */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--brand-text)' }}>
                For Organizations
              </h3>
              <ul className="space-y-3 mb-5" style={{ color: 'var(--brand-text)' }}>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Post jobs, residencies, fellowships, grants, and commissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Search artists by discipline, location, and career stage
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Save artists you&apos;re interested in for future reference
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: 'var(--brand-green)' }}>✓</span>
                  Track views and engagement for your postings
                </li>
              </ul>
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--brand-text)' }}>
                  Posting is simple and self-managed.
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium" style={{ color: 'var(--brand-green)' }}>$75 per listing</span> for a 90-day cycle.
                  Boost visibility with a <span className="font-medium">Newsletter Spotlight</span> ($100) or <span className="font-medium">Banner Ad</span> (from $200).
                </p>
              </div>
              <Link
                to="/signup"
                state={{ role: 'organization' }}
                className="mt-2 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-colors"
                style={{ backgroundColor: 'var(--brand-plum)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#371330'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--brand-plum)'}
              >
                Post an opportunity
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fffef5' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--brand-text)' }}>
            Opportunities for Every Career Stage
          </h2>
          <p className="mb-12 max-w-xl mx-auto" style={{ color: 'var(--brand-text)' }}>
            From emerging artists to established professionals, aSHE XCHNGE
            surfaces opportunities at every level.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Jobs',
              'Residencies',
              'Fellowships',
              'Grants',
              'Commissions',
              'Workshops',
              'Volunteer',
            ].map((type) => (
              <span
                key={type}
                className="px-4 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium shadow-sm text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer banner */}
      <section className="bg-red-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-red-100 mb-8 text-lg">
            Join aSHE XCHNGE today — it&apos;s free to create an account.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-600 font-semibold rounded-full hover:bg-red-50 transition-colors shadow-lg"
          >
            Create your free account
          </Link>
        </div>
      </section>
    </div>
  )
}
