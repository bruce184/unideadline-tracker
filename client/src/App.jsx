import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { configureApiClient, getStoredAccessToken } from './services'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Courses from './pages/courses/Courses'
import Dashboard from './pages/dashboard/Dashboard'
import DeadlineDetail from './pages/deadlines/DeadlineDetail'
import DeadlineForm from './pages/deadlines/DeadlineForm'
import Deadlines from './pages/deadlines/Deadlines'
import AISuggestions from './pages/AI/AISuggestions'
import RiskAnalysis from './pages/AI/RiskAnalysis'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => getStoredAccessToken(),
      onUnauthorized: () => navigate('/login'),
    })
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/courses"
        element={(
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/deadlines"
        element={(
          <ProtectedRoute>
            <Deadlines />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/deadlines/new"
        element={(
          <ProtectedRoute>
            <DeadlineForm />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/deadlines/:id"
        element={(
          <ProtectedRoute>
            <DeadlineDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/deadlines/:id/edit"
        element={(
          <ProtectedRoute>
            <DeadlineForm />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/ai-suggestions"
        element={(
          <ProtectedRoute>
            <AISuggestions />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/risk-analysis"
        element={(
          <ProtectedRoute>
            <RiskAnalysis />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
