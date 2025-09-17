import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';

interface StatCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'red';
}

const StatCard = ({ icon, title, subtitle, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600', 
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="stat-card">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-semibold text-xl shadow-md bg-gradient-to-br ${colorClasses[color]}`}>
        <i className={icon}></i>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl font-bold text-white">E</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Vote Flow</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.noms_prenoms}</p>
              <p className="text-xs text-gray-500">{user?.role.libelle}</p>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              <i className="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const stats = {
    totalRegistered: 12500000,
    totalVotes: 8560000,
    turnout: 68.48,
    pollingStations: {
      reported: 29550,
      total: 31700
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600">Vue d'ensemble des données électorales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="fas fa-users"
          title={stats.totalRegistered.toLocaleString()}
          subtitle="Électeurs inscrits"
          color="blue"
        />
        <StatCard
          icon="fas fa-vote-yea"
          title={stats.totalVotes.toLocaleString()}
          subtitle="Votes exprimés"
          color="green"
        />
        <StatCard
          icon="fas fa-chart-pie"
          title={`${stats.turnout.toFixed(1)}%`}
          subtitle="Taux de participation"
          color="orange"
        />
        <StatCard
          icon="fas fa-building"
          title={`${stats.pollingStations.reported}/${stats.pollingStations.total}`}
          subtitle="Bureaux reportés"
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Résultats en temps réel</h3>
        <p className="text-gray-600">Les données sont mises à jour automatiquement.</p>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span className="font-medium">RDPC</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">45.7%</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span className="font-medium">SDF</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">19.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
          <span className="text-xl text-gray-600 font-semibold">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;