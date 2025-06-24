import React, { createContext, useContext, useState, useEffect } from 'react'
import { jsonApi } from '../services/jsonApi'

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

  useEffect(() => {
    // Vérifier s'il y a un utilisateur connecté au démarrage
    const checkCurrentUser = () => {
      console.log('🔍 Vérification utilisateur connecté...')
      
      const currentUser = jsonApi.auth.getCurrentUser()
      if (currentUser) {
        console.log('✅ Utilisateur trouvé:', currentUser.name, currentUser.role)
        setUser(currentUser)
      } else {
        console.log('👤 Aucun utilisateur connecté')
        setUser(null)
      }
      
      setLoading(false)
    }

    checkCurrentUser()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('🔐 Tentative de connexion JSON:', email)
      
      const result = await jsonApi.auth.login(email, password)
      
      console.log('✅ Connexion réussie JSON:', result.user.name)
      setUser(result.user)
      
      return result
    } catch (error) {
      console.error('❌ Erreur login JSON:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      console.log('📝 Tentative d\'inscription JSON:', userData.email)
      
      const result = await jsonApi.auth.register(userData)
      
      console.log('✅ Inscription réussie JSON:', result.user.name)
      setUser(result.user)
      
      return result
    } catch (error) {
      console.error('❌ Erreur register JSON:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Déconnexion JSON...')
      
      await jsonApi.auth.logout()
      
      console.log('✅ Déconnexion réussie JSON')
      setUser(null)
    } catch (error) {
      console.error('❌ Erreur logout JSON:', error)
      // Forcer la déconnexion même en cas d'erreur
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