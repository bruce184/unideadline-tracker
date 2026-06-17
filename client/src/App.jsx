import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Courses from './pages/courses/Courses'
import Dashboard from './pages/dashboard/Dashboard'
import DeadlineDetail from './pages/deadlines/DeadlineDetail'
import DeadlineForm from './pages/deadlines/DeadlineForm'
import Deadlines from './pages/deadlines/Deadlines'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
