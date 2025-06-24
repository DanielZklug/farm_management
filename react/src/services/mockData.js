// Données simulées pour le mode démo avec devise FCFA
export const mockUser = {
  id: 1,
  name: 'Jean Dupont',
  email: 'admin@ferme.com',
  farm_name: 'Ferme de Démonstration',
  role: 'admin'
}

export const mockExpenseCategories = [
  { id: 1, name: 'Alimentation', color: 'bg-amber-100 text-amber-800', is_default: true },
  { id: 2, name: 'Médicaments', color: 'bg-red-100 text-red-800', is_default: true },
  { id: 3, name: 'Équipement', color: 'bg-blue-100 text-blue-800', is_default: true },
  { id: 4, name: 'Main-d\'œuvre', color: 'bg-purple-100 text-purple-800', is_default: true },
  { id: 5, name: 'Services publics', color: 'bg-green-100 text-green-800', is_default: true },
  { id: 6, name: 'Marketing', color: 'bg-pink-100 text-pink-800', is_default: true },
  { id: 7, name: 'Autre', color: 'bg-gray-100 text-gray-800', is_default: true }
]

// Données par utilisateur - Revenus en FCFA
export const userRevenueData = {
  1: [ // Jean Dupont - Admin
    {
      id: 1,
      date: '2024-01-20',
      type: 'oeufs',
      description: 'Vente œufs frais marché local',
      quantity: 500,
      unit_price: 230, // FCFA
      total_amount: 115000
    },
    {
      id: 2,
      date: '2024-01-18',
      type: 'poulets',
      description: 'Vente poulets fermiers',
      quantity: 25,
      unit_price: 12150, // FCFA
      total_amount: 303750
    },
    {
      id: 3,
      date: '2024-01-15',
      type: 'oeufs',
      description: 'Commande restaurant Le Coq d\'Or',
      quantity: 300,
      unit_price: 262, // FCFA
      total_amount: 78600
    },
    {
      id: 4,
      date: '2024-01-12',
      type: 'subventions',
      description: 'Aide régionale agriculture bio',
      quantity: 1,
      unit_price: 787200, // FCFA
      total_amount: 787200
    }
  ],
  2: [ // Marie Martin - Manager
    {
      id: 5,
      date: '2024-01-22',
      type: 'oeufs',
      description: 'Vente œufs bio marché fermier',
      quantity: 400,
      unit_price: 295, // FCFA
      total_amount: 118000
    },
    {
      id: 6,
      date: '2024-01-19',
      type: 'poulets',
      description: 'Poulets bio label rouge',
      quantity: 15,
      unit_price: 16400, // FCFA
      total_amount: 246000
    },
    {
      id: 7,
      date: '2024-01-16',
      type: 'aides-agricoles',
      description: 'Prime conversion bio',
      quantity: 1,
      unit_price: 524800, // FCFA
      total_amount: 524800
    }
  ],
  3: [ // Pierre Durand - User
    {
      id: 8,
      date: '2024-01-21',
      type: 'oeufs',
      description: 'Vente directe ferme',
      quantity: 200,
      unit_price: 262, // FCFA
      total_amount: 52400
    },
    {
      id: 9,
      date: '2024-01-17',
      type: 'poulets',
      description: 'Vente poulets standard',
      quantity: 20,
      unit_price: 9840, // FCFA
      total_amount: 196800
    }
  ],
  4: [ // Sophie Bernard - User (bloquée)
    {
      id: 10,
      date: '2024-01-14',
      type: 'oeufs',
      description: 'Vente œufs plein air',
      quantity: 150,
      unit_price: 246, // FCFA
      total_amount: 36900
    }
  ],
  5: [ // Lucas Petit - User (en attente)
    {
      id: 11,
      date: '2024-01-13',
      type: 'oeufs',
      description: 'Première vente test',
      quantity: 100,
      unit_price: 230, // FCFA
      total_amount: 23000
    }
  ]
}

// Données par utilisateur - Dépenses en FCFA
export const userExpenseData = {
  1: [ // Jean Dupont
    {
      id: 1,
      date: '2024-01-15',
      category: 'Alimentation',
      description: 'Achat de grains pour poulets',
      amount: 295200, // FCFA
      frequency: 'mensuel',
      is_recurring: true
    },
    {
      id: 2,
      date: '2024-01-10',
      category: 'Médicaments',
      description: 'Vaccins et antibiotiques',
      amount: 82320, // FCFA
      frequency: 'ponctuel',
      is_recurring: false
    },
    {
      id: 3,
      date: '2024-01-08',
      category: 'Équipement',
      description: 'Réparation abreuvoir automatique',
      amount: 55760, // FCFA
      frequency: 'ponctuel',
      is_recurring: false
    }
  ],
  2: [ // Marie Martin
    {
      id: 4,
      date: '2024-01-16',
      category: 'Alimentation',
      description: 'Grains bio certifiés',
      amount: 393600, // FCFA
      frequency: 'mensuel',
      is_recurring: true
    },
    {
      id: 5,
      date: '2024-01-12',
      category: 'Médicaments',
      description: 'Traitements préventifs bio',
      amount: 98400, // FCFA
      frequency: 'trimestriel',
      is_recurring: true
    }
  ],
  3: [ // Pierre Durand
    {
      id: 6,
      date: '2024-01-18',
      category: 'Alimentation',
      description: 'Aliments standard poulets',
      amount: 196800, // FCFA
      frequency: 'mensuel',
      is_recurring: true
    }
  ],
  4: [ // Sophie Bernard
    {
      id: 7,
      date: '2024-01-11',
      category: 'Alimentation',
      description: 'Grains plein air',
      amount: 147600, // FCFA
      frequency: 'mensuel',
      is_recurring: true
    }
  ],
  5: [ // Lucas Petit
    {
      id: 8,
      date: '2024-01-09',
      category: 'Équipement',
      description: 'Matériel de démarrage',
      amount: 131200, // FCFA
      frequency: 'ponctuel',
      is_recurring: false
    }
  ]
}

