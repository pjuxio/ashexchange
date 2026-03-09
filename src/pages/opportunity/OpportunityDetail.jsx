import { useParams } from 'react-router-dom'

export function OpportunityDetail() {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Opportunity Detail</h1>
      <p className="mt-2 text-gray-500">Viewing opportunity: {id}</p>
      <div className="mt-8 p-8 bg-white rounded-2xl border border-gray-200 text-center text-gray-400">
        Opportunity details coming soon.
      </div>
    </div>
  )
}
