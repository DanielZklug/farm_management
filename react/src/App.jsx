import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Revenues from './pages/Revenues'
import Mortality from './pages/Mortality'
import AdminPanel from './pages/AdminPanel'
import Layout from './components/Layout'
import { ErrorBoundary } from 'react-error-boundary'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

function ErrorFallback({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <Layout>
                  <Expenses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/revenues" element={
              <ProtectedRoute>
                <Layout>
                  <Revenues />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/mortality" element={
              <ProtectedRoute>
                <Layout>
                  <Mortality />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AdminPanel />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App