// Données par utilisateur - Mortalité en FCFA
export const userMortalityData = {
  1: [ // Jean Dupont
    {
      id: 1,
      date: '2024-01-16',
      cause: 'maladie',
      count: 3,
      description: 'Grippe aviaire détectée, isolement immédiat',
      estimated_loss: 36450 // FCFA
    },
    {
      id: 2,
      date: '2024-01-12',
      cause: 'predateur',
      description: 'Attaque de renard pendant la nuit',
      count: 2,
      estimated_loss: 24280 // FCFA
    }
  ],
  2: [ // Marie Martin
    {
      id: 3,
      date: '2024-01-14',
      cause: 'naturel',
      description: 'Mort naturelle poule âgée',
      count: 1,
      estimated_loss: 16400 // FCFA
    }
  ],
  3: [ // Pierre Durand
    {
      id: 4,
      date: '2024-01-10',
      cause: 'accident',
      description: 'Poule coincée dans le grillage',
      count: 1,
      estimated_loss: 9840 // FCFA
    }
  ],
  4: [], // Sophie Bernard - pas de mortalité
  5: [] // Lucas Petit - pas de mortalité
}

export const mockUsers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'admin@ferme.com',
    farm_name: 'Ferme de Démonstration',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie@ferme-bio.com',
    farm_name: 'Ferme Bio Martin',
    role: 'manager',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 3,
    name: 'Pierre Durand',
    email: 'pierre@elevage-durand.fr',
    farm_name: 'Élevage Durand',
    role: 'user',
    status: 'active',
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Sophie Bernard',
    email: 'sophie@ferme-bernard.com',
    farm_name: 'Ferme Bernard & Fils',
    role: 'user',
    status: 'blocked',
    created_at: '2024-02-10T00:00:00Z'
  },
  {
    id: 5,
    name: 'Lucas Petit',
    email: 'lucas@aviculture-petit.fr',
    farm_name: 'Aviculture Petit',
    role: 'user',
    status: 'pending',
    created_at: '2024-02-20T00:00:00Z'
  }
]

// Fonction pour obtenir les données d'un utilisateur spécifique
export const getUserData = (userId) => {
  const user = mockUsers.find(u => u.id === userId)
  const expenses = userExpenseData[userId] || []
  const revenues = userRevenueData[userId] || []
  const mortality = userMortalityData[userId] || []
  
  return {
    user,
    expenses,
    revenues,
    mortality,
    expenseCategories: mockExpenseCategories
  }
}

// Fonction pour calculer les statistiques d'un utilisateur
export const calculateUserStatistics = (userId) => {
  const { expenses, revenues, mortality } = getUserData(userId)
  
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.total_amount, 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalMortalityLoss = mortality.reduce((sum, mort) => sum + mort.estimated_loss, 0)
  const netProfit = totalRevenue - totalExpenses - totalMortalityLoss
  const reinvestmentAmount = netProfit > 0 ? netProfit * 0.7 : 0
  const totalMortality = mortality.reduce((sum, mort) => sum + mort.count, 0)
  const totalChickens = 500 // Valeur par défaut
  const mortalityRate = totalChickens > 0 ? (totalMortality / totalChickens) * 100 : 0

  return {
    totalRevenue,
    totalExpenses,
    totalMortalityLoss,
    netProfit,
    reinvestmentAmount,
    mortalityRate
  }
}

// Données par défaut (Jean Dupont)
export const mockExpenses = userExpenseData[1] || []
export const mockRevenues = userRevenueData[1] || []
export const mockMortalityEvents = userMortalityData[1] || []

export const mockFarmData = {
  totalChickens: 500,
  expenses: mockExpenses,
  revenue: mockRevenues,
  mortality: mockMortalityEvents,
  expenseCategories: mockExpenseCategories
}

export const mockStatistics = calculateUserStatistics(1)

export const mockMonthlyFinancials = [
  {
    month: '2024-01',
    totalRevenue: 1344550, // FCFA
    totalExpenses: 1076880, // FCFA
    netIncome: 267670 // FCFA
  },
  {
    month: '2023-12',
    totalRevenue: 1214000, // FCFA
    totalExpenses: 997120, // FCFA
    netIncome: 216880 // FCFA
  },
  {
    month: '2023-11',
    totalRevenue: 1260480, // FCFA
    totalExpenses: 971520, // FCFA
    netIncome: 288960 // FCFA
  },
  {
    month: '2023-10',
    totalRevenue: 1378000, // FCFA
    totalExpenses: 1049600, // FCFA
    netIncome: 328400 // FCFA
  },
  {
    month: '2023-09',
    totalRevenue: 1168080, // FCFA
    totalExpenses: 951200, // FCFA
    netIncome: 216880 // FCFA
  },
  {
    month: '2023-08',
    totalRevenue: 1476000, // FCFA
    totalExpenses: 1115200, // FCFA
    netIncome: 360800 // FCFA
  }
]

export const mockDashboardData = {
  farmData: mockFarmData,
  statistics: mockStatistics,
  monthlyFinancials: mockMonthlyFinancials
}