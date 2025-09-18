import React, { useState, useEffect } from 'react';
import { useTerritorialAccessControl } from '../hooks/useTerritorialAccessControl';
import { useAuth } from '../contexts/AuthContext';
import { commissionApi, fonctionCommissionApi, type Commission as CommissionApi, type FonctionCommission as FonctionCommissionApi } from '../api/arrondissementApi';

interface MembreCommission {
  code: number;
  code_commission: number;
  code_fonction: number;
  noms_prenoms: string;
  contact: string;
  email: string;
  date_creation: string;
  date_modification: string;
}

interface Commission {
  code: number;
  libelle: string;
  code_departement: number;
}

interface FonctionCommission {
  code: number;
  libelle: string;
}

interface MembreCommissionManagementProps {
  className?: string;
}

const MembreCommissionManagement: React.FC<MembreCommissionManagementProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { canViewData, canEditDepartment, getUserRoleNames } = useTerritorialAccessControl();
  const [membres, setMembres] = useState<MembreCommission[]>([]);
  const [commissions, setCommissions] = useState<CommissionApi[]>([]);
  const [fonctions, setFonctions] = useState<FonctionCommissionApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMembre, setEditingMembre] = useState<MembreCommission | null>(null);

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
      // Load membres, commissions, and fonctions from API
      // This would be replaced with actual API calls
      setMembres([]);
      
      // Load commissions and fonctions from API
      const [commissionsData, fonctionsData] = await Promise.all([
        commissionApi.getAll(),
        fonctionCommissionApi.getAll()
      ]);
      setCommissions(commissionsData);
      setFonctions(fonctionsData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (membreData: Partial<MembreCommission>) => {
    try {
      // API call to create membre
      console.log('Creating membre:', membreData);
      await loadData();
      setShowCreateModal(false);
    } catch (err) {
      setError('Erreur lors de la création du membre');
    }
  };

  const handleUpdate = async (membreData: Partial<MembreCommission>) => {
    try {
      // API call to update membre
      console.log('Updating membre:', membreData);
      await loadData();
      setEditingMembre(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du membre');
    }
  };

  const handleDelete = async (code: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    try {
      // API call to delete membre
      console.log('Deleting membre:', code);
      await loadData();
    } catch (err) {
      setError('Erreur lors de la suppression du membre');
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
            <i className="fas fa-user-friends mr-2"></i>
            Gestion des Membres de Commission
          </h2>
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Ajouter un membre
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
                  Nom et Prénoms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fonction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {membres.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                    Aucun membre de commission trouvé
                  </td>
                </tr>
              ) : (
                membres.map((membre) => (
                  <tr key={membre.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {membre.noms_prenoms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commissions.find(c => c.code === membre.code_commission)?.libelle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fonctions.find(f => f.code === membre.code_fonction)?.libelle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {membre.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {membre.email}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingMembre(membre)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(membre.code)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Ajouter un membre de commission
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const membreData: Partial<MembreCommission> = {
                  code: formData.get('code') as string || '',
                  codeMembre: formData.get('codeMembre') as string || '',
                  codeCommission: formData.get('codeCommission') as string || '',
                  codeFonction: formData.get('codeFonction') as string || '',
                  dateAffectation: formData.get('dateAffectation') as string || new Date().toISOString(),
                  statut: formData.get('statut') as string || 'actif',
                  observations: formData.get('observations') as string || ''
                };
                handleCreate(membreData);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code Membre
                    </label>
                    <input
                      type="text"
                      name="codeMembre"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission
                    </label>
                    <select
                      name="codeCommission"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une commission</option>
                      {commissions.map((commission) => (
                        <option key={commission.code} value={commission.code}>
                          {commission.libelle} {commission.departement ? `(${commission.departement.libelle})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fonction
                    </label>
                    <select
                      name="codeFonction"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une fonction</option>
                      {fonctions.map((fonction) => (
                        <option key={fonction.code} value={fonction.code}>
                          {fonction.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'affectation
                    </label>
                    <input
                      type="date"
                      name="dateAffectation"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      name="statut"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                      <option value="suspendu">Suspendu</option>
                      <option value="demissionnaire">Démissionnaire</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observations
                  </label>
                  <textarea
                    name="observations"
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

export default MembreCommissionManagement;
