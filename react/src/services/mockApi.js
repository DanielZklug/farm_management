import { 
  mockUser, 
  mockDashboardData, 
  mockExpenseCategories,
  mockUsers,
  userRevenueData,
  userExpenseData,
  userMortalityData,
  getUserData,
  calculateUserStatistics
} from './mockData'

// Simulation d'un délai réseau
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Stockage local pour simuler la persistance
let localUsers = [...mockUsers]
let localUserRevenueData = { ...userRevenueData }
let localUserExpenseData = { ...userExpenseData }
let localUserMortalityData = { ...userMortalityData }
let localCategories = [...mockExpenseCategories]
let nextId = 100

export const mockApi = {
  // Authentification
  async login(email, password) {
    await delay()
    const user = localUsers.find(u => u.email === email)
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect')
    }
    
    if (user.status === 'blocked') {
      throw new Error('Votre compte a été bloqué. Contactez l\'administrateur.')
    }
    
    if (user.status === 'pending') {
      throw new Error('Votre compte est en attente d\'activation.')
    }
    
    if (email === 'admin@ferme.com' && password === 'ferme2024') {
      return {
        data: {
          user,
          token: 'mock-token-123',
          message: 'Connexion réussie'
        }
      }
    }
    
    // Pour les autres utilisateurs, accepter n'importe quel mot de passe en mode démo
    if (password === 'demo123') {
      return {
        data: {
          user,
          token: 'mock-token-123',
          message: 'Connexion réussie'
        }
      }
    }
    
    throw new Error('Email ou mot de passe incorrect')
  },

  async register(userData) {
    await delay()
    
    // Vérifier si l'email existe déjà
    const existingUser = localUsers.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé')
    }
    
    const newUser = {
      id: nextId++,
      ...userData,
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString()
    }
    
    localUsers.push(newUser)
    
    // Initialiser les données vides pour le nouvel utilisateur
    localUserRevenueData[newUser.id] = []
    localUserExpenseData[newUser.id] = []
    localUserMortalityData[newUser.id] = []
    
    return {
      data: {
        user: newUser,
        token: 'mock-token-123',
        message: 'Inscription réussie'
      }
    }
  },

  async logout() {
    await delay()
    return { data: { message: 'Déconnexion réussie' } }
  },

  async getUser() {
    await delay()
    return { data: mockUser }
  },

  // Gestion des utilisateurs (Admin)
  async getUsers() {
    await delay()
    return { data: localUsers }
  },

  async createUser(userData) {
    await delay()
    
    // Vérifier si l'email existe déjà
    const existingUser = localUsers.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé')
    }
    
    const newUser = {
      id: nextId++,
      ...userData,
      created_at: new Date().toISOString()
    }
    
    localUsers.push(newUser)
    
    // Initialiser les données vides pour le nouvel utilisateur
    localUserRevenueData[newUser.id] = []
    localUserExpenseData[newUser.id] = []
    localUserMortalityData[newUser.id] = []
    
    return { data: newUser }
  },

  async updateUser(id, userData) {
    await delay()
    
    const userIndex = localUsers.findIndex(u => u.id === parseInt(id))
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    if (userData.email) {
      const existingUser = localUsers.find(u => u.email === userData.email && u.id !== parseInt(id))
      if (existingUser) {
        throw new Error('Cet email est déjà utilisé')
      }
    }
    
    // Mettre à jour l'utilisateur (exclure le mot de passe vide)
    const updatedData = { ...userData }
    if (!updatedData.password) {
      delete updatedData.password
    }
    
    localUsers[userIndex] = { ...localUsers[userIndex], ...updatedData }
    return { data: localUsers[userIndex] }
  },

  async deleteUser(id) {
    await delay()
    
    const userIndex = localUsers.findIndex(u => u.id === parseInt(id))
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Empêcher la suppression du dernier admin
    const user = localUsers[userIndex]
    if (user.role === 'admin') {
      const adminCount = localUsers.filter(u => u.role === 'admin').length
      if (adminCount <= 1) {
        throw new Error('Impossible de supprimer le dernier administrateur')
      }
    }
    
    // Supprimer les données associées
    delete localUserRevenueData[parseInt(id)]
    delete localUserExpenseData[parseInt(id)]
    delete localUserMortalityData[parseInt(id)]
    
    localUsers.splice(userIndex, 1)
    return { data: { message: 'Utilisateur supprimé' } }
  },

  // Dashboard avec sélection d'utilisateur
  async getDashboard(userId = 1) {
    await delay()
    
    const userData = getUserData(userId)
    const statistics = calculateUserStatistics(userId)
    
    return {
      data: {
        farmData: {
          totalChickens: 500,
          expenses: userData.expenses,
          revenue: userData.revenues,
          mortality: userData.mortality,
          expenseCategories: userData.expenseCategories
        },
        statistics,
        monthlyFinancials: mockDashboardData.monthlyFinancials,
        selectedUser: userData.user
      }
    }
  },

  // Dépenses par utilisateur
  async getExpenses(userId = 1) {
    await delay()
    return { data: localUserExpenseData[userId] || [] }
  },

  async createExpense(expenseData, userId = 1) {
    await delay()
    const newExpense = {
      id: nextId++,
      ...expenseData,
      amount: parseFloat(expenseData.amount)
    }
    
    if (!localUserExpenseData[userId]) {
      localUserExpenseData[userId] = []
    }
    
    localUserExpenseData[userId].unshift(newExpense)
    return { data: newExpense }
  },

  async deleteExpense(id, userId = 1) {
    await delay()
    if (localUserExpenseData[userId]) {
      localUserExpenseData[userId] = localUserExpenseData[userId].filter(expense => expense.id !== parseInt(id))
    }
    return { data: { message: 'Dépense supprimée' } }
  },

  // Revenus par utilisateur
  async getRevenues(userId = 1) {
    await delay()
    return { data: localUserRevenueData[userId] || [] }
  },

  async createRevenue(revenueData, userId = 1) {
    await delay()
    const totalAmount = parseFloat(revenueData.quantity) * parseFloat(revenueData.unit_price)
    const newRevenue = {
      id: nextId++,
      ...revenueData,
      quantity: parseFloat(revenueData.quantity),
      unit_price: parseFloat(revenueData.unit_price),
      total_amount: totalAmount
    }
    
    if (!localUserRevenueData[userId]) {
      localUserRevenueData[userId] = []
    }
    
    localUserRevenueData[userId].unshift(newRevenue)
    return { data: newRevenue }
  },

  async deleteRevenue(id, userId = 1) {
    await delay()
    if (localUserRevenueData[userId]) {
      localUserRevenueData[userId] = localUserRevenueData[userId].filter(revenue => revenue.id !== parseInt(id))
    }
    return { data: { message: 'Revenu supprimé' } }
  },

  // Mortalité par utilisateur
  async getMortality(userId = 1) {
    await delay()
    return { data: localUserMortalityData[userId] || [] }
  },

  async createMortality(mortalityData, userId = 1) {
    await delay()
    const newMortality = {
      id: nextId++,
      ...mortalityData,
      count: parseInt(mortalityData.count),
      estimated_loss: parseFloat(mortalityData.estimated_loss)
    }
    
    if (!localUserMortalityData[userId]) {
      localUserMortalityData[userId] = []
    }
    
    localUserMortalityData[userId].unshift(newMortality)
    return { data: newMortality }
  },

  async deleteMortality(id, userId = 1) {
    await delay()
    if (localUserMortalityData[userId]) {
      localUserMortalityData[userId] = localUserMortalityData[userId].filter(mortality => mortality.id !== parseInt(id))
    }
    return { data: { message: 'Événement de mortalité supprimé' } }
  },

  // Catégories
  async getExpenseCategories() {
    await delay()
    return { data: localCategories }
  },

  async createExpenseCategory(categoryData) {
    await delay()
    const newCategory = {
      id: nextId++,
      ...categoryData,
      is_default: false
    }
    localCategories.push(newCategory)
    return { data: newCategory }
  },

  async deleteExpenseCategory(id) {
    await delay()
    const category = localCategories.find(cat => cat.id === parseInt(id))
    if (category?.is_default) {
      throw new Error('Impossible de supprimer une catégorie par défaut')
    }
    localCategories = localCategories.filter(category => category.id !== parseInt(id))
    return { data: { message: 'Catégorie supprimée' } }
  }
}