/**
 * @file Composant principal pour la gestion des commissions départementales
 */

import React, { useState, useEffect } from 'react';
import {
  commissionDepartementaleApi,
  fonctionCommissionApi,
  membreCommissionApi,
  departementsApi,
  type CommissionDepartementale,
  type FonctionCommission,
  type MembreCommission,
  type Departement
} from '../api/commissionApi';

interface CommissionManagementProps {
  className?: string;
}

export const CommissionManagement: React.FC<CommissionManagementProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'commissions' | 'fonctions' | 'membres'>('commissions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [commissions, setCommissions] = useState<CommissionDepartementale[]>([]);
  const [fonctions, setFonctions] = useState<FonctionCommission[]>([]);
  const [membres, setMembres] = useState<MembreCommission[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);

  // États pour les modales
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showFonctionModal, setShowFonctionModal] = useState(false);
  const [showMembreModal, setShowMembreModal] = useState(false);

  // États pour l'édition
  const [editingCommission, setEditingCommission] = useState<CommissionDepartementale | null>(null);
  const [editingFonction, setEditingFonction] = useState<FonctionCommission | null>(null);
  const [editingMembre, setEditingMembre] = useState<MembreCommission | null>(null);

  // Filtres
  const [selectedDepartement, setSelectedDepartement] = useState<number | ''>('');

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Rechargement des commissions quand le filtre département change
  useEffect(() => {
    if (activeTab === 'commissions') {
      loadCommissions();
    }
  }, [selectedDepartement, activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [departementsData, fonctionsData] = await Promise.all([
        departementsApi.getAll(),
        fonctionCommissionApi.getAll()
      ]);
      
      setDepartements(departementsData);
      setFonctions(fonctionsData);
      
      // Charger les données selon l'onglet actif
      await loadDataForActiveTab();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadDataForActiveTab = async () => {
    switch (activeTab) {
      case 'commissions':
        await loadCommissions();
        break;
      case 'fonctions':
        // Les fonctions sont déjà chargées
        break;
      case 'membres':
        await loadMembres();
        break;
    }
  };

  const loadCommissions = async () => {
    try {
      const data = await commissionDepartementaleApi.getAll(
        selectedDepartement ? Number(selectedDepartement) : undefined
      );
      setCommissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commissions');
    }
  };

  const loadMembres = async () => {
    try {
      const data = await membreCommissionApi.getAll();
      setMembres(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des membres');
    }
  };

  const handleTabChange = async (tab: 'commissions' | 'fonctions' | 'membres') => {
    setActiveTab(tab);
    setError(null);
    await loadDataForActiveTab();
  };

  const handleDeleteCommission = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commission ?')) return;
    
    try {
      await commissionDepartementaleApi.delete(id);
      await loadCommissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDeleteFonction = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fonction ?')) return;
    
    try {
      await fonctionCommissionApi.delete(id);
      const updatedFonctions = await fonctionCommissionApi.getAll();
      setFonctions(updatedFonctions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDeleteMembre = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    
    try {
      await membreCommissionApi.delete(id);
      await loadMembres();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Commissions</h2>
        <p className="text-gray-600 mt-1">
          Gérez les commissions départementales, leurs fonctions et leurs membres
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          {[
            { key: 'commissions', label: 'Commissions', count: commissions.length },
            { key: 'fonctions', label: 'Fonctions', count: fonctions.length },
            { key: 'membres', label: 'Membres', count: membres.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key as any)}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'commissions' && (
          <CommissionsTab
            commissions={commissions}
            departements={departements}
            selectedDepartement={selectedDepartement}
            onDepartementChange={setSelectedDepartement}
            onEdit={(commission) => {
              setEditingCommission(commission);
              setShowCommissionModal(true);
            }}
            onDelete={handleDeleteCommission}
            onAdd={() => {
              setEditingCommission(null);
              setShowCommissionModal(true);
            }}
          />
        )}

        {activeTab === 'fonctions' && (
          <FonctionsTab
            fonctions={fonctions}
            onEdit={(fonction) => {
              setEditingFonction(fonction);
              setShowFonctionModal(true);
            }}
            onDelete={handleDeleteFonction}
            onAdd={() => {
              setEditingFonction(null);
              setShowFonctionModal(true);
            }}
          />
        )}

        {activeTab === 'membres' && (
          <MembresTab
            membres={membres}
            commissions={commissions}
            fonctions={fonctions}
            onEdit={(membre) => {
              setEditingMembre(membre);
              setShowMembreModal(true);
            }}
            onDelete={handleDeleteMembre}
            onAdd={() => {
              setEditingMembre(null);
              setShowMembreModal(true);
            }}
          />
        )}
      </div>

      {/* Modales */}
      {showCommissionModal && (
        <CommissionModal
          commission={editingCommission}
          departements={departements}
          onClose={() => {
            setShowCommissionModal(false);
            setEditingCommission(null);
          }}
          onSave={async () => {
            await loadCommissions();
            setShowCommissionModal(false);
            setEditingCommission(null);
          }}
        />
      )}

      {showFonctionModal && (
        <FonctionModal
          fonction={editingFonction}
          onClose={() => {
            setShowFonctionModal(false);
            setEditingFonction(null);
          }}
          onSave={async () => {
            const updatedFonctions = await fonctionCommissionApi.getAll();
            setFonctions(updatedFonctions);
            setShowFonctionModal(false);
            setEditingFonction(null);
          }}
        />
      )}

      {showMembreModal && (
        <MembreModal
          membre={editingMembre}
          commissions={commissions}
          fonctions={fonctions}
          onClose={() => {
            setShowMembreModal(false);
            setEditingMembre(null);
          }}
          onSave={async () => {
            await loadMembres();
            setShowMembreModal(false);
            setEditingMembre(null);
          }}
        />
      )}
    </div>
  );
};

// Composants des onglets
interface CommissionsTabProps {
  commissions: CommissionDepartementale[];
  departements: Departement[];
  selectedDepartement: number | '';
  onDepartementChange: (value: number | '') => void;
  onEdit: (commission: CommissionDepartementale) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const CommissionsTab: React.FC<CommissionsTabProps> = ({
  commissions,
  departements,
  selectedDepartement,
  onDepartementChange,
  onEdit,
  onDelete,
  onAdd
}) => (
  <div className="space-y-4">
    {/* Filters and Add button */}
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <select
          value={selectedDepartement}
          onChange={(e) => onDepartementChange(e.target.value ? Number(e.target.value) : '')}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les départements</option>
          {departements.map((dept) => (
            <option key={dept.code} value={dept.code}>
              {dept.libelle} ({dept.abbreviation})
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
      >
        Ajouter une commission
      </button>
    </div>

    {/* Commissions list */}
    <div className="grid gap-4">
      {commissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune commission trouvée
        </div>
      ) : (
        commissions.map((commission) => (
          <div key={commission.code} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">{commission.libelle}</h3>
                <p className="text-gray-600 mt-1">
                  Département: {commission.departement?.libelle} ({commission.departement?.abbreviation})
                </p>
                {commission.description && (
                  <p className="text-gray-500 mt-2">{commission.description}</p>
                )}
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <span>Membres: {commission.membreCommissions?.length || 0}</span>
                  <span className="ml-4">
                    Créée le: {new Date(commission.date_creation).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(commission)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(commission.code)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

interface FonctionsTabProps {
  fonctions: FonctionCommission[];
  onEdit: (fonction: FonctionCommission) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const FonctionsTab: React.FC<FonctionsTabProps> = ({ fonctions, onEdit, onDelete, onAdd }) => (
  <div className="space-y-4">
    <div className="flex justify-end">
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
      >
        Ajouter une fonction
      </button>
    </div>

    <div className="grid gap-4">
      {fonctions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune fonction trouvée
        </div>
      ) : (
        fonctions.map((fonction) => (
          <div key={fonction.code} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">{fonction.libelle}</h3>
                {fonction.description && (
                  <p className="text-gray-600 mt-1">{fonction.description}</p>
                )}
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <span>Membres: {fonction.membreCommissions?.length || 0}</span>
                  <span className="ml-4">
                    Créée le: {new Date(fonction.date_ajout).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(fonction)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(fonction.code)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

interface MembresTabProps {
  membres: MembreCommission[];
  commissions: CommissionDepartementale[];
  fonctions: FonctionCommission[];
  onEdit: (membre: MembreCommission) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const MembresTab: React.FC<MembresTabProps> = ({ membres, onEdit, onDelete, onAdd }) => (
  <div className="space-y-4">
    <div className="flex justify-end">
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
      >
        Ajouter un membre
      </button>
    </div>

    <div className="grid gap-4">
      {membres.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun membre trouvé
        </div>
      ) : (
        membres.map((membre) => (
          <div key={membre.code} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-semibold text-lg text-gray-800">{membre.nom}</h3>
                  {membre.est_membre_secretariat && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Secrétariat
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">Fonction: {membre.fonction?.libelle}</p>
                {membre.commission && (
                  <p className="text-gray-600">Commission: {membre.commission.libelle}</p>
                )}
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  {membre.contact && <span>📞 {membre.contact}</span>}
                  {membre.email && <span>✉️ {membre.email}</span>}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Ajouté le: {new Date(membre.date_ajout).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(membre)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(membre.code)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Modales
interface CommissionModalProps {
  commission: CommissionDepartementale | null;
  departements: Departement[];
  onClose: () => void;
  onSave: () => void;
}

const CommissionModal: React.FC<CommissionModalProps> = ({ commission, departements, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    libelle: commission?.libelle || '',
    description: commission?.description || '',
    code_departement: commission?.code_departement || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.libelle || !formData.code_departement) {
      setError('Le libellé et le département sont requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (commission) {
        await commissionDepartementaleApi.update(commission.code, {
          libelle: formData.libelle,
          description: formData.description
        });
      } else {
        await commissionDepartementaleApi.create({
          libelle: formData.libelle,
          description: formData.description,
          code_departement: Number(formData.code_departement)
        });
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {commission ? 'Modifier la commission' : 'Nouvelle commission'}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département *
            </label>
            <select
              value={formData.code_departement}
              onChange={(e) => setFormData({ ...formData, code_departement: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!commission} // Désactiver la modification du département pour une commission existante
            >
              <option value="">Sélectionner un département</option>
              {departements.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.libelle} ({dept.abbreviation})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface FonctionModalProps {
  fonction: FonctionCommission | null;
  onClose: () => void;
  onSave: () => void;
}

const FonctionModal: React.FC<FonctionModalProps> = ({ fonction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    libelle: fonction?.libelle || '',
    description: fonction?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.libelle) {
      setError('Le libellé est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (fonction) {
        await fonctionCommissionApi.update(fonction.code, formData);
      } else {
        await fonctionCommissionApi.create(formData);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {fonction ? 'Modifier la fonction' : 'Nouvelle fonction'}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MembreModalProps {
  membre: MembreCommission | null;
  commissions: CommissionDepartementale[];
  fonctions: FonctionCommission[];
  onClose: () => void;
  onSave: () => void;
}

const MembreModal: React.FC<MembreModalProps> = ({ membre, commissions, fonctions, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: membre?.nom || '',
    code_fonction: membre?.code_fonction || '',
    code_commission: membre?.code_commission || '',
    contact: membre?.contact || '',
    email: membre?.email || '',
    est_membre_secretariat: membre?.est_membre_secretariat || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.code_fonction) {
      setError('Le nom et la fonction sont requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        ...formData,
        code_fonction: Number(formData.code_fonction),
        code_commission: formData.code_commission ? Number(formData.code_commission) : undefined
      };
      
      if (membre) {
        await membreCommissionApi.update(membre.code, submitData);
      } else {
        await membreCommissionApi.create(submitData);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {membre ? 'Modifier le membre' : 'Nouveau membre'}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fonction *
            </label>
            <select
              value={formData.code_fonction}
              onChange={(e) => setFormData({ ...formData, code_fonction: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
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
              Commission
            </label>
            <select
              value={formData.code_commission}
              onChange={(e) => setFormData({ ...formData, code_commission: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Aucune commission</option>
              {commissions.map((commission) => (
                <option key={commission.code} value={commission.code}>
                  {commission.libelle} - {commission.departement?.libelle}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="secretariat"
              checked={formData.est_membre_secretariat}
              onChange={(e) => setFormData({ ...formData, est_membre_secretariat: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="secretariat" className="ml-2 text-sm text-gray-700">
              Membre du secrétariat
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionManagement;