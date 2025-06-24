import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Calendar, DollarSign, Edit, Save, X, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../services/api'

const frequencyOptions = [
  { value: 'ponctuel', label: 'Ponctuel' },
  { value: 'quotidien', label: 'Quotidien' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'bimensuel', label: 'Bimensuel' },
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'trimestriel', label: 'Trimestriel' },
  { value: 'annuel', label: 'Annuel' }
]

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    frequency: 'ponctuel'
  })

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (expenses.length > 0) {
      calculateMonthlyStats()
    }
  }, [expenses])

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses')
      setExpenses(response.data)
      console.log(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des dépenses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/expense-categories')
      setCategories(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories')
    }
  }

  const calculateMonthlyStats = () => {
    const monthlyData = {}
    
    expenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7) // YYYY-MM
      const monthName = new Date(expense.date + 'T00:00:00').toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          monthKey,
          total: 0,
          count: 0,
          categories: {}
        }
      }
      
      monthlyData[monthKey].total += parseInt(expense.amount)
      monthlyData[monthKey].count += 1
      
      if (!monthlyData[monthKey].categories[expense.category]) {
        monthlyData[monthKey].categories[expense.category] = 0
      }
      monthlyData[monthKey].categories[expense.category] += parseInt(expense.amount)
    })
    
    // Convertir en tableau et trier par mois décroissant
    const statsArray = Object.values(monthlyData)
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .slice(0, 6) // Limiter à 6 mois
    
    setMonthlyStats(statsArray)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, formData)
        toast.success('Dépense modifiée avec succès')
        setEditingExpense(null)
      } else {
        await api.post('/expenses', formData)
        toast.success('Dépense ajoutée avec succès')
      }
      
      setShowForm(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        frequency: 'ponctuel'
      })
      fetchExpenses()
    } catch (error) {
      toast.error('Erreur lors de l\'opération')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      frequency: expense.frequency
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return
    
    try {
      await api.delete(`/expenses/${id}`)
      toast.success('Dépense supprimée')
      fetchExpenses()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
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

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || 'bg-gray-100 text-gray-800'
  }

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + parseInt(expense.amount), 0)
  }

  const getMonthlyAverage = () => {
    if (monthlyStats.length === 0) return 0
    const total = monthlyStats.reduce((sum, month) => sum + month.total, 0)
    return total / monthlyStats.length
  }

  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().toISOString().substring(0, 7)
    return expenses
      .filter(expense => expense.date.substring(0, 7) === currentMonth)
      .reduce((sum, expense) => sum + parseInt(expense.amount), 0)
  }

  const getTopCategory = () => {
    const categoryTotals = {}
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseInt(expense.amount)
    })
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0]
    
    return topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const topCategory = getTopCategory()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des dépenses</h1>
          <p className="text-gray-600">Suivez et gérez toutes vos dépenses de ferme (en FCFA)</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null)
            setFormData({
              date: new Date().toISOString().split('T')[0],
              category: '',
              description: '',
              amount: '',
              frequency: 'ponctuel'
            })
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvelle dépense
        </button>
      </div>

      {/* BI Mensuel - Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total des dépenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalExpenses())}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Moyenne mensuelle</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(getMonthlyAverage())}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ce mois-ci</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(getCurrentMonthExpenses())}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Catégorie principale</p>
              <p className="text-lg font-bold text-purple-600">
                {topCategory ? topCategory.name : 'Aucune'}
              </p>
              {topCategory && (
                <p className="text-sm text-purple-500">
                  {formatCurrency(topCategory.amount)}
                </p>
              )}
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* BI Mensuel - Graphique */}
      {monthlyStats.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle des dépenses</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Mois</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Montant total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Nombre de dépenses</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Catégorie principale</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Évolution</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((month, index) => {
                  const topCategoryInMonth = Object.entries(month.categories)
                    .sort(([,a], [,b]) => b - a)[0]
                  
                  const previousMonth = monthlyStats[index + 1]
                  const evolution = previousMonth 
                    ? ((month.total - previousMonth.total) / previousMonth.total) * 100
                    : 0

                  return (
                    <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                        {formatMonth(month.month)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-semibold">
                        {formatCurrency(month.total)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {month.count} dépense{month.count > 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-4">
                        {topCategoryInMonth && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(topCategoryInMonth[0])}`}>
                            {topCategoryInMonth[0]}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {index < monthlyStats.length - 1 && (
                          <div className={`flex items-center justify-end gap-1 ${
                            evolution > 0 ? 'text-red-600' : evolution < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {evolution > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : evolution < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : null}
                            <span className="text-sm font-medium">
                              {Math.abs(evolution).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  placeholder="Description de la dépense"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fréquence
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="input-field"
                  required
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingExpense ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingExpense(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des dépenses */}
      <div className="card">
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Catégorie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Montant (FCFA)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fréquence</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(expense.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {expense.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-600">
                      {expense.frequency}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune dépense enregistrée</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Ajouter votre première dépense
            </button>
          </div>
        )}
      </div>
    </div>
  )
}