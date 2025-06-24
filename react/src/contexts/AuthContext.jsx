import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ajoute le token à chaque requête si présent
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      delete api.defaults.headers.common['Authorization']
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/users')
      setUser(response.data)
    } catch (error) {
      console.error('Fetch user error:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Erreur de connexion')
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData)
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      return response.data
    } catch (error) {
      console.error('Register error:', error)
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}