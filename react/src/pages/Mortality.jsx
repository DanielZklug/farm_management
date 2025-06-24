import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Calendar, AlertTriangle, Edit, Save, X } from 'lucide-react'
import api from '../services/api'

const mortalityCauses = [
  { value: 'maladie', label: 'Maladie' },
  { value: 'predateur', label: 'Prédateur' },
  { value: 'accident', label: 'Accident' },
  { value: 'naturel', label: 'Naturel' },
  { value: 'inconnu', label: 'Inconnu' }
]

export default function Mortality() {
  const [mortalityEvents, setMortalityEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMortality, setEditingMortality] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cause: '',
    count: '',
    description: '',
    estimated_loss: ''
  })

  useEffect(() => {
    fetchMortalityEvents()
  }, [])

  const fetchMortalityEvents = async () => {
    try {
      const response = await api.get('/mortality')
      setMortalityEvents(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des événements de mortalité')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingMortality) {
        await api.put(`/mortality/${editingMortality.id}`, formData)
        toast.success('Événement de mortalité modifié avec succès')
        setEditingMortality(null)
      } else {
        await api.post('/mortality', formData)
        toast.success('Événement de mortalité ajouté avec succès')
      }
      
      setShowForm(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        cause: '',
        count: '',
        description: '',
        estimated_loss: ''
      })
      fetchMortalityEvents()
    } catch (error) {
      toast.error('Erreur lors de l\'opération')
    }
  }

  const handleEdit = (mortality) => {
    setEditingMortality(mortality)
    setFormData({
      date: mortality.date,
      cause: mortality.cause,
      count: mortality.count.toString(),
      description: mortality.description,
      estimated_loss: mortality.estimated_loss.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return
    
    try {
      await api.delete(`/mortality/${id}`)
      toast.success('Événement supprimé')
      fetchMortalityEvents()
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

  const getCauseLabel = (cause) => {
    const causeObj = mortalityCauses.find(c => c.value === cause)
    return causeObj?.label || cause
  }

  const getCauseColor = (cause) => {
    const colors = {
      'maladie': 'bg-red-100 text-red-800',
      'predateur': 'bg-orange-100 text-orange-800',
      'accident': 'bg-yellow-100 text-yellow-800',
      'naturel': 'bg-blue-100 text-blue-800',
      'inconnu': 'bg-gray-100 text-gray-800'
    }
    return colors[cause] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi de la mortalité</h1>
          <p className="text-gray-600">Enregistrez et analysez les événements de mortalité (pertes en FCFA)</p>
        </div>
        <button
          onClick={() => {
            setEditingMortality(null)
            setFormData({
              date: new Date().toISOString().split('T')[0],
              cause: '',
              count: '',
              description: '',
              estimated_loss: ''
            })
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvel événement
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingMortality ? 'Modifier l\'événement de mortalité' : 'Ajouter un événement de mortalité'}
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
                  Cause
                </label>
                <select
                  value={formData.cause}
                  onChange={(e) => setFormData({...formData, cause: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner une cause</option>
                  {mortalityCauses.map((cause) => (
                    <option key={cause.value} value={cause.value}>
                      {cause.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'animaux
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.count}
                  onChange={(e) => setFormData({...formData, count: e.target.value})}
                  className="input-field"
                  placeholder="Nombre d'animaux morts"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Description détaillée de l'événement"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perte estimée (FCFA)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.estimated_loss}
                  onChange={(e) => setFormData({...formData, estimated_loss: e.target.value})}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingMortality ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingMortality(null)
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

      {/* Liste des événements */}
      <div className="card">
        {mortalityEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Cause</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Perte estimée (FCFA)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mortalityEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(event.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCauseColor(event.cause)}`}>
                        {getCauseLabel(event.cause)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-red-600">
                      {event.count}
                    </td>
                    <td className="py-3 px-4 text-gray-900 max-w-xs truncate">
                      {event.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-red-600">
                          {formatCurrency(event.estimated_loss)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
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
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucun événement de mortalité enregistré</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Ajouter un événement
            </button>
          </div>
        )}
      </div>
    </div>
  )
}