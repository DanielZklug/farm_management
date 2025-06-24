import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  LogOut,
  Egg,
  Crown
} from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: BarChart3 },
  { name: 'Dépenses', href: '/expenses', icon: DollarSign },
  { name: 'Revenus', href: '/revenues', icon: TrendingUp },
  { name: 'Mortalité', href: '/mortality', icon: AlertTriangle },
]

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Crown },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Egg className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Gestionnaire de Ferme
                </span>
              </div>
              
              <div className="flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
                
                {/* Navigation Admin */}
                {isAdmin && adminNavigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border border-yellow-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">
                  Bonjour, {user?.name}
                </span>
                {user?.role && (
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role === 'admin' ? 'Administrateur' : 
                     user.role === 'manager' ? 'Gestionnaire' : 'Utilisateur'}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}