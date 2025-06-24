// API complète basée sur le fichier JSON local avec persistance localStorage
import databaseJson from '../data/database.json'

// Simulation d'un délai réseau pour l'UX
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

// Clé pour le localStorage
const STORAGE_KEY = 'poultry_farm_data'

// Fonction pour charger les données depuis localStorage ou fichier JSON
const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      console.log('📁 Données chargées depuis localStorage')
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('⚠️ Erreur lecture localStorage:', error)
  }
  
  console.log('📁 Données chargées depuis fichier JSON initial')
  return {
    users: [...databaseJson.users],
    farm_data: [...databaseJson.farm_data],
    expense_categories: [...databaseJson.expense_categories],
    expenses: [...databaseJson.expenses],
    revenues: [...databaseJson.revenues],
    mortality_events: [...databaseJson.mortality_events]
  }
}

// Fonction pour sauvegarder les données dans localStorage
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('💾 Données sauvegardées dans localStorage')
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error)
  }
}

// Stockage persistant avec localStorage
let sessionData = loadData()

// Variable pour stocker l'utilisateur actuellement connecté (aussi dans localStorage)
const getCurrentUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('current_user')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    return null
  }
}

const saveCurrentUserToStorage = (user) => {
  try {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('current_user')
    }
  } catch (error) {
    console.error('❌ Erreur sauvegarde utilisateur:', error)
  }
}

let currentUser = getCurrentUserFromStorage()

// Fonction utilitaire pour générer des IDs uniques
const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Fonction utilitaire pour formater les dates
const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString()
  }
  return new Date(date).toISOString()
}

// =====================================================
// AUTHENTIFICATION
// =====================================================

const authApi = {
  async login(email, password) {
    await delay()
    
    console.log('🔐 Tentative de connexion JSON:', email)
    
    const user = sessionData.users.find(u => u.email === email)
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', email)
      throw new Error('Email ou mot de passe incorrect')
    }
    
    if (user.password !== password) {
      console.error('❌ Mot de passe incorrect pour:', email)
      throw new Error('Email ou mot de passe incorrect')
    }
    
    if (user.status === 'blocked') {
      console.error('❌ Utilisateur bloqué:', email)
      throw new Error('Votre compte a été bloqué. Contactez l\'administrateur.')
    }
    
    if (user.status === 'pending') {
      console.error('❌ Utilisateur en attente:', email)
      throw new Error('Votre compte est en attente d\'activation.')
    }
    
    // Exclure le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user
    currentUser = userWithoutPassword
    saveCurrentUserToStorage(currentUser)
    
    console.log('✅ Connexion réussie JSON:', user.name, user.role)
    
    return {
      user: userWithoutPassword,
      token: 'json-session-token',
      message: 'Connexion réussie'
    }
  },

  async register(userData) {
    await delay()
    
    console.log('📝 Inscription JSON:', userData.email)
    
    // Vérifier si l'email existe déjà
    const existingUser = sessionData.users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà')
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: generateId('user'),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      farm_name: userData.farm_name || null,
      role: 'user',
      status: 'active',
      created_at: formatDate(new Date())
    }
    
    sessionData.users.push(newUser)
    
    // Créer les données de ferme par défaut
    const farmData = {
      id: generateId('farm'),
      user_id: newUser.id,
      total_chickens: 0,
      created_at: formatDate(new Date()),
      updated_at: formatDate(new Date())
    }
    sessionData.farm_data.push(farmData)
    
    // Créer les catégories par défaut
    const defaultCategories = [
      { name: 'Alimentation', color: 'bg-amber-100 text-amber-800' },
      { name: 'Médicaments', color: 'bg-red-100 text-red-800' },
      { name: 'Équipement', color: 'bg-blue-100 text-blue-800' },
      { name: 'Main-d\'œuvre', color: 'bg-purple-100 text-purple-800' },
      { name: 'Services publics', color: 'bg-green-100 text-green-800' },
      { name: 'Marketing', color: 'bg-pink-100 text-pink-800' },
      { name: 'Autre', color: 'bg-gray-100 text-gray-800' }
    ]
    
    defaultCategories.forEach(cat => {
      sessionData.expense_categories.push({
        id: generateId('cat'),
        user_id: newUser.id,
        name: cat.name,
        color: cat.color,
        is_default: true,
        created_at: formatDate(new Date())
      })
    })
    
    // Sauvegarder les modifications
    saveData(sessionData)
    
    const { password: _, ...userWithoutPassword } = newUser
    currentUser = userWithoutPassword
    saveCurrentUserToStorage(currentUser)
    
    console.log('✅ Inscription réussie JSON:', newUser.name)
    
    return {
      user: userWithoutPassword,
      token: 'json-session-token',
      message: 'Inscription réussie'
    }
  },

  async logout() {
    await delay()
    console.log('🚪 Déconnexion JSON')
    currentUser = null
    saveCurrentUserToStorage(null)
    return { message: 'Déconnexion réussie' }
  },

  getCurrentUser() {
    return currentUser
  }
}

