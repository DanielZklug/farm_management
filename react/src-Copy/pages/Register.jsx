import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, User, Egg } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    farm_name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      await register(formData)
      toast.success('Inscription réussie !')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Egg className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gestionnaire de Ferme Avicole
          </h1>
          <p className="text-gray-600">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Saisissez votre nom complet"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la ferme (optionnel)
            </label>
            <input
              type="text"
              name="farm_name"
              value={formData.farm_name}
              onChange={handleChange}
              className="input-field"
              placeholder="Nom de votre ferme"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Saisissez votre email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10 pr-12"
                placeholder="Saisissez votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer un compte'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Vous avez déjà un compte ? Connectez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}