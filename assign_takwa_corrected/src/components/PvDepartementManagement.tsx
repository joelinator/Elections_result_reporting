/**
 * @file Composant principal pour la gestion des PV par département
 */

import React, { useState, useEffect } from 'react';
import {
  pvDepartementApi,
  type PvDepartement,
  type Departement
} from '../api/pvDepartementApi';
import { departementsApi } from '../api/commissionApi';
import { regionsApi } from '../api/arrondissementApi';
import { useAuth } from '../contexts/AuthContext';

interface PvDepartementManagementProps {
  className?: string;
}

export const PvDepartementManagement: React.FC<PvDepartementManagementProps> = ({ className = '' }) => {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les permissions - administrateurs et scrutateurs départementaux peuvent accéder
  const isAdmin = user && hasRole([1]); // 1 = Administrateur
  const isScrutateurDepartementale = user && hasRole(['scrutateur-departementale']);
  
  if (!user || (!isAdmin && !isScrutateurDepartementale)) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Seuls les administrateurs et scrutateurs départementaux peuvent accéder à la gestion des PV par département.
          </p>
          <p className="text-sm text-gray-500">
            Votre rôle actuel ne vous permet pas d'accéder à cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // États pour les données
  const [pvList, setPvList] = useState<PvDepartement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  // États pour les modales
  const [showPvModal, setShowPvModal] = useState(false);

  // États pour l'édition
  const [editingPv, setEditingPv] = useState<PvDepartement | null>(null);

  // Filtres
  const [selectedRegion, setSelectedRegion] = useState<number | ''>('');
  const [selectedDepartement, setSelectedDepartement] = useState<number | ''>('');

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Rechargement des PV quand les filtres changent
  useEffect(() => {
    loadPvList();
  }, [selectedRegion, selectedDepartement]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [departementsData, regionsData] = await Promise.all([
        departementsApi.getAll(),
        regionsApi.getAll()
      ]);
      
      setDepartements(departementsData);
      setRegions(regionsData);
      
      await loadPvList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadPvList = async () => {
    try {
      const filters: any = {};
      if (selectedRegion) filters.region = Number(selectedRegion);
      if (selectedDepartement) filters.departement = Number(selectedDepartement);
      
      const data = await pvDepartementApi.getAll(filters);
      setPvList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des PV');
    }
  };

  const handleDeletePv = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce PV ?')) return;
    
    try {
      await pvDepartementApi.delete(id);
      await loadPvList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDownloadPv = (pv: PvDepartement) => {
    const url = pvDepartementApi.getDownloadUrl(pv);
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Filtrer les départements par région sélectionnée
  const filteredDepartements = selectedRegion
    ? departements.filter(dept => dept.region?.code === Number(selectedRegion))
    : departements;

  // Calculer les statistiques
  const totalSize = pvList.reduce((sum, pv) => sum + (pv.hash_file ? 1024 : 0), 0);
  const departementsAvecPv = new Set(pvList.map(pv => pv.code_departement)).size;

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
        <h2 className="text-2xl font-bold text-gray-800">Gestion des PV par Département</h2>
        <p className="text-gray-600 mt-1">
          Gérez les procès-verbaux des départements
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

      {/* Statistiques */}
      {pvList.length > 0 && (
        <div className="mx-6 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{pvList.length}</div>
            <div className="text-sm text-gray-600">PV disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{departementsAvecPv}</div>
            <div className="text-sm text-gray-600">Départements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(totalSize / 1024).toFixed(1)} KB</div>
            <div className="text-sm text-gray-600">Taille totale</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <PvTab
          pvList={pvList}
          regions={regions}
          departements={filteredDepartements}
          selectedRegion={selectedRegion}
          selectedDepartement={selectedDepartement}
          onRegionChange={setSelectedRegion}
          onDepartementChange={setSelectedDepartement}
          onEdit={(pv) => {
            setEditingPv(pv);
            setShowPvModal(true);
          }}
          onDelete={handleDeletePv}
          onDownload={handleDownloadPv}
          onAdd={() => {
            setEditingPv(null);
            setShowPvModal(true);
          }}
        />
      </div>

      {/* Modale */}
      {showPvModal && (
        <PvModal
          pv={editingPv}
          departements={departements}
          onClose={() => {
            setShowPvModal(false);
            setEditingPv(null);
          }}
          onSave={async () => {
            await loadPvList();
            setShowPvModal(false);
            setEditingPv(null);
          }}
        />
      )}
    </div>
  );
};

// Composant pour l'onglet PV
interface PvTabProps {
  pvList: PvDepartement[];
  regions: any[];
  departements: Departement[];
  selectedRegion: number | '';
  selectedDepartement: number | '';
  onRegionChange: (value: number | '') => void;
  onDepartementChange: (value: number | '') => void;
  onEdit: (pv: PvDepartement) => void;
  onDelete: (id: number) => void;
  onDownload: (pv: PvDepartement) => void;
  onAdd: () => void;
}

const PvTab: React.FC<PvTabProps> = ({
  pvList,
  regions,
  departements,
  selectedRegion,
  selectedDepartement,
  onRegionChange,
  onDepartementChange,
  onEdit,
  onDelete,
  onDownload,
  onAdd
}) => {
  return (
    <div className="space-y-4">
      {/* Filters and Add button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value ? Number(e.target.value) : '')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les régions</option>
            {regions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.libelle} ({region.abbreviation})
              </option>
            ))}
          </select>
          
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
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Ajouter un PV
        </button>
      </div>

      {/* PV list */}
      <div className="grid gap-4">
        {pvList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun PV trouvé
          </div>
        ) : (
          pvList.map((pv) => (
            <div key={pv.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg text-gray-800">{pv.libelle}</h3>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                      📄 PV
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {pv.departement && (
                      <p className="text-gray-600 text-sm">
                        Département: {pv.departement.libelle} ({pv.departement.abbreviation})
                      </p>
                    )}
                    {pv.departement?.region && (
                      <p className="text-gray-600 text-sm">
                        Région: {pv.departement.region.libelle} ({pv.departement.region.abbreviation})
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                    <span>Ajouté le: {new Date(pv.timestamp).toLocaleDateString()}</span>
                    {pv.hash_file && (
                      <span className="font-mono text-xs">Hash: {pv.hash_file.substring(0, 8)}...</span>
                    )}
                    {pv.url_pv && (
                      <span className="text-green-600 font-medium">✓ Fichier disponible</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {pv.url_pv && (
                    <button
                      onClick={() => onDownload(pv)}
                      className="text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-300 hover:border-green-500"
                    >
                      📥 Télécharger
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(pv)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(pv.code)}
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
};

// Modale pour PV
interface PvModalProps {
  pv: PvDepartement | null;
  departements: Departement[];
  onClose: () => void;
  onSave: () => void;
}

const PvModal: React.FC<PvModalProps> = ({ 
  pv, 
  departements, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    libelle: pv?.libelle || '',
    code_departement: pv?.code_departement || ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.libelle || !formData.code_departement) {
      setError('Le libellé et le département sont requis');
      return;
    }

    if (!pv && !file) {
      setError('Un fichier est requis pour un nouveau PV');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (pv) {
        await pvDepartementApi.update(pv.code, {
          libelle: formData.libelle,
          file: file || undefined
        });
      } else {
        await pvDepartementApi.create({
          libelle: formData.libelle,
          code_departement: Number(formData.code_departement),
          file: file!
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
          {pv ? 'Modifier le PV' : 'Nouveau PV'}
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
              disabled={!!pv} // Désactiver la modification du département pour un PV existant
            >
              <option value="">Sélectionner un département</option>
              {departements.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.libelle} ({dept.abbreviation}) - {dept.region?.libelle}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier {!pv && '*'}
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              required={!pv}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB)
            </p>
            {pv && pv.url_pv && (
              <p className="text-xs text-blue-600 mt-1">
                Fichier actuel: {pv.url_pv.split('/').pop()}
              </p>
            )}
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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

export default PvDepartementManagement;
