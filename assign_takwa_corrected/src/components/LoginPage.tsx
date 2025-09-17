import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (!credentials.login.trim()) {
      setError('Veuillez saisir votre identifiant de connexion');
      setIsSubmitting(false);
      return;
    }

    if (!credentials.password.trim()) {
      setError('Veuillez saisir votre mot de passe');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(credentials);
    } catch (error: any) {
      console.log('Login error caught:', error);
      const errorMessage = error.message || 'Erreur lors de la connexion. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mr-4"></div>
          <span className="text-xl text-white font-semibold">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Moving particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute animate-float-1 top-1/4 left-1/4 w-2 h-2 bg-white bg-opacity-20 rounded-full"></div>
        <div className="absolute animate-float-2 top-1/3 right-1/4 w-1 h-1 bg-white bg-opacity-30 rounded-full"></div>
        <div className="absolute animate-float-3 top-2/3 left-1/3 w-3 h-3 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute animate-float-1 bottom-1/4 right-1/3 w-2 h-2 bg-white bg-opacity-25 rounded-full animation-delay-2000"></div>
        <div className="absolute animate-float-2 bottom-1/3 left-1/5 w-1 h-1 bg-white bg-opacity-20 rounded-full animation-delay-4000"></div>
      </div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-pulse hover:scale-110 transition-transform duration-300">
            <span className="text-3xl font-bold text-white">E</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Vote FLow</h2>
          <p className="text-blue-200 text-lg">Elections Présidentielles 2025</p>
          {/* <p className="text-blue-300 text-sm mt-2">Tableau de bord - Cameroun</p> */}
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Connexion</h3>
            <p className="text-gray-600">Accédez à votre tableau de bord</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-500 text-lg"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    {error.includes('Identifiants invalides') && (
                      <p className="text-xs text-red-600 mt-1">
                        Assurez-vous que votre identifiant de connexion et mot de passe sont corrects.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant de connexion
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.login}
                  onChange={handleInputChange}
                  className={`pl-10 block w-full px-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    error && (error.includes('identifiant') || error.includes('Identifiants invalides')) 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Votre Identifiant"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  className={`pl-10 block w-full px-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    error && (error.includes('mot de passe') || error.includes('Identifiants invalides')) 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !credentials.login || !credentials.password}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Se connecter
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Informations d'accès */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800 mb-1">Accès autorisé</p>
                  <p className="text-xs text-blue-700">
                    Seuls les utilisateurs avec les rôles <strong>Observateur</strong>, <strong>Validateur</strong> ou <strong>Administrateur</strong> peuvent accéder à cette application.
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-200 text-sm">
            © 2025 VoteFlow - Système de Gestion Électorale du Cameroun
          </p>
        </div>
      </div>
    </div>
  );
}