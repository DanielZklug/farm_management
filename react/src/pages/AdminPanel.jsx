import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Edit, 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Crown,
  Mail,
  Calendar,
  Filter,
  Download,
  Upload,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  Info,
  Egg
} from 'lucide-react'
import api from '../services/api'

const userRoles = [
  { value: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-800' },
  { value: 'manager', label: 'Gestionnaire', color: 'bg-blue-100 text-blue-800' },
  { value: 'user', label: 'Utilisateur', color: 'bg-green-100 text-green-800' }
]

const userStatuses = [
  { value: 'active', label: 'Actif', color: 'bg-green-100 text-green-800' },
  { value: 'blocked', label: 'Bloqué', color: 'bg-red-100 text-red-800' },
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' }
]

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [checkingData, setCheckingData] = useState(false)
  const [userDataInfo, setUserDataInfo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farm_name: '',
    role: 'user',
    status: 'active'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  // Vérifier les données d'un utilisateur quand il est sélectionné
  useEffect(() => {
    if (selectedUserId) {
      checkUserData()
    } else {
      setUserDataInfo(null)
    }
  }, [selectedUserId])

  const fetchUsers = async () => {
  try {
    const response = await api.get('/users')
    let data = []

    // Cas pagination Laravel
    if (Array.isArray(response.data.data)) {
      data = response.data.data
    }
    // Cas { users: [...] }
    else if (Array.isArray(response.data.users)) {
      data = response.data.users
    }
    // Cas tableau direct
    else if (Array.isArray(response.data)) {
      data = response.data
    }
    // Cas unique utilisateur (rare)
    else if (response.data && typeof response.data === 'object') {
      data = [response.data]
    }
    // Sinon, tableau vide
    else {
      data = []
    }

    setUsers(data)
  } catch (error) {
    toast.error('Erreur lors du chargement des utilisateurs')
    setUsers([])
    console.error(error)
  } finally {
    setLoading(false)
  }
}
  // Fonction pour vérifier les données d'un utilisateur
  const checkUserData = async () => {
    if (!selectedUserId) return
    
    setCheckingData(true)
    try {
      console.log('🔍 Vérification des données pour utilisateur:', selectedUserId)
      const response = await api.get(`/export-csv/${selectedUserId}`)
      const csvData = response.data
      console.log('📊 Informations données utilisateur:', csvData)

      const dataInfo = {
        totalChickens: csvData.farmData.totalChickens, // ✅ Inclure le total de poulets
        expenses: csvData.farmData.expenses.length,
        revenues: csvData.farmData.revenue.length,
        mortality: csvData.farmData.mortality.length,
        monthlyFinancials: csvData.monthlyFinancials.length,
        hasData: csvData.farmData.expenses.length > 0 || csvData.revenues.length > 0 || csvData.mortality.length > 0 || csvData.totalChickens > 0,
        user: csvData.user // ✅ Récupérer les infos de l'utilisateur
      }

      setUserDataInfo(dataInfo)
      console.log('📊 Informations données utilisateur:', dataInfo)
      
    } catch (error) {
      console.error('❌ Erreur vérification données:', error)
      setUserDataInfo({ hasData: false, totalChickens: 0, expenses: 0, revenues: 0, mortality: 0, monthlyFinancials: 0 })
    } finally {
      setCheckingData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData)
        toast.success('Utilisateur modifié avec succès')
      } else {
        await api.post('/users', formData)
        toast.success('Utilisateur créé avec succès')
      }
      
      setShowForm(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      farm_name: user.farm_name || '',
      role: user.role,
      status: user.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (id === 1) {
      toast.error('Impossible de supprimer l\'administrateur principal')
      return
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return
    
    try {
      await api.delete(`/users/${id}`)
      toast.success('Utilisateur supprimé')
      fetchUsers()
      
      // Reset la sélection si l'utilisateur supprimé était sélectionné
      if (selectedUserId == id) {
        setSelectedUserId('')
        setUserDataInfo(null)
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  // Frontend simplifié
const handleToggleStatus = async (user) => {
    if (!confirm(`Confirmez le changement de statut`)) return;
    
    try {
        await api.patch(`/users/status/${user.id}/`);
        toast.success('Statut mis à jour');
        fetchUsers();
    } catch (error) {
        if (error.response?.status === 403) {
            toast.error('Action non autorisée');
        } else {
            toast.error('Erreur serveur');
        }
    }
}

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      farm_name: '',
      role: 'user',
      status: 'active'
    })
  }

  // Fonction pour télécharger le CSV d'un utilisateur
  const downloadUserCsv = async () => {
    if (!selectedUserId) {
      toast.error('Veuillez sélectionner un utilisateur')
      return
    }

    // Vérifier d'abord si l'utilisateur a des données
    if (userDataInfo && !userDataInfo.hasData) {
      const selectedUser = users.find(u => u.id == selectedUserId)
      const userName = selectedUser ? selectedUser.name : 'cet utilisateur'
      toast.error(`${userName} n'a pas encore de données à exporter. Il doit d'abord se connecter et saisir ses dépenses, revenus ou événements de mortalité.`)
      return
    }

    try {
      console.log('🔄 Début téléchargement CSV pour utilisateur:', selectedUserId)
      const response = await api.get(`/export-csv/${selectedUserId}`)
      const csvData = response.data

      console.log('📊 Données CSV reçues:', csvData)

      // ✅ Utiliser les informations de l'utilisateur spécifique
      const targetUser = csvData.user || users.find(u => u.id == selectedUserId)
      const userName = targetUser ? targetUser.name : 'utilisateur'
      const farmName = targetUser ? targetUser.farm_name : 'ferme'

      // Créer le contenu CSV avec encodage UTF-8
      let csvContent = '\uFEFF' // BOM pour UTF-8
      
      // ✅ En-tête avec informations de l'utilisateur ET total de poulets
      csvContent += `# DONNÉES DE FERME AVICOLE\n`
      csvContent += `# Utilisateur: ${userName}\n`
      csvContent += `# Ferme: ${farmName || 'Non spécifiée'}\n`
      csvContent += `# Email: ${targetUser ? targetUser.email : 'Non spécifié'}\n`
      csvContent += `# Total de poulets: ${csvData.farmData.totalChickens}\n` // ✅ Ajout du total de poulets
      csvContent += `# Date d'export: ${new Date().toLocaleDateString('fr-FR')}\n`
      csvContent += `# \n`
      
      // ✅ Ligne spéciale pour le total de poulets (pour faciliter l'import)
      csvContent += `TOTAL_CHICKENS,${csvData.totalChickens}\n`
      csvContent += `# \n`
      
      // En-têtes et données des dépenses
      csvContent += 'TYPE,DATE,CATEGORY,DESCRIPTION,AMOUNT,FREQUENCY\n'
      
      // Ajouter les dépenses
      csvData.farmData.expenses.forEach(expense => {
        const description = expense.description.replace(/"/g, '""') // Échapper les guillemets
        csvContent += `EXPENSE,${expense.date},${expense.category},"${description}",${expense.amount},${expense.frequency}\n`
      })
      
      // Ajouter les revenus
      csvData.farmData.revenue.forEach(revenue => {
        const description = revenue.description.replace(/"/g, '""')
        csvContent += `REVENUE,${revenue.date},${revenue.type},"${description}",${revenue.total_amount},${revenue.quantity}x${revenue.unit_price}\n`
      })
      
      // Ajouter les données de mortalité
      csvData.farmData.mortality.forEach(mortality => {
        const description = mortality.description.replace(/"/g, '""')
        csvContent += `MORTALITY,${mortality.date},${mortality.cause},"${description}",${mortality.estimated_loss},${mortality.count}\n`
      })
      
      // Ajouter les données financières mensuelles
      csvContent += '\nMONTHLY_FINANCIALS\n'
      csvContent += 'MONTH,REVENUES,EXPENSES,NET_INCOME,REINVESTMENT\n'
      csvData.monthlyFinancials.forEach(month => {
        const reinvestment = month.netIncome > 0 ? month.netIncome * 0.7 : 0
        csvContent += `${month.month},${month.totalRevenue},${month.totalExpenses},${month.netIncome},${reinvestment}\n`
      })

      console.log('📄 Contenu CSV généré:', csvContent.substring(0, 500) + '...')

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      // ✅ Nom de fichier avec le nom de l'utilisateur spécifique
      const cleanUserName = userName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
      const fileName = `ferme_${cleanUserName}_${new Date().toISOString().split('T')[0]}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`✅ CSV téléchargé pour ${userName}: ${fileName}`)
      console.log('✅ Téléchargement terminé:', fileName)
      
    } catch (error) {
      console.error('❌ Erreur téléchargement CSV:', error)
      toast.error('Erreur lors du téléchargement du CSV')
    }
  }

  // Fonction pour gérer la sélection du fichier
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
    console.log('📁 Fichier sélectionné:', file?.name)
  }

  // Fonction pour uploader et traiter le CSV
    const handleCsvImport = async () => {
  if (!selectedFile || !selectedUserId) {
    toast.error('Veuillez sélectionner un fichier et un utilisateur');
    return;
  }

  // Créez une copie stable du fichier pour l'upload
  const fileToUpload = new File([selectedFile], selectedFile.name, {
    type: selectedFile.type,
    lastModified: selectedFile.lastModified
  });

  const formData = new FormData();
  formData.append('csv_file', fileToUpload); // Utilisez la copie stable
  formData.append('user_id', selectedUserId);

  setUploadingCsv(true);

  try {
    const response = await api.post('/api/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success(response.data.message);
    // Réinitialiser le sélecteur de fichier
    setSelectedFile(null);
    document.getElementById('csv-upload').value = ''; // Réinitialise l'input file
  } catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.response?.data?.message || 'Échec de l\'importation');
  } finally {
    setUploadingCsv(false);
  }
};

  const getRoleLabel = (role) => {
    const roleObj = userRoles.find(r => r.value === role)
    return roleObj?.label || role
  }

  const getRoleColor = (role) => {
    const roleObj = userRoles.find(r => r.value === role)
    return roleObj?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const statusObj = userStatuses.find(s => s.value === status)
    return statusObj?.label || status
  }

  const getStatusColor = (status) => {
    const statusObj = userStatuses.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.farm_name && user.farm_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = !filterRole || user.role === filterRole
    const matchesStatus = !filterStatus || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    admins: users.filter(u => u.role === 'admin').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-600" />
            Panneau d'Administration
          </h1>
          <p className="text-gray-600">Gérez les utilisateurs et leurs données</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            resetForm()
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Section Import/Export CSV */}
      <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Gestion des données CSV</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export CSV */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Télécharger les données
            </h4>
            <div className="space-y-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field"
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.farm_name || 'Sans nom de ferme'}
                  </option>
                ))}
              </select>

              {/* Affichage des informations sur les données de l'utilisateur */}
              {selectedUserId && (
                <div className="space-y-2">
                  {checkingData ? (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Vérification des données...
                    </div>
                  ) : userDataInfo ? (
                    <div className={`p-3 rounded-lg border ${
                      userDataInfo.hasData 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        {userDataInfo.hasData ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          {userDataInfo.hasData ? (
                            <div>
                              <p className="font-medium mb-1">
                                ✅ Données disponibles pour {userDataInfo.user?.name || 'cet utilisateur'}
                              </p>
                              <div className="text-sm space-y-1">
                                <p className="flex items-center gap-2">
                                  <Egg className="h-4 w-4" />
                                  {userDataInfo.totalChickens} poulet(s)
                                </p>
                                <p>• {userDataInfo.expenses} dépense(s)</p>
                                <p>• {userDataInfo.revenues} revenu(s)</p>
                                <p>• {userDataInfo.mortality} événement(s) de mortalité</p>
                                <p>• {userDataInfo.monthlyFinancials} mois de données financières</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium mb-1">
                                ⚠️ {userDataInfo.user?.name || 'Cet utilisateur'} n'a pas encore de données
                              </p>
                              <p className="text-sm">
                                Il doit d'abord se connecter et saisir ses dépenses, revenus ou événements de mortalité 
                                dans l'application avant de pouvoir exporter ses données.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <button
                onClick={downloadUserCsv}
                disabled={!selectedUserId || (userDataInfo && !userDataInfo.hasData)}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Télécharger CSV
              </button>
            </div>
          </div>

          {/* Import CSV */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Upload className="h-5 w-5 text-orange-600" />
              Importer les données
            </h4>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ L'import écrase toutes les données existantes de l'utilisateur sélectionné
                </p>
              </div>
              
              {/* Sélection du fichier */}
              <div className="space-y-2">
                <input
                  type="file"
                  id="csv-upload"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={!selectedUserId}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {selectedFile && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fichier sélectionné: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Bouton d'import */}
              <button
                onClick={handleCsvImport}
                disabled={!selectedUserId || !selectedFile || uploadingCsv}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingCsv ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importer CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions d'utilisation */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="font-medium text-blue-800 mb-2">💡 Comment ça marche :</h5>
              <div className="text-sm text-blue-700 space-y-2">
                <div>
                  <p className="font-medium">1. Pour un NOUVEL utilisateur :</p>
                  <p className="ml-4">• Il doit d'abord se connecter et saisir ses données (dépenses, revenus, mortalité)</p>
                  <p className="ml-4">• Ensuite vous pourrez télécharger son CSV avec SON nom</p>
                </div>
                <div>
                  <p className="font-medium">2. Pour IMPORTER des données :</p>
                  <p className="ml-4">• Sélectionnez l'utilisateur cible dans le menu déroulant</p>
                  <p className="ml-4">• Choisissez le fichier CSV à importer</p>
                  <p className="ml-4">• Cela écrasera toutes les données existantes de CET utilisateur uniquement</p>
                  <p className="ml-4">• ✅ Le total de poulets sera automatiquement importé et le taux de mortalité recalculé</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Format CSV */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-700 mb-2">📋 Format CSV attendu :</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Ligne spéciale :</strong> <code>TOTAL_CHICKENS,nombre</code> (pour le total de poulets)</p>
            <p><strong>En-tête :</strong> TYPE,DATE,CATEGORY,DESCRIPTION,AMOUNT,FREQUENCY</p>
            <p><strong>Types de données :</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <code>EXPENSE</code> - Dépenses (FREQUENCY: ponctuel, mensuel, etc.)</li>
              <li>• <code>REVENUE</code> - Revenus (FREQUENCY: quantité x prix unitaire)</li>
              <li>• <code>MORTALITY</code> - Mortalité (FREQUENCY: nombre d'animaux)</li>
            </ul>
            <p><strong>Section finances :</strong> MONTHLY_FINANCIALS puis MONTH,REVENUES,EXPENSES,NET_INCOME,REINVESTMENT</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total utilisateurs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Utilisateurs bloqués</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Administrateurs</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.admins}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Rechercher par nom, email ou ferme..."
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les rôles</option>
              {userRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les statuts</option>
              {userStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Nom complet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  placeholder="adresse@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field"
                  placeholder="Mot de passe"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la ferme
                </label>
                <input
                  type="text"
                  value={formData.farm_name}
                  onChange={(e) => setFormData({...formData, farm_name: e.target.value})}
                  className="input-field"
                  placeholder="Nom de la ferme (optionnel)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="input-field"
                  required
                >
                  {userRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input-field"
                  required
                >
                  {userStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    resetForm()
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

      {/* Liste des utilisateurs */}
      <div className="card">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ferme</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rôle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Inscription</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user.farm_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1 rounded ${
                            user.status === 'active' 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                          disabled={user.id === 1}
                        >
                          {user.status === 'active' ? 
                            <ShieldOff className="h-4 w-4" /> : 
                            <Shield className="h-4 w-4" />
                          }
                        </button>
                        
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Supprimer"
                          disabled={user.id === 1}
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
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole || filterStatus 
                ? 'Aucun utilisateur ne correspond aux critères de recherche'
                : 'Aucun utilisateur enregistré'
              }
            </p>
            {!searchTerm && !filterRole && !filterStatus && (
              <button
                onClick={() => {
                  setEditingUser(null)
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-primary"
              >
                Créer le premier utilisateur
              </button>
            )}
          </div>
        )}
      </div>

      {/* Résumé des filtres */}
      {(searchTerm || filterRole || filterStatus) && (
        <div className="mt-4 text-sm text-gray-600">
          Affichage de {filteredUsers.length} utilisateur(s) sur {users.length}
          {searchTerm && ` • Recherche: "${searchTerm}"`}
          {filterRole && ` • Rôle: ${getRoleLabel(filterRole)}`}
          {filterStatus && ` • Statut: ${getStatusLabel(filterStatus)}`}
        </div>
      )}
    </div>
  )
}