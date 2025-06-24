import axios from 'axios'

// Configuration de l'API avec gestion d'erreurs améliorée
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 secondes de timeout
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    // Erreur de réseau (serveur non disponible)
    if (!error.response) {
      const networkError = new Error('Serveur Laravel non disponible. Vérifiez que le serveur est démarré sur http://localhost:8000')
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    }
    
    // Erreur d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api