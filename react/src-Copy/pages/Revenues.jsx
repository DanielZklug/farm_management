import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Calendar, TrendingUp, Edit, Save, X } from 'lucide-react'
import api from '../services/api'

const revenueTypes = [
  { value: 'oeufs', label: 'Œufs' },
  { value: 'poulets', label: 'Poulets' },
  { value: 'fonds-externes', label: 'Fonds externes' },
  { value: 'subventions', label: 'Subventions' },
  { value: 'aides-agricoles', label: 'Aides agricoles' },
  { value: 'autre', label: 'Autre' }
]

export default function Revenues() {
  const [revenues, setRevenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    quantity: '',
    unit_price: ''
  })

  useEffect(() => {
    fetchRevenues()
  }, [])

  const fetchRevenues = async () => {
    try {
      const response = await api.get('/revenues')
      setRevenues(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des revenus')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingRevenue) {
        await api.put(`/revenues/${editingRevenue.id}`, formData)
        toast.success('Revenu modifié avec succès')
        setEditingRevenue(null)
      } else {
        await api.post('/revenues', formData)
        toast.success('Revenu ajouté avec succès')
      }
      
      setShowForm(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        quantity: '',
        unit_price: ''
      })
      fetchRevenues()
    } catch (error) {
      toast.error('Erreur lors de l\'opération')
    }
  }

  const handleEdit = (revenue) => {
    setEditingRevenue(revenue)
    setFormData({
      date: revenue.date,
      type: revenue.type,
      description: revenue.description,
      quantity: revenue.quantity.toString(),
      unit_price: revenue.unit_price.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) return
    
    try {
      await api.delete(`/revenues/${id}`)
      toast.success('Revenu supprimé')
      fetchRevenues()
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

  const getTypeLabel = (type) => {
    const typeObj = revenueTypes.find(t => t.value === type)
    return typeObj?.label || type
  }

  const getTypeColor = (type) => {
    const colors = {
      'oeufs': 'bg-yellow-100 text-yellow-800',
      'poulets': 'bg-orange-100 text-orange-800',
      'fonds-externes': 'bg-blue-100 text-blue-800',
      'subventions': 'bg-green-100 text-green-800',
      'aides-agricoles': 'bg-purple-100 text-purple-800',
      'autre': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des revenus</h1>
          <p className="text-gray-600">Suivez et gérez tous vos revenus de ferme (en FCFA)</p>
        </div>
        <button
          onClick={() => {
            setEditingRevenue(null)
            setFormData({
              date: new Date().toISOString().split('T')[0],
              type: '',
              description: '',
              quantity: '',
              unit_price: ''
            })
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouveau revenu
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingRevenue ? 'Modifier le revenu' : 'Ajouter un revenu'}
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
                  Type de revenu
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {revenueTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  placeholder="Description du revenu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire (FCFA)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>

              {formData.quantity && formData.unit_price && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    Total: <span className="font-semibold">
                      {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.unit_price))}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingRevenue ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingRevenue(null)
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

      {/* Liste des revenus */}
      <div className="card">
        {revenues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Quantité</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Prix unitaire (FCFA)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total (FCFA)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((revenue) => (
                  <tr key={revenue.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(revenue.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(revenue.type)}`}>
                        {getTypeLabel(revenue.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {revenue.description}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {parseFloat(revenue.quantity).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(revenue.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(revenue.total_amount)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(revenue)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(revenue.id)}
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
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucun revenu enregistré</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Ajouter votre premier revenu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}