// =====================================================
// GESTION DES UTILISATEURS (ADMIN)
// =====================================================

const usersApi = {
  async getAll() {
    await delay()
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Accès non autorisé')
    }
    
    console.log('👥 Récupération de tous les utilisateurs JSON')
    
    // Retourner tous les utilisateurs sans les mots de passe
    const usersWithoutPasswords = sessionData.users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    
    return usersWithoutPasswords
  },

  async create(userData) {
    await delay()
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Accès non autorisé')
    }
    
    console.log('👤 Création utilisateur JSON:', userData.email)
    
    // Vérifier si l'email existe déjà
    const existingUser = sessionData.users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà')
    }
    
    const newUser = {
      id: generateId('user'),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      farm_name: userData.farm_name || null,
      role: userData.role || 'user',
      status: userData.status || 'active',
      created_at: formatDate(new Date())
    }
    
    sessionData.users.push(newUser)
    
    // Créer les données de ferme par défaut
    sessionData.farm_data.push({
      id: generateId('farm'),
      user_id: newUser.id,
      total_chickens: 0,
      created_at: formatDate(new Date()),
      updated_at: formatDate(new Date())
    })
    
    // Créer les catégories par défaut
    const defaultCategories = [
      { name: 'Alimentation', color: 'bg-amber-100 text-amber-800' },
      { name: 'Médicaments', color: 'bg-red-100 text-red-800' },
      { name: 'Équipement', color: 'bg-blue-100 text-blue-800' },
      { name: 'Main-d\'œuvre', color: 'bg-purple-100 text-purple-800' },
      { name: 'Services publics', color: 'bg-green-100 text-green-800' },
      { name: 'Marketing', color: 'bg-pink-100 text-pink-800' },
      { name: 'Autre', color: 'bg-gray-100 text-gray-800' }
    ]
    
    defaultCategories.forEach(cat => {
      sessionData.expense_categories.push({
        id: generateId('cat'),
        user_id: newUser.id,
        name: cat.name,
        color: cat.color,
        is_default: true,
        created_at: formatDate(new Date())
      })
    })
    
    // Sauvegarder les modifications
    saveData(sessionData)
    
    const { password, ...userWithoutPassword } = newUser
    console.log('✅ Utilisateur créé JSON:', newUser.name)
    
    return userWithoutPassword
  },

  async update(id, userData) {
    await delay()
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('✏️ Mise à jour utilisateur JSON:', id)
    
    const userIndex = sessionData.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Mettre à jour les données (garder le mot de passe existant si non fourni)
    const updatedUser = {
      ...sessionData.users[userIndex],
      ...userData,
      updated_at: formatDate(new Date())
    }
    
    // Si pas de nouveau mot de passe, garder l'ancien
    if (!userData.password) {
      updatedUser.password = sessionData.users[userIndex].password
    }
    
    sessionData.users[userIndex] = updatedUser
    
    // Sauvegarder les modifications
    saveData(sessionData)
    
    const { password, ...userWithoutPassword } = updatedUser
    console.log('✅ Utilisateur mis à jour JSON:', updatedUser.name)
    
    return userWithoutPassword
  },

  async delete(id) {
    await delay()
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Accès non autorisé')
    }
    
    if (id === 'admin-001') {
      throw new Error('Impossible de supprimer l\'administrateur principal')
    }
    
    console.log('🗑️ Suppression utilisateur JSON:', id)
    
    // Supprimer l'utilisateur
    sessionData.users = sessionData.users.filter(u => u.id !== id)
    
    // Supprimer toutes ses données (cascade)
    sessionData.farm_data = sessionData.farm_data.filter(f => f.user_id !== id)
    sessionData.expense_categories = sessionData.expense_categories.filter(c => c.user_id !== id)
    sessionData.expenses = sessionData.expenses.filter(e => e.user_id !== id)
    sessionData.revenues = sessionData.revenues.filter(r => r.user_id !== id)
    sessionData.mortality_events = sessionData.mortality_events.filter(m => m.user_id !== id)
    
    // Sauvegarder les modifications
    saveData(sessionData)
    
    console.log('✅ Utilisateur supprimé JSON')
    return { message: 'Utilisateur supprimé' }
  }
}

