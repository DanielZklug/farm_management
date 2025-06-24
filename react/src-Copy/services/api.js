// API unifiée qui utilise maintenant le fichier JSON local
import { jsonApi } from './jsonApi'

console.log('🔧 Mode API: Fichier JSON Local (Production)')
console.log('📁 Données chargées depuis: src/data/database.json')
console.log('✅ Aucune configuration externe requise')

// Simulation d'un délai réseau pour l'UX
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

// API unifiée qui utilise le système JSON
const api = {
  async get(url) {
    await delay()
    
    try {
      if (url === '/user') {
        const user = jsonApi.auth.getCurrentUser()
        return { data: user }
      } else if (url === '/users') {
        const users = await jsonApi.users.getAll()
        return { data: users }
      } else if (url === '/dashboard') {
        const dashboardData = await jsonApi.dashboard.getData()
        return { data: dashboardData }
      } else if (url === '/expenses') {
        const expenses = await jsonApi.expenses.getAll()
        return { data: expenses }
      } else if (url === '/revenues') {
        const revenues = await jsonApi.revenues.getAll()
        return { data: revenues }
      } else if (url === '/mortality') {
        const mortality = await jsonApi.mortality.getAll()
        return { data: mortality }
      } else if (url === '/expense-categories') {
        const categories = await jsonApi.categories.getAll()
        return { data: categories }
      } else if (url.startsWith('/export-csv/')) {
        const userId = url.split('/').pop()
        const csvData = await jsonApi.csv.exportUserData(userId)
        return { data: csvData }
      }
      
      throw new Error('Endpoint non trouvé')
    } catch (error) {
      console.error('❌ Erreur API GET:', error)
      throw error
    }
  },

  async post(url, data) {
    await delay()
    
    try {
      if (url === '/login') {
        console.log('🔐 Tentative de connexion:', data.email)
        const result = await jsonApi.auth.login(data.email, data.password)
        console.log('✅ Connexion réussie:', result.user.name)
        return { data: result }
      } else if (url === '/register') {
        const result = await jsonApi.auth.register(data)
        return { data: result }
      } else if (url === '/logout') {
        const result = await jsonApi.auth.logout()
        return { data: result }
      } else if (url === '/users') {
        const user = await jsonApi.users.create(data)
        return { data: user }
      } else if (url === '/expenses') {
        const expense = await jsonApi.expenses.create(data)
        return { data: expense }
      } else if (url === '/revenues') {
        const revenue = await jsonApi.revenues.create(data)
        return { data: revenue }
      } else if (url === '/mortality') {
        const mortality = await jsonApi.mortality.create(data)
        return { data: mortality }
      } else if (url === '/expense-categories') {
        const category = await jsonApi.categories.create(data)
        return { data: category }
      } else if (url.startsWith('/import-csv/')) {
        const userId = url.split('/').pop()
        const result = await jsonApi.csv.importUserData(userId, data)
        return { data: result }
      }
      
      throw new Error('Endpoint non trouvé')
    } catch (error) {
      console.error('❌ Erreur API POST:', error)
      throw error
    }
  },

  async put(url, data) {
    await delay()
    
    try {
      if (url === '/farm-data/chickens') {
        const result = await jsonApi.farmData.updateChickens(null, data.total_chickens)
        return { data: result }
      } else if (url.startsWith('/users/')) {
        const userId = url.split('/').pop()
        const user = await jsonApi.users.update(userId, data)
        return { data: user }
      } else if (url.startsWith('/expenses/')) {
        const expenseId = url.split('/').pop()
        const expense = await jsonApi.expenses.update(expenseId, data)
        return { data: expense }
      } else if (url.startsWith('/revenues/')) {
        const revenueId = url.split('/').pop()
        const revenue = await jsonApi.revenues.update(revenueId, data)
        return { data: revenue }
      } else if (url.startsWith('/mortality/')) {
        const mortalityId = url.split('/').pop()
        const mortality = await jsonApi.mortality.update(mortalityId, data)
        return { data: mortality }
      }
      
      return { data: { message: 'Mis à jour avec succès' } }
    } catch (error) {
      console.error('❌ Erreur API PUT:', error)
      throw error
    }
  },

  async delete(url) {
    await delay()
    
    try {
      if (url.startsWith('/expenses/')) {
        const id = url.split('/').pop()
        const result = await jsonApi.expenses.delete(id)
        return { data: result }
      } else if (url.startsWith('/revenues/')) {
        const id = url.split('/').pop()
        const result = await jsonApi.revenues.delete(id)
        return { data: result }
      } else if (url.startsWith('/mortality/')) {
        const id = url.split('/').pop()
        const result = await jsonApi.mortality.delete(id)
        return { data: result }
      } else if (url.startsWith('/expense-categories/')) {
        const id = url.split('/').pop()
        const result = await jsonApi.categories.delete(id)
        return { data: result }
      } else if (url.startsWith('/users/')) {
        const id = url.split('/').pop()
        const result = await jsonApi.users.delete(id)
        return { data: result }
      }
      
      throw new Error('Endpoint non trouvé')
    } catch (error) {
      console.error('❌ Erreur API DELETE:', error)
      throw error
    }
  }
}

export default api