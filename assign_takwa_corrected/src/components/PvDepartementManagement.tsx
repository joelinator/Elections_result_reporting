import React, { useState, useEffect } from 'react';
import { useTerritorialAccessControl } from '../hooks/useTerritorialAccessControl';
import { useAuth } from '../contexts/AuthContext';

interface PvDepartement {
  code: number;
  code_departement: number;
  url_pv: string;
  hash_file: string;
  libelle: string;
  timestamp: string;
}

interface Departement {
  code: number;
  libelle: string;
}

interface PvDepartementManagementProps {
  className?: string;
}

const PvDepartementManagement: React.FC<PvDepartementManagementProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { canViewData, canEditDepartment, getUserRoleNames } = useTerritorialAccessControl();
  const [pvs, setPvs] = useState<PvDepartement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPv, setEditingPv] = useState<PvDepartement | null>(null);

  const roleNames = getUserRoleNames();
  const canEdit = roleNames.includes('administrateur') || 
                  ['superviseur-departementale', 'superviseur-regionale', 'scrutateur', 'validateur'].some(role => roleNames.includes(role));

  useEffect(() => {
    if (!canViewData()) {
      setError('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      setLoading(false);
      return;
    }

    loadData();
  }, [canViewData]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load PVs and departements from API
      // This would be replaced with actual API calls
      setPvs([]);
      setDepartements([]);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (pvData: Partial<PvDepartement>) => {
    try {
      // API call to create PV
      console.log('Creating PV:', pvData);
      await loadData();
      setShowCreateModal(false);
    } catch (err) {
      setError('Erreur lors de la création du PV');
    }
  };

  const handleUpdate = async (pvData: Partial<PvDepartement>) => {
    try {
      // API call to update PV
      console.log('Updating PV:', pvData);
      await loadData();
      setEditingPv(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du PV');
    }
  };

  const handleDelete = async (code: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce PV ?')) {
      return;
    }

    try {
      // API call to delete PV
      console.log('Deleting PV:', code);
      await loadData();
    } catch (err) {
      setError('Erreur lors de la suppression du PV');
    }
  };

  const handleDownload = (url: string) => {
    // Open PDF in new tab
    window.open(url, '_blank');
  };

  if (!canViewData()) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <i className="fas fa-ban text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold">Accès refusé</h3>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-file-pdf mr-2"></i>
            Gestion des PV Départementaux
          </h2>
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Ajouter un PV
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pvs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun PV départemental trouvé
                  </td>
                </tr>
              ) : (
                pvs.map((pv) => (
                  <tr key={pv.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pv.libelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {departements.find(d => d.code === pv.code_departement)?.libelle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pv.timestamp).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {pv.hash_file ? `${pv.hash_file.substring(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDownload(pv.url_pv)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Télécharger"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => setEditingPv(pv)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(pv.code)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ajouter un PV départemental
              </h3>
              {/* Form would go here */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleCreate({})}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PvDepartementManagement;
