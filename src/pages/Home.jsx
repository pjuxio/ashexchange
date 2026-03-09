import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Connect Creative Artists with{' '}
            <span className="text-indigo-600">Opportunities</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            AshExchange is a dedicated platform where artists discover residencies,
            fellowships, grants, and jobs — and organizations find the creative
            talent they need.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              state={{ role: 'artist' }}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              I&apos;m an Artist
            </Link>
            <Link
              to="/signup"
              state={{ role: 'organization' }}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Post an Opportunity
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How AshExchange Works
          </h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            Whether you&apos;re an artist looking for your next opportunity or an
            organization searching for creative talent, we&apos;ve built AshExchange
            for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For artists */}
            <div className="bg-indigo-50 rounded-2xl p-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Artists</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">✓</span>
                  Build a rich profile showcasing your work, bio, and statement
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">✓</span>
                  Browse curated opportunities matched to your discipline
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">✓</span>
                  Save opportunities and track deadlines in one place
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">✓</span>
                  Be discovered by organizations looking for your skills
                </li>
              </ul>
              <Link
                to="/signup"
                state={{ role: 'artist' }}
                className="mt-6 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
              >
                Create an artist profile →
              </Link>
            </div>

            {/* For organizations */}
            <div className="bg-purple-50 rounded-2xl p-8">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                For Organizations
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">✓</span>
                  Post jobs, residencies, fellowships, grants, and commissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">✓</span>
                  Search artists by discipline, location, and career stage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">✓</span>
                  Save artists you&apos;re interested in for future reference
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">✓</span>
                  Track views and engagement for your postings
                </li>
              </ul>
              <Link
                to="/signup"
                state={{ role: 'organization' }}
                className="mt-6 inline-block text-sm font-semibold text-purple-600 hover:text-purple-700 underline underline-offset-2"
              >
                Post an opportunity →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Opportunities for Every Career Stage
          </h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            From emerging artists to established professionals, AshExchange
            surfaces opportunities at every level.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Jobs',
              'Residencies',
              'Fellowships',
              'Grants',
              'Commissions',
              'Teaching',
              'Volunteer',
            ].map((type) => (
              <span
                key={type}
                className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium shadow-sm text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer banner */}
      <section className="bg-indigo-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Join AshExchange today — it&apos;s free to create an account.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Create your free account
          </Link>
        </div>
      </section>
    </div>
  )
}
