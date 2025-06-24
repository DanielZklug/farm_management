import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Egg, 
  Heart,
  BarChart3,
  Edit,
  Save,
  X,
  Users,
  ChevronDown
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingChickens, setEditingChickens] = useState(false)
  const [chickenCount, setChickenCount] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Vérifier si l'utilisateur connecté est admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchDashboardData()
    if (isAdmin) {
      fetchUsers()
    }
  }, [])

  // Recharger les données quand l'utilisateur sélectionné change
  useEffect(() => {
    if (selectedUserId && isAdmin) {
      fetchUserDashboardData(selectedUserId)
    }
  }, [selectedUserId])

  const fetchUsers = async () => {
    if (!isAdmin) return
    
    setLoadingUsers(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard')
      setDashboardData(response.data)
      setChickenCount(response.data.farmData.totalChickens)
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDashboardData = async (userId) => {
    try {
      setLoading(true)
      console.log('🔄 Chargement des données pour utilisateur:', userId)
      
      // Récupérer les données spécifiques de l'utilisateur
      const response = await api.get(`/export-csv/${userId}`)
      const userData = response.data

      console.log('📊 Données utilisateur reçues:', userData)

      // Calculer les statistiques pour cet utilisateur
      const totalRevenue = userData.revenues.reduce((sum, r) => sum + r.total_amount, 0)
      const totalExpenses = userData.expenses.reduce((sum, e) => sum + e.amount, 0)
      const totalMortalityLoss = userData.mortality.reduce((sum, m) => sum + m.estimated_loss, 0)
      const netProfit = totalRevenue - totalExpenses - totalMortalityLoss
      const reinvestmentAmount = netProfit > 0 ? netProfit * 0.7 : 0
      const totalMortality = userData.mortality.reduce((sum, m) => sum + m.count, 0)
      const mortalityRate = userData.totalChickens > 0 ? (totalMortality / userData.totalChickens) * 100 : 0

      // Construire les données du dashboard pour cet utilisateur
      const userDashboardData = {
        farmData: {
          totalChickens: userData.totalChickens,
          expenses: userData.expenses,
          revenue: userData.revenues,
          mortality: userData.mortality,
          expenseCategories: []
        },
        statistics: {
          totalRevenue,
          totalExpenses,
          totalMortalityLoss,
          netProfit,
          reinvestmentAmount,
          mortalityRate
        },
        monthlyFinancials: userData.monthlyFinancials || [],
        selectedUser: userData.user
      }

      setDashboardData(userDashboardData)
      setChickenCount(userData.totalChickens)
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données utilisateur:', error)
      toast.error('Erreur lors du chargement des données de l\'utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateChickens = async () => {
    try {
      await api.put('/farm-data/chickens', { total_chickens: chickenCount })
      toast.success('Nombre de poulets mis à jour')
      setEditingChickens(false)
      
      // Recharger les données appropriées
      if (selectedUserId && isAdmin) {
        fetchUserDashboardData(selectedUserId)
      } else {
        fetchDashboardData()
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleUserChange = (userId) => {
    setSelectedUserId(userId)
    if (!userId) {
      // Retour aux données de l'admin connecté
      fetchDashboardData()
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatMonth = (monthString) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des données</p>
      </div>
    )
  }

  const { statistics, farmData, monthlyFinancials, selectedUser } = dashboardData

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord de la ferme
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble des opérations et finances avicoles
            </p>
          </div>

          {/* Sélecteur d'utilisateur pour les admins */}
          {isAdmin && (
            <div className="lg:w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Suivi des utilisateurs</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sélectionner un utilisateur à suivre :
                  </label>
                  <div className="relative">
                    <select
                      value={selectedUserId}
                      onChange={(e) => handleUserChange(e.target.value)}
                      disabled={loadingUsers}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">
                        {user?.name} (Mes données)
                      </option>
                      {users
                        .filter(u => u.id !== user?.id) // Exclure l'admin connecté
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} - {u.farm_name || 'Sans nom de ferme'}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {selectedUser && selectedUser.id !== user?.id && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 text-sm">{selectedUser.name}</p>
                          <p className="text-blue-600 text-xs">{selectedUser.farm_name || 'Sans nom de ferme'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Indicateur de l'utilisateur actuellement affiché */}
        {isAdmin && selectedUser && selectedUser.id !== user?.id && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-blue-800">
                  📊 Vous consultez les données de : <strong>{selectedUser.name}</strong>
                </p>
                <p className="text-blue-600 text-sm">
                  Ferme : {selectedUser.farm_name || 'Non spécifiée'} • Email : {selectedUser.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Revenus totaux</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Dépenses totales</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(statistics.totalExpenses)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bénéfice net</p>
              <p className={`text-2xl font-bold ${
                statistics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(statistics.netProfit)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              statistics.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                statistics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Disponible pour réinvestissement
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(statistics.reinvestmentAmount)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Carte Total de poulets - ÉDITABLE seulement pour ses propres données */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total de poulets</p>
              {editingChickens && (!selectedUserId || selectedUserId == user?.id) ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={chickenCount}
                    onChange={(e) => setChickenCount(parseInt(e.target.value) || 0)}
                    className="text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-24"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleUpdateChickens}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Sauvegarder"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingChickens(false)
                        setChickenCount(farmData.totalChickens)
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Annuler"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {farmData.totalChickens.toLocaleString('fr-FR')}
                  </p>
                  {/* Bouton d'édition seulement pour ses propres données */}
                  {(!selectedUserId || selectedUserId == user?.id) && (
                    <button
                      onClick={() => setEditingChickens(true)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                      title="Modifier le nombre de poulets"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Egg className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Carte Taux de mortalité - CALCULÉ AUTOMATIQUEMENT */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Taux de mortalité</p>
              <p className={`text-2xl font-bold ${
                statistics.mortalityRate > 5 ? 'text-red-600' : 'text-green-600'
              }`}>
                {statistics.mortalityRate.toFixed(1)}%
              </p>
              {farmData.totalChickens === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedUserId && selectedUserId != user?.id 
                    ? 'Cet utilisateur n\'a pas défini le nombre de poulets'
                    : 'Définissez d\'abord le nombre de poulets'
                  }
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${
              statistics.mortalityRate > 5 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Heart className={`h-6 w-6 ${
                statistics.mortalityRate > 5 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu financier mensuel */}
      {monthlyFinancials && monthlyFinancials.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Aperçu financier mensuel (FCFA)
              {selectedUser && selectedUser.id !== user?.id && (
                <span className="text-blue-600 ml-2">- {selectedUser.name}</span>
              )}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Mois</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Revenus</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Dépenses</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Revenu net</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Disponible pour réinvestissement
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyFinancials.map((month, index) => {
                  const reinvestment = month.netIncome > 0 ? month.netIncome * 0.7 : 0
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatMonth(month.month)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        {formatCurrency(month.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-semibold">
                        {formatCurrency(month.totalExpenses)}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        month.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(month.netIncome)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                        {formatCurrency(reinvestment)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dépenses récentes
            {selectedUser && selectedUser.id !== user?.id && (
              <span className="text-blue-600 text-base ml-2">- {selectedUser.name}</span>
            )}
          </h3>
          {farmData.expenses && farmData.expenses.length > 0 ? (
            <div className="space-y-3">
              {farmData.expenses.slice(0, 5).map((expense, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {expense.category} • {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="text-red-600 font-semibold">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {selectedUser && selectedUser.id !== user?.id 
                ? `${selectedUser.name} n'a pas encore de dépenses enregistrées`
                : 'Aucune dépense enregistrée'
              }
            </p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenus récents
            {selectedUser && selectedUser.id !== user?.id && (
              <span className="text-blue-600 text-base ml-2">- {selectedUser.name}</span>
            )}
          </h3>
          {farmData.revenue && farmData.revenue.length > 0 ? (
            <div className="space-y-3">
              {farmData.revenue.slice(0, 5).map((revenue, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{revenue.description}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {revenue.type} • {new Date(revenue.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="text-green-600 font-semibold">
                    +{formatCurrency(revenue.total_amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {selectedUser && selectedUser.id !== user?.id 
                ? `${selectedUser.name} n'a pas encore de revenus enregistrés`
                : 'Aucun revenu enregistré'
              }
            </p>
          )}
        </div>
      </div>

      {/* Informations sur les calculs */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📊 Informations sur les calculs</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Taux de mortalité :</strong> Calculé automatiquement = (Total morts ÷ Total poulets) × 100</p>
          <p><strong>Réinvestissement :</strong> 70% du bénéfice net (si positif)</p>
          <p><strong>Bénéfice net :</strong> Revenus - Dépenses - Pertes mortalité</p>
          {isAdmin && (
            <p><strong>Suivi utilisateurs :</strong> Sélectionnez un utilisateur dans la liste déroulante pour voir ses données en temps réel</p>
          )}
          {(!selectedUserId || selectedUserId == user?.id) && (
            <p><strong>Total poulets :</strong> Cliquez sur l'icône ✏️ pour modifier</p>
          )}
        </div>
      </div>
    </div>
  )
}