// =====================================================
// DONNÉES DE FERME
// =====================================================

const farmDataApi = {
  async get(userId) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('🏡 Récupération données ferme JSON:', targetUserId)
    
    const farmData = sessionData.farm_data.find(f => f.user_id === targetUserId)
    return farmData || { user_id: targetUserId, total_chickens: 0 }
  },

  async updateChickens(userId, totalChickens) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('🐔 Mise à jour poulets JSON:', targetUserId, totalChickens)
    
    const farmDataIndex = sessionData.farm_data.findIndex(f => f.user_id === targetUserId)
    
    if (farmDataIndex === -1) {
      // Créer les données de ferme si elles n'existent pas
      const newFarmData = {
        id: generateId('farm'),
        user_id: targetUserId,
        total_chickens: totalChickens,
        created_at: formatDate(new Date()),
        updated_at: formatDate(new Date())
      }
      sessionData.farm_data.push(newFarmData)
      saveData(sessionData)
      return newFarmData
    } else {
      // Mettre à jour les données existantes
      sessionData.farm_data[farmDataIndex] = {
        ...sessionData.farm_data[farmDataIndex],
        total_chickens: totalChickens,
        updated_at: formatDate(new Date())
      }
      saveData(sessionData)
      return sessionData.farm_data[farmDataIndex]
    }
  }
}

// =====================================================
// DÉPENSES
// =====================================================

