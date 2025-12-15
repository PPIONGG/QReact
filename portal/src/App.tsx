import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import thTH from 'antd/locale/th_TH'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import Login from './pages/Login'
import Main from './pages/Main'

function App() {
  return (
    <ConfigProvider locale={thTH}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes - redirect to main if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected routes - redirect to login if not logged in */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
