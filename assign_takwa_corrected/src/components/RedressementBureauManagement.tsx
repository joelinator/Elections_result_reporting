import React, { useState, useEffect } from 'react';
import { useTerritorialAccessControl } from '../hooks/useTerritorialAccessControl';
import { useAuth } from '../contexts/AuthContext';

interface RedressementBureau {
  code: number;
  code_bureau_vote: number;
  nombre_inscrit_initial: number;
  nombre_inscrit_redresse: number;
  nombre_votant_initial: number;
  nombre_votant_redresse: number;
  bulletin_nul_initial: number;
  bulletin_nul_redresse: number;
  suffrage_exprime_initial: number;
  suffrage_exprime_redresse: number;
  raison_redressement: string;
  date_redressement: string;
  statut_validation: number;
}

interface BureauVote {
  code: number;
  designation: string;
  code_arrondissement: number;
  code_departement: number;
}

interface RedressementBureauManagementProps {
  className?: string;
}

const RedressementBureauManagement: React.FC<RedressementBureauManagementProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { canViewData, canEditBureauVote, getUserRoleNames } = useTerritorialAccessControl();
  const [redressements, setRedressements] = useState<RedressementBureau[]>([]);
  const [bureauxVote, setBureauxVote] = useState<BureauVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRedressement, setEditingRedressement] = useState<RedressementBureau | null>(null);

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
      // Load redressements and bureaux vote from API
      // This would be replaced with actual API calls
      setRedressements([]);
      setBureauxVote([]);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (redressementData: Partial<RedressementBureau>) => {
    try {
      // API call to create redressement
      console.log('Creating redressement:', redressementData);
      await loadData();
      setShowCreateModal(false);
    } catch (err) {
      setError('Erreur lors de la création du redressement');
    }
  };

  const handleUpdate = async (redressementData: Partial<RedressementBureau>) => {
    try {
      // API call to update redressement
      console.log('Updating redressement:', redressementData);
      await loadData();
      setEditingRedressement(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du redressement');
    }
  };

  const handleDelete = async (code: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce redressement ?')) {
      return;
    }

    try {
      // API call to delete redressement
      console.log('Deleting redressement:', code);
      await loadData();
    } catch (err) {
      setError('Erreur lors de la suppression du redressement');
    }
  };

  const handleValidate = async (code: number) => {
    try {
      // API call to validate redressement
      console.log('Validating redressement:', code);
      await loadData();
    } catch (err) {
      setError('Erreur lors de la validation du redressement');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 1:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Validé</span>;
      case 2:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejeté</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inconnu</span>;
    }
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
            <i className="fas fa-undo mr-2"></i>
            Gestion des Redressements Bureau de Vote
          </h2>
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Ajouter un redressement
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
                  Bureau de Vote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bulletins Nuls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suffrages Exprimés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redressements.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                    Aucun redressement de bureau de vote trouvé
                  </td>
                </tr>
              ) : (
                redressements.map((redressement) => (
                  <tr key={redressement.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bureauxVote.find(bv => bv.code === redressement.code_bureau_vote)?.designation || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-red-600">{redressement.nombre_inscrit_initial}</span>
                        <span className="text-green-600">→ {redressement.nombre_inscrit_redresse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-red-600">{redressement.nombre_votant_initial}</span>
                        <span className="text-green-600">→ {redressement.nombre_votant_redresse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-red-600">{redressement.bulletin_nul_initial}</span>
                        <span className="text-green-600">→ {redressement.bulletin_nul_redresse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-red-600">{redressement.suffrage_exprime_initial}</span>
                        <span className="text-green-600">→ {redressement.suffrage_exprime_redresse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(redressement.statut_validation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(redressement.date_redressement).toLocaleDateString('fr-FR')}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {redressement.statut_validation === 0 && (
                          <button
                            onClick={() => handleValidate(redressement.code)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Valider"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setEditingRedressement(redressement)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(redressement.code)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    )}
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
                Ajouter un redressement de bureau de vote
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

export default RedressementBureauManagement;