const expensesApi = {
  async getAll(userId) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('💸 Récupération dépenses JSON:', targetUserId)
    
    const expenses = sessionData.expenses
      .filter(e => e.user_id === targetUserId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    return expenses
  },

  async create(expenseData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('💸 Création dépense JSON:', currentUser.id)
    
    // Calculer la prochaine échéance si récurrent
    let nextDueDate = null
    let isRecurring = expenseData.frequency !== 'ponctuel'
    
    if (isRecurring) {
      const currentDate = new Date(expenseData.date)
      switch (expenseData.frequency) {
        case 'quotidien':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'hebdomadaire':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'bimensuel':
          currentDate.setDate(currentDate.getDate() + 14)
          break
        case 'mensuel':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'trimestriel':
          currentDate.setMonth(currentDate.getMonth() + 3)
          break
        case 'annuel':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
      }
      nextDueDate = currentDate.toISOString().split('T')[0]
    }
    
    const newExpense = {
      id: generateId('exp'),
      user_id: currentUser.id,
      date: expenseData.date,
      category: expenseData.category,
      description: expenseData.description,
      amount: parseInt(expenseData.amount),
      frequency: expenseData.frequency,
      next_due_date: nextDueDate,
      is_recurring: isRecurring,
      created_at: formatDate(new Date())
    }
    
    sessionData.expenses.push(newExpense)
    saveData(sessionData)
    
    console.log('✅ Dépense créée JSON:', newExpense.description)
    return newExpense
  },

  async update(id, expenseData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('✏️ Mise à jour dépense JSON:', id)
    
    const expenseIndex = sessionData.expenses.findIndex(e => e.id === id)
    if (expenseIndex === -1) {
      throw new Error('Dépense non trouvée')
    }
    
    const expense = sessionData.expenses[expenseIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && expense.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    // Calculer la prochaine échéance si récurrent
    let nextDueDate = null
    let isRecurring = expenseData.frequency !== 'ponctuel'
    
    if (isRecurring) {
      const currentDate = new Date(expenseData.date)
      switch (expenseData.frequency) {
        case 'quotidien':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'hebdomadaire':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'bimensuel':
          currentDate.setDate(currentDate.getDate() + 14)
          break
        case 'mensuel':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'trimestriel':
          currentDate.setMonth(currentDate.getMonth() + 3)
          break
        case 'annuel':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
      }
      nextDueDate = currentDate.toISOString().split('T')[0]
    }
    
    // Mettre à jour la dépense
    sessionData.expenses[expenseIndex] = {
      ...expense,
      date: expenseData.date,
      category: expenseData.category,
      description: expenseData.description,
      amount: parseInt(expenseData.amount),
      frequency: expenseData.frequency,
      next_due_date: nextDueDate,
      is_recurring: isRecurring,
      updated_at: formatDate(new Date())
    }
    
    saveData(sessionData)
    
    console.log('✅ Dépense mise à jour JSON:', expenseData.description)
    return sessionData.expenses[expenseIndex]
  },

  async delete(id) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('🗑️ Suppression dépense JSON:', id)
    
    const expenseIndex = sessionData.expenses.findIndex(e => e.id === id)
    if (expenseIndex === -1) {
      throw new Error('Dépense non trouvée')
    }
    
    const expense = sessionData.expenses[expenseIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && expense.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    sessionData.expenses.splice(expenseIndex, 1)
    saveData(sessionData)
    
    console.log('✅ Dépense supprimée JSON')
    return { message: 'Dépense supprimée' }
  }
}

// =====================================================
// REVENUS
// =====================================================

const revenuesApi = {
  async getAll(userId) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('💰 Récupération revenus JSON:', targetUserId)
    
    const revenues = sessionData.revenues
      .filter(r => r.user_id === targetUserId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    return revenues
  },

  async create(revenueData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('💰 Création revenu JSON:', currentUser.id)
    
    const totalAmount = parseInt(revenueData.quantity) * parseInt(revenueData.unit_price)
    
    const newRevenue = {
      id: generateId('rev'),
      user_id: currentUser.id,
      date: revenueData.date,
      type: revenueData.type,
      description: revenueData.description,
      quantity: parseInt(revenueData.quantity),
      unit_price: parseInt(revenueData.unit_price),
      total_amount: totalAmount,
      created_at: formatDate(new Date())
    }
    
    sessionData.revenues.push(newRevenue)
    saveData(sessionData)
    
    console.log('✅ Revenu créé JSON:', newRevenue.description)
    return newRevenue
  },

  async update(id, revenueData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('✏️ Mise à jour revenu JSON:', id)
    
    const revenueIndex = sessionData.revenues.findIndex(r => r.id === id)
    if (revenueIndex === -1) {
      throw new Error('Revenu non trouvé')
    }
    
    const revenue = sessionData.revenues[revenueIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && revenue.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    const totalAmount = parseInt(revenueData.quantity) * parseInt(revenueData.unit_price)
    
    // Mettre à jour le revenu
    sessionData.revenues[revenueIndex] = {
      ...revenue,
      date: revenueData.date,
      type: revenueData.type,
      description: revenueData.description,
      quantity: parseInt(revenueData.quantity),
      unit_price: parseInt(revenueData.unit_price),
      total_amount: totalAmount,
      updated_at: formatDate(new Date())
    }
    
    saveData(sessionData)
    
    console.log('✅ Revenu mis à jour JSON:', revenueData.description)
    return sessionData.revenues[revenueIndex]
  },

  async delete(id) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('🗑️ Suppression revenu JSON:', id)
    
    const revenueIndex = sessionData.revenues.findIndex(r => r.id === id)
    if (revenueIndex === -1) {
      throw new Error('Revenu non trouvé')
    }
    
    const revenue = sessionData.revenues[revenueIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && revenue.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    sessionData.revenues.splice(revenueIndex, 1)
    saveData(sessionData)
    
    console.log('✅ Revenu supprimé JSON')
    return { message: 'Revenu supprimé' }
  }
}

// =====================================================
// MORTALITÉ
// =====================================================

const mortalityApi = {
  async getAll(userId) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('☠️ Récupération mortalité JSON:', targetUserId)
    
    const mortality = sessionData.mortality_events
      .filter(m => m.user_id === targetUserId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    return mortality
  },

  async create(mortalityData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('☠️ Création événement mortalité JSON:', currentUser.id)
    
    const newMortality = {
      id: generateId('mort'),
      user_id: currentUser.id,
      date: mortalityData.date,
      cause: mortalityData.cause,
      count: parseInt(mortalityData.count),
      description: mortalityData.description,
      estimated_loss: parseInt(mortalityData.estimated_loss),
      created_at: formatDate(new Date())
    }
    
    sessionData.mortality_events.push(newMortality)
    saveData(sessionData)
    
    console.log('✅ Événement mortalité créé JSON:', newMortality.description)
    return newMortality
  },

  async update(id, mortalityData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('✏️ Mise à jour mortalité JSON:', id)
    
    const mortalityIndex = sessionData.mortality_events.findIndex(m => m.id === id)
    if (mortalityIndex === -1) {
      throw new Error('Événement non trouvé')
    }
    
    const mortality = sessionData.mortality_events[mortalityIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && mortality.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    // Mettre à jour l'événement de mortalité
    sessionData.mortality_events[mortalityIndex] = {
      ...mortality,
      date: mortalityData.date,
      cause: mortalityData.cause,
      count: parseInt(mortalityData.count),
      description: mortalityData.description,
      estimated_loss: parseInt(mortalityData.estimated_loss),
      updated_at: formatDate(new Date())
    }
    
    saveData(sessionData)
    
    console.log('✅ Événement mortalité mis à jour JSON:', mortalityData.description)
    return sessionData.mortality_events[mortalityIndex]
  },

  async delete(id) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('🗑️ Suppression mortalité JSON:', id)
    
    const mortalityIndex = sessionData.mortality_events.findIndex(m => m.id === id)
    if (mortalityIndex === -1) {
      throw new Error('Événement non trouvé')
    }
    
    const mortality = sessionData.mortality_events[mortalityIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && mortality.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    sessionData.mortality_events.splice(mortalityIndex, 1)
    saveData(sessionData)
    
    console.log('✅ Événement mortalité supprimé JSON')
    return { message: 'Événement supprimé' }
  }
}

// =====================================================
// CATÉGORIES DE DÉPENSES
// =====================================================

const categoriesApi = {
  async getAll(userId) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('🏷️ Récupération catégories JSON:', targetUserId)
    
    const categories = sessionData.expense_categories
      .filter(c => c.user_id === targetUserId)
      .sort((a, b) => a.name.localeCompare(b.name))
    
    return categories
  },

  async create(categoryData) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('🏷️ Création catégorie JSON:', currentUser.id)
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = sessionData.expense_categories.find(
      c => c.user_id === currentUser.id && c.name === categoryData.name
    )
    
    if (existingCategory) {
      throw new Error('Une catégorie avec ce nom existe déjà')
    }
    
    const newCategory = {
      id: generateId('cat'),
      user_id: currentUser.id,
      name: categoryData.name,
      color: categoryData.color,
      is_default: false,
      created_at: formatDate(new Date())
    }
    
    sessionData.expense_categories.push(newCategory)
    saveData(sessionData)
    
    console.log('✅ Catégorie créée JSON:', newCategory.name)
    return newCategory
  },

  async delete(id) {
    await delay()
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log('🗑️ Suppression catégorie JSON:', id)
    
    const categoryIndex = sessionData.expense_categories.findIndex(c => c.id === id)
    if (categoryIndex === -1) {
      throw new Error('Catégorie non trouvée')
    }
    
    const category = sessionData.expense_categories[categoryIndex]
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && category.user_id !== currentUser.id) {
      throw new Error('Accès non autorisé')
    }
    
    if (category.is_default) {
      throw new Error('Impossible de supprimer une catégorie par défaut')
    }
    
    sessionData.expense_categories.splice(categoryIndex, 1)
    saveData(sessionData)
    
    console.log('✅ Catégorie supprimée JSON')
    return { message: 'Catégorie supprimée' }
  }
}

