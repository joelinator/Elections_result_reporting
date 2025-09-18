import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTerritorialAccessControl } from '../hooks/useTerritorialAccessControl';
import { 
  getResultatsDepartement, 
  getAccessibleDepartements,
  type ResultatDepartement,
  type Departement,
  type ResultatDepartementFilters
} from '../api/resultatDepartementApi';

interface ResultatDepartementManagementProps {
  className?: string;
}

export const ResultatDepartementManagement: React.FC<ResultatDepartementManagementProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const { getUserRoleNames } = useTerritorialAccessControl();
  
  const [resultats, setResultats] = useState<ResultatDepartement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedDepartement, setSelectedDepartement] = useState<number | undefined>();
  const [selectedParti, setSelectedParti] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalDepartements, setTotalDepartements] = useState(0);
  const [partisUniques, setPartisUniques] = useState(0);

  const userRoles = getUserRoleNames();
  const isAdmin = userRoles.includes('administrateur');

  // Load accessible departments
  useEffect(() => {
    const loadDepartements = async () => {
      if (!user?.code) return;
      
      try {
        const depts = await getAccessibleDepartements(user.code);
        setDepartements(depts);
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Erreur lors du chargement des départements');
      }
    };

    loadDepartements();
  }, [user]);

  // Load resultats
  useEffect(() => {
    const loadResultats = async () => {
      if (!user?.code) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const filters: ResultatDepartementFilters = {
          userId: user.code
        };
        
        if (selectedDepartement) {
          filters.departement = selectedDepartement;
        }
        
        if (selectedParti) {
          filters.parti = selectedParti;
        }
        
        const data = await getResultatsDepartement(filters);
        setResultats(data);
        
        // Calculate stats
        const total = data.reduce((sum, r) => sum + r.nombre_vote, 0);
        const uniqueDepts = new Set(data.map(r => r.code_departement)).size;
        const uniquePartis = new Set(data.map(r => r.code_parti)).size;
        
        setTotalVotes(total);
        setTotalDepartements(uniqueDepts);
        setPartisUniques(uniquePartis);
        
      } catch (err) {
        console.error('Error loading resultats:', err);
        setError('Erreur lors du chargement des résultats');
      } finally {
        setLoading(false);
      }
    };

    loadResultats();
  }, [user, selectedDepartement, selectedParti]);

  // Filter results by search term
  const filteredResultats = resultats.filter(resultat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      resultat.departement.libelle.toLowerCase().includes(searchLower) ||
      resultat.parti.designation.toLowerCase().includes(searchLower) ||
      resultat.parti.abbreviation?.toLowerCase().includes(searchLower)
    );
  });

  // Get unique partis for filter
  const uniquePartis = Array.from(
    new Set(resultats.map(r => r.code_parti))
  ).map(code => {
    const resultat = resultats.find(r => r.code_parti === code);
    return {
      code: code,
      designation: resultat?.parti.designation || '',
      abbreviation: resultat?.parti.abbreviation || ''
    };
  });

  const handleRefresh = () => {
    if (user?.code) {
      const loadResultats = async () => {
        setLoading(true);
        try {
          const filters: ResultatDepartementFilters = {
            userId: user.code
          };
          
          if (selectedDepartement) {
            filters.departement = selectedDepartement;
          }
          
          if (selectedParti) {
            filters.parti = selectedParti;
          }
          
          const data = await getResultatsDepartement(filters);
          setResultats(data);
        } catch (err) {
          console.error('Error refreshing resultats:', err);
          setError('Erreur lors du rafraîchissement des données');
        } finally {
          setLoading(false);
        }
      };
      
      loadResultats();
    }
  };

  const clearFilters = () => {
    setSelectedDepartement(undefined);
    setSelectedParti(undefined);
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Département', 'Région', 'Parti', 'Votes', 'Pourcentage'].join(','),
      ...filteredResultats.map(r => [
        r.departement.libelle,
        r.departement.region.libelle,
        r.parti.designation,
        r.nombre_vote,
        r.pourcentage || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats_departement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && resultats.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span>Chargement des résultats départementaux...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Résultats Départementaux</h2>
            <p className="text-gray-600">
              {isAdmin ? 'Tous les départements' : 'Départements accessibles selon votre rôle'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Actualiser
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <i className="fas fa-download mr-2"></i>
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-users text-2xl text-blue-600 mr-3"></i>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Votes</p>
                <p className="text-2xl font-bold text-blue-900">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-chart-bar text-2xl text-green-600 mr-3"></i>
              <div>
                <p className="text-sm font-medium text-green-600">Départements</p>
                <p className="text-2xl font-bold text-green-900">{totalDepartements}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-chart-line text-2xl text-purple-600 mr-3"></i>
              <div>
                <p className="text-sm font-medium text-purple-600">Partis Uniques</p>
                <p className="text-2xl font-bold text-purple-900">{partisUniques}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="fas fa-filter mr-2"></i>
          Filtres
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département
            </label>
            <select 
              value={selectedDepartement?.toString() || ''} 
              onChange={(e) => setSelectedDepartement(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les départements</option>
              {departements.map((dept) => (
                <option key={dept.code} value={dept.code.toString()}>
                  {dept.libelle}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parti Politique
            </label>
            <select 
              value={selectedParti?.toString() || ''} 
              onChange={(e) => setSelectedParti(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les partis</option>
              {uniquePartis.map((parti) => (
                <option key={parti.code} value={parti.code.toString()}>
                  {parti.abbreviation || parti.designation}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Résultats ({filteredResultats.length} entrée{filteredResultats.length !== 1 ? 's' : ''})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {filteredResultats.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-chart-bar text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Aucun résultat trouvé</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Région
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parti
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pourcentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResultats.map((resultat) => (
                  <tr key={`${resultat.code_departement}-${resultat.code_parti}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resultat.departement.libelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {resultat.departement.region.libelle}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{resultat.parti.designation}</div>
                        {resultat.parti.abbreviation && (
                          <div className="text-sm text-gray-500">
                            {resultat.parti.abbreviation}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900">
                      {resultat.nombre_vote.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {resultat.pourcentage ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {resultat.pourcentage.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultatDepartementManagement;
