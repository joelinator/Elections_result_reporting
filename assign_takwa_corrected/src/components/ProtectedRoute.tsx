import { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: number[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
          <span className="text-xl text-gray-600 font-semibold">Vérification des permissions...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Determine authorization
  const isAuthorized = (() => {
    if (!user) return false;
    if (requiredRoles && requiredRoles.length > 0) {
      return hasRole(requiredRoles);
    }
    // Fallback: allow all authorized roles via role names
    const allowedNames = ['observateur', 'observateur-local', 'validateur', 'administrateur', 'superviseur-regionale', 'superviseur-departementale', 'superviseur-communale'];
    const normalize = (s: string) => s?.toString().trim().toLowerCase();
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(role => allowedNames.includes(normalize(role.libelle)));
    }
    if (user.role) {
      return allowedNames.includes(normalize(user.role.libelle));
    }
    return false;
  })();

  // Authenticated but doesn't have required role
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            {user?.roles && Array.isArray(user.roles) ? (
              <>
                Vos rôles <strong>"{user.roles.map(role => role.libelle).join(', ')}"</strong> ne vous permettent pas d'accéder à cette application.
              </>
            ) : (
              <>
                Votre rôle <strong>"{user?.role?.libelle}"</strong> ne vous permet pas d'accéder à cette application.
              </>
            )}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Seuls les utilisateurs avec les rôles <strong>Observateur</strong>, <strong>Observateur-Local</strong>, <strong>Validateur</strong> ou <strong>Administrateur</strong> peuvent accéder à ce tableau de bord.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Actualiser
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Se déconnecter
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur système.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and has required role - render protected content
  return <>{children}</>;
}