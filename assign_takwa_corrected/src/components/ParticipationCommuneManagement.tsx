import React, { useState, useEffect, useCallback } from 'react';
import { useTerritorialAccessControl } from '../hooks/useTerritorialAccessControl';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllParticipationCommune,
  getParticipationCommuneForUser,
  createParticipationCommune,
  updateParticipationCommune,
  deleteParticipationCommune,
  validateParticipationCommune,
  approveParticipationCommune,
  rejectParticipationCommune,
  bulkValidateParticipationCommune,
  bulkApproveParticipationCommune,
  bulkRejectParticipationCommune,
  calculateParticipationRate,
  calculateAbstentionRate,
  validateParticipationData,
  generateParticipationReport,
  type ParticipationCommune,
  type ParticipationCommuneInput
} from '../api/participationCommuneApi';
import { arrondissementApi, type Arrondissement as Commune } from '../api/arrondissementApi';

interface Arrondissement {
  code: number;
  libelle: string;
  codeDepartement: number;
  departement?: {
    code: number;
    libelle: string;
  };
}

interface ParticipationCommuneManagementProps {
  className?: string;
}

const ParticipationCommuneManagement: React.FC<ParticipationCommuneManagementProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { canViewData, canEditArrondissement, getUserRoleNames } = useTerritorialAccessControl();
  const [participations, setParticipations] = useState<ParticipationCommune[]>([]);
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingParticipation, setEditingParticipation] = useState<ParticipationCommune | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const roleNames = getUserRoleNames();
  const canEdit = roleNames.includes('administrateur') || 
                  ['superviseur-departementale', 'superviseur-regionale', 'scrutateur', 'validateur'].some(role => roleNames.includes(role));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load participations based on user role and territorial access
      const data = await getParticipationCommuneForUser();
      setParticipations(data);
      
      // Load communes (arrondissements) from API
      const communesData = await arrondissementApi.getAll();
      setCommunes(communesData);
      
      // Extract unique arrondissements from participations
      const uniqueArrondissements = data.reduce((acc, participation) => {
        if (participation.commune && !acc.find(a => a.code === participation.commune!.code)) {
          acc.push(participation.commune!);
        }
        return acc;
      }, [] as Arrondissement[]);
      setArrondissements(uniqueArrondissements);
      
    } catch (err) {
      setError('Erreur lors du chargement des données de participation');
      console.error('Error loading participation data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canViewData()) {
      setError('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      setLoading(false);
      return;
    }

    loadData();
  }, [canViewData, loadData]);

  const handleCreate = async (participationData: ParticipationCommuneInput) => {
    try {
      // Validate data
      const validationErrors = validateParticipationData(participationData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Calculate rates if not provided
      if (participationData.nombreInscrits && participationData.nombreVotants) {
        participationData.tauxParticipation = calculateParticipationRate(
          participationData.nombreInscrits,
          participationData.nombreVotants
        );
        participationData.tauxAbstention = calculateAbstentionRate(
          participationData.nombreInscrits,
          participationData.nombreVotants
        );
      }

      await createParticipationCommune(participationData);
      await loadData();
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la participation');
    }
  };

  const handleUpdate = async (id: number, participationData: Partial<ParticipationCommuneInput>) => {
    try {
      // Validate data
      const validationErrors = validateParticipationData(participationData as ParticipationCommuneInput);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Calculate rates if not provided
      if (participationData.nombreInscrits && participationData.nombreVotants) {
        participationData.tauxParticipation = calculateParticipationRate(
          participationData.nombreInscrits,
          participationData.nombreVotants
        );
        participationData.tauxAbstention = calculateAbstentionRate(
          participationData.nombreInscrits,
          participationData.nombreVotants
        );
      }

      await updateParticipationCommune(id, participationData);
      await loadData();
      setEditingParticipation(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de la participation');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette participation ?')) {
      return;
    }

    try {
      await deleteParticipationCommune(id);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la participation');
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await validateParticipationCommune(id);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation de la participation');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveParticipationCommune(id);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'approbation de la participation');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Raison du rejet (optionnel):');
    try {
      await rejectParticipationCommune(id, reason || undefined);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du rejet de la participation');
    }
  };

  const handleBulkValidate = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkValidateParticipationCommune(selectedItems);
      await loadData();
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation en lot');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkApproveParticipationCommune(selectedItems);
      await loadData();
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'approbation en lot');
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.length === 0) return;
    
    const reason = prompt('Raison du rejet (optionnel):');
    try {
      await bulkRejectParticipationCommune(selectedItems, reason || undefined);
      await loadData();
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du rejet en lot');
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === participations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(participations.map(p => p.code));
    }
  };

  const getStatusBadge = (participation: ParticipationCommune) => {
    // This would be based on validation status if available
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
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

  const report = generateParticipationReport(participations);

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-chart-pie mr-2"></i>
            Gestion des Participations Communales
          </h2>
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Ajouter une participation
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-700 hover:text-red-900"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-building text-blue-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-blue-600">Arrondissements</p>
                <p className="text-2xl font-bold text-blue-800">{report.totalArrondissements}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-users text-green-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-green-600">Inscrits</p>
                <p className="text-2xl font-bold text-green-800">{report.totalInscrits.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-vote-yea text-purple-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-purple-600">Votants</p>
                <p className="text-2xl font-bold text-purple-800">{report.totalVotants.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-percentage text-orange-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-orange-600">Taux Participation</p>
                <p className="text-2xl font-bold text-orange-800">{report.averageParticipationRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {canEdit && selectedItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-800">
                {selectedItems.length} élément(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkValidate}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                >
                  Valider
                </button>
                <button
                  onClick={handleBulkApprove}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Approuver
                </button>
                <button
                  onClick={handleBulkReject}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {canEdit && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === participations.length && participations.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrondissement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bureaux
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bulletins Nuls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suffrages Valables
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participations.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 10 : 9} className="px-6 py-4 text-center text-gray-500">
                    Aucune participation communale trouvée
                  </td>
                </tr>
              ) : (
                participations.map((participation) => (
                  <tr key={participation.code} className="hover:bg-gray-50">
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(participation.code)}
                          onChange={() => handleSelectItem(participation.code)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-medium">{participation.commune?.libelle || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {participation.commune?.departement?.libelle || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.nombreBureaux || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.nombreInscrits?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.nombreVotants?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.tauxParticipation ? `${participation.tauxParticipation}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.bulletinsNuls?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.suffragesValables?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(participation)}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleValidate(participation.code)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Valider"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                          <button
                            onClick={() => handleApprove(participation.code)}
                            className="text-green-600 hover:text-green-900"
                            title="Approuver"
                          >
                            <i className="fas fa-thumbs-up"></i>
                          </button>
                          <button
                            onClick={() => setEditingParticipation(participation)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(participation.code)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Ajouter une participation communale
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const participationData: ParticipationCommuneInput = {
                  codeCommune: parseInt(formData.get('codeCommune') as string) || 0,
                  nombreInscrits: parseInt(formData.get('nombreInscrits') as string) || 0,
                  nombreVotants: parseInt(formData.get('nombreVotants') as string) || 0,
                  tauxParticipation: parseFloat(formData.get('tauxParticipation') as string) || 0,
                  tauxAbstention: parseFloat(formData.get('tauxAbstention') as string) || 0,
                  bulletinNul: parseInt(formData.get('bulletinNul') as string) || 0,
                  suffrageExprime: parseInt(formData.get('suffrageExprime') as string) || 0,
                  observation: formData.get('observation') as string || ''
                };
                handleCreate(participationData);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commune
                    </label>
                    <select
                      name="codeCommune"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une commune</option>
                      {communes.map((commune) => (
                        <option key={commune.code} value={commune.code}>
                          {commune.libelle} {commune.departement ? `(${commune.departement.libelle})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre d'inscrits
                    </label>
                    <input
                      type="number"
                      name="nombreInscrits"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de votants
                    </label>
                    <input
                      type="number"
                      name="nombreVotants"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux de participation (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="tauxParticipation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux d'abstention (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="tauxAbstention"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulletins nuls
                    </label>
                    <input
                      type="number"
                      name="bulletinNul"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suffrages exprimés
                    </label>
                    <input
                      type="number"
                      name="suffrageExprime"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observations
                  </label>
                  <textarea
                    name="observation"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipationCommuneManagement;
