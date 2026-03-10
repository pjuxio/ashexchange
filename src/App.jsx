import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'

import { Home } from './pages/Home'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { ArtistDashboard } from './pages/dashboard/ArtistDashboard'
import { OrgDashboard } from './pages/dashboard/OrgDashboard'
import { ArtistProfile } from './pages/artist/ArtistProfile'
import { EditArtistProfile } from './pages/artist/EditArtistProfile'
import { OrgProfile } from './pages/org/OrgProfile'
import { EditOrgProfile } from './pages/org/EditOrgProfile'
import { OpportunityList } from './pages/opportunity/OpportunityList'
import { OpportunityDetail } from './pages/opportunity/OpportunityDetail'
import { CreateOpportunity } from './pages/opportunity/CreateOpportunity'

function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireRole && user.user_metadata?.role !== requireRole) {
    const role = user.user_metadata?.role
    if (role === 'organization') {
      return <Navigate to="/dashboard/org" replace />
    }
    return <Navigate to="/dashboard/artist" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/opportunities" element={<OpportunityList />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/profile/artist/:id" element={<ArtistProfile />} />
        <Route path="/profile/org/:id" element={<OrgProfile />} />

        {/* Protected routes — any authenticated user */}
        <Route
          path="/dashboard/artist"
          element={
            <ProtectedRoute>
              <ArtistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/org"
          element={
            <ProtectedRoute>
              <OrgDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/artist/edit"
          element={
            <ProtectedRoute>
              <EditArtistProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/org/edit"
          element={
            <ProtectedRoute>
              <EditOrgProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected — org only */}
        <Route
          path="/opportunities/create"
          element={
            <ProtectedRoute requireRole="organization">
              <CreateOpportunity />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