// =====================================================
// DASHBOARD & STATISTIQUES
// =====================================================

const dashboardApi = {
  async getData(userId) {
    await delay()
    
    const targetUserId = userId || currentUser?.id
    if (!targetUserId) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Vérifier les permissions
    if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
      throw new Error('Accès non autorisé')
    }
    
    console.log('📊 Récupération données dashboard JSON:', targetUserId)
    
    // Récupérer toutes les données
    const farmData = await farmDataApi.get(targetUserId)
    const expenses = await expensesApi.getAll(targetUserId)
    const revenues = await revenuesApi.getAll(targetUserId)
    const mortality = await mortalityApi.getAll(targetUserId)
    const categories = await categoriesApi.getAll(targetUserId)

    // Calculer les statistiques
    const totalRevenue = revenues.reduce((sum, r) => sum + (r.total_amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const totalMortalityLoss = mortality.reduce((sum, m) => sum + (m.estimated_loss || 0), 0)
    const netProfit = totalRevenue - totalExpenses - totalMortalityLoss
    const reinvestmentAmount = netProfit > 0 ? netProfit * 0.7 : 0
    const totalMortality = mortality.reduce((sum, m) => sum + (m.count || 0), 0)
    const mortalityRate = farmData.total_chickens > 0 ? (totalMortality / farmData.total_chickens) * 100 : 0

    // Calculer les finances mensuelles
    const monthlyFinancials = this.calculateMonthlyFinancials(expenses, revenues)

    const result = {
      farmData: {
        totalChickens: farmData.total_chickens || 0,
        expenses,
        revenue: revenues,
        mortality,
        expenseCategories: categories
      },
      statistics: {
        totalRevenue,
        totalExpenses,
        totalMortalityLoss,
        netProfit,
        reinvestmentAmount,
        mortalityRate
      },
      monthlyFinancials
    }

    console.log('✅ Dashboard data calculé JSON:', result.statistics)
    return result
  },

  calculateMonthlyFinancials(expenses, revenues) {
    const monthlyData = {}

    // Traiter les revenus
    revenues.forEach(revenue => {
      const monthKey = revenue.date.substring(0, 7) // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalRevenue: 0, totalExpenses: 0 }
      }
      monthlyData[monthKey].totalRevenue += revenue.total_amount || 0
    })

    // Traiter les dépenses
    expenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7) // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalRevenue: 0, totalExpenses: 0 }
      }
      monthlyData[monthKey].totalExpenses += expense.amount || 0
    })

    // Convertir en tableau et trier
    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        totalRevenue: data.totalRevenue,
        totalExpenses: data.totalExpenses,
        netIncome: data.totalRevenue - data.totalExpenses
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6)

    return result
  }
}

