import{ useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, Egg, Info } from 'lucide-react'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
});
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const { login, logout } = useAuth(); // Assurez-vous que logout est disponible

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Optionnel: se déconnecter d'abord pour nettoyer les anciens tokens
        await logout();
        
        await login(formData.email, formData.password);
        toast.success('Connexion réussie !');
    } catch (error) {
        console.error('Login error:', error);
        toast.error(error.response?.data?.message || error.message || 'Erreur de connexion');
    } finally {
        setLoading(false);
    }
};

const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  // const handleDemoLogin = () => {
  //   setFormData({
  //     email: 'projetsafrique@iworks.sn',
  //     password: 'PAE%pae123*-+'
  //   })
  // }

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
          <p className="text-gray-600">Accédez à votre tableau de bord</p>
        </div>

        {/* Informations d'identification de test */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-800 text-sm">Compte administrateur</p>
              <p className="text-blue-700 text-sm mt-1">
                Email : <code className="bg-blue-100 px-1 rounded text-xs">projetsafrique@iworks.sn</code><br />
                Mot de passe : <code className="bg-blue-100 px-1 rounded text-xs">PAE%pae123*-+</code>
              </p>
            </div>
          </div>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
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
              Mot de passe
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

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Besoin d'un compte ? Inscrivez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}