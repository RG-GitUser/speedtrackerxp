import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TestFolders from './pages/TestFolders'
import TestExecution from './pages/TestExecution'
import TestHistory from './pages/TestHistory'
import Login from './pages/Login'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="folders" element={<TestFolders />} />
              <Route path="execute" element={<TestExecution />} />
              <Route path="history" element={<TestHistory />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