// =====================================================
// IMPORT/EXPORT CSV
// =====================================================

const csvApi = {
  async exportUserData(userId) {
    await delay()
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Accès non autorisé')
    }
    
    console.log('📤 Export CSV JSON pour utilisateur:', userId)
    
    const data = await dashboardApi.getData(userId)
    
    // Récupérer les infos utilisateur
    const user = sessionData.users.find(u => u.id === userId)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    const { password, ...userWithoutPassword } = user
    
    const result = {
      user: userWithoutPassword,
      totalChickens: data.farmData.totalChickens,
      expenses: data.farmData.expenses,
      revenues: data.farmData.revenue,
      mortality: data.farmData.mortality,
      monthlyFinancials: data.monthlyFinancials
    }
    
    console.log('✅ Données export préparées JSON:', {
      user: user.name,
      totalChickens: result.totalChickens,
      expenses: result.expenses.length,
      revenues: result.revenues.length,
      mortality: result.mortality.length
    })
    
    return result
  },

  async importUserData(userId, csvData) {
    await delay()
    
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Accès non autorisé')
    }
    
    console.log('📥 Import CSV JSON pour utilisateur:', userId, csvData)
    
    // Supprimer toutes les données existantes de l'utilisateur
    console.log('🗑️ Suppression données existantes...')
    sessionData.expenses = sessionData.expenses.filter(e => e.user_id !== userId)
    sessionData.revenues = sessionData.revenues.filter(r => r.user_id !== userId)
    sessionData.mortality_events = sessionData.mortality_events.filter(m => m.user_id !== userId)

    // Mettre à jour le nombre de poulets
    if (csvData.totalChickens !== undefined) {
      console.log('🐔 Mise à jour nombre de poulets:', csvData.totalChickens)
      await farmDataApi.updateChickens(userId, csvData.totalChickens)
    }

    // Insérer les nouvelles données
    if (csvData.expenses && csvData.expenses.length > 0) {
      console.log('💸 Import', csvData.expenses.length, 'dépenses...')
      csvData.expenses.forEach(expense => {
        sessionData.expenses.push({
          id: generateId('exp'),
          user_id: userId,
          ...expense,
          created_at: formatDate(new Date())
        })
      })
    }

    if (csvData.revenues && csvData.revenues.length > 0) {
      console.log('💰 Import', csvData.revenues.length, 'revenus...')
      csvData.revenues.forEach(revenue => {
        sessionData.revenues.push({
          id: generateId('rev'),
          user_id: userId,
          ...revenue,
          created_at: formatDate(new Date())
        })
      })
    }

    if (csvData.mortality && csvData.mortality.length > 0) {
      console.log('☠️ Import', csvData.mortality.length, 'événements mortalité...')
      csvData.mortality.forEach(mortality => {
        sessionData.mortality_events.push({
          id: generateId('mort'),
          user_id: userId,
          ...mortality,
          created_at: formatDate(new Date())
        })
      })
    }
    
    // Sauvegarder toutes les modifications
    saveData(sessionData)
    
    console.log('✅ Import terminé avec succès JSON')
    return { message: 'Données importées avec succès' }
  }
}

// =====================================================
// EXPORT DE L'API COMPLÈTE
// =====================================================

export const jsonApi = {
  auth: authApi,
  users: usersApi,
  farmData: farmDataApi,
  expenses: expensesApi,
  revenues: revenuesApi,
  mortality: mortalityApi,
  categories: categoriesApi,
  dashboard: dashboardApi,
  csv: csvApi
}

export default jsonApi