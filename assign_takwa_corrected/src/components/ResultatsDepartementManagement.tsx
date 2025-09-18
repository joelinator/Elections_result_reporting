/**
 * @file Composant principal pour la gestion des résultats par département
 */

import React, { useState, useEffect } from 'react';
import {
  resultatsDepartementApi,
  type ResultatDepartement,
  type PartiPolitique,
  type Departement
} from '../api/resultatsDepartementApi';
import { departementsApi } from '../api/commissionApi';
import { partisPolitiquesApi } from '../api/redressementApi';
import { regionsApi } from '../api/arrondissementApi';
import { useAuth } from '../contexts/AuthContext';

interface ResultatsDepartementManagementProps {
  className?: string;
}

export const ResultatsDepartementManagement: React.FC<ResultatsDepartementManagementProps> = ({ className = '' }) => {
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
            Seuls les administrateurs et scrutateurs départementaux peuvent accéder à la gestion des résultats par département.
          </p>
          <p className="text-sm text-gray-500">
            Votre rôle actuel ne vous permet pas d'accéder à cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // États pour les données
  const [resultats, setResultats] = useState<ResultatDepartement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [partis, setPartis] = useState<PartiPolitique[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  // États pour les modales
  const [showResultatModal, setShowResultatModal] = useState(false);

  // États pour l'édition
  const [editingResultat, setEditingResultat] = useState<ResultatDepartement | null>(null);

  // Filtres
  const [selectedRegion, setSelectedRegion] = useState<number | ''>('');
  const [selectedDepartement, setSelectedDepartement] = useState<number | ''>('');
  const [selectedParti, setSelectedParti] = useState<number | ''>('');

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Rechargement des résultats quand les filtres changent
  useEffect(() => {
    loadResultats();
  }, [selectedRegion, selectedDepartement, selectedParti]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [departementsData, partisData, regionsData] = await Promise.all([
        departementsApi.getAll(),
        partisPolitiquesApi.getAll(),
        regionsApi.getAll()
      ]);
      
      setDepartements(departementsData);
      setPartis(partisData);
      setRegions(regionsData);
      
      await loadResultats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadResultats = async () => {
    try {
      const filters: any = {};
      if (selectedRegion) filters.region = Number(selectedRegion);
      if (selectedDepartement) filters.departement = Number(selectedDepartement);
      if (selectedParti) filters.parti = Number(selectedParti);
      
      const data = await resultatsDepartementApi.getAll(filters);
      setResultats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des résultats');
    }
  };

  const handleDeleteResultat = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce résultat ?')) return;
    
    try {
      await resultatsDepartementApi.delete(id);
      await loadResultats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // Filtrer les départements par région sélectionnée
  const filteredDepartements = selectedRegion
    ? departements.filter(dept => dept.region?.code === Number(selectedRegion))
    : departements;

  // Calculer les statistiques
  const totalVotes = resultats.reduce((sum, resultat) => sum + resultat.nombre_vote, 0);
  const departementsAvecResultats = new Set(resultats.map(r => r.code_departement)).size;
  const partisAvecResultats = new Set(resultats.map(r => r.code_parti)).size;

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
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Résultats par Département</h2>
        <p className="text-gray-600 mt-1">
          Gérez les résultats électoraux par département et parti politique
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
      {resultats.length > 0 && (
        <div className="mx-6 mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{resultats.length}</div>
            <div className="text-sm text-gray-600">Résultats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalVotes.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{departementsAvecResultats}</div>
            <div className="text-sm text-gray-600">Départements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{partisAvecResultats}</div>
            <div className="text-sm text-gray-600">Partis</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <ResultatsTab
          resultats={resultats}
          regions={regions}
          departements={filteredDepartements}
          partis={partis}
          selectedRegion={selectedRegion}
          selectedDepartement={selectedDepartement}
          selectedParti={selectedParti}
          onRegionChange={setSelectedRegion}
          onDepartementChange={setSelectedDepartement}
          onPartiChange={setSelectedParti}
          onEdit={(resultat) => {
            setEditingResultat(resultat);
            setShowResultatModal(true);
          }}
          onDelete={handleDeleteResultat}
          onAdd={() => {
            setEditingResultat(null);
            setShowResultatModal(true);
          }}
        />
      </div>

      {/* Modale */}
      {showResultatModal && (
        <ResultatModal
          resultat={editingResultat}
          departements={departements}
          partis={partis}
          onClose={() => {
            setShowResultatModal(false);
            setEditingResultat(null);
          }}
          onSave={async () => {
            await loadResultats();
            setShowResultatModal(false);
            setEditingResultat(null);
          }}
        />
      )}
    </div>
  );
};

// Composant pour l'onglet Résultats
interface ResultatsTabProps {
  resultats: ResultatDepartement[];
  regions: any[];
  departements: Departement[];
  partis: PartiPolitique[];
  selectedRegion: number | '';
  selectedDepartement: number | '';
  selectedParti: number | '';
  onRegionChange: (value: number | '') => void;
  onDepartementChange: (value: number | '') => void;
  onPartiChange: (value: number | '') => void;
  onEdit: (resultat: ResultatDepartement) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const ResultatsTab: React.FC<ResultatsTabProps> = ({
  resultats,
  regions,
  departements,
  partis,
  selectedRegion,
  selectedDepartement,
  selectedParti,
  onRegionChange,
  onDepartementChange,
  onPartiChange,
  onEdit,
  onDelete,
  onAdd
}) => {
  // Calculer le total des votes pour les pourcentages
  const totalVotes = resultats.reduce((sum, resultat) => sum + resultat.nombre_vote, 0);

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

          <select
            value={selectedParti}
            onChange={(e) => onPartiChange(e.target.value ? Number(e.target.value) : '')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les partis</option>
            {partis.map((parti) => (
              <option key={parti.code} value={parti.code}>
                {parti.designation} ({parti.abbreviation})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Ajouter un résultat
        </button>
      </div>

      {/* Résultats list */}
      <div className="grid gap-4">
        {resultats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun résultat trouvé
          </div>
        ) : (
          resultats.map((resultat) => {
            const pourcentage = totalVotes > 0 ? (resultat.nombre_vote / totalVotes) * 100 : 0;
            return (
              <div key={resultat.code} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {resultat.parti?.designation || 'Parti inconnu'}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-blue-600">
                          {resultat.nombre_vote.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">votes</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {resultat.parti?.abbreviation && (
                        <p className="text-gray-600 text-sm">
                          Parti: {resultat.parti.abbreviation}
                        </p>
                      )}
                      {resultat.departement && (
                        <p className="text-gray-600 text-sm">
                          Département: {resultat.departement.libelle} ({resultat.departement.abbreviation})
                        </p>
                      )}
                      {resultat.departement?.region && (
                        <p className="text-gray-600 text-sm">
                          Région: {resultat.departement.region.libelle} ({resultat.departement.region.abbreviation})
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span>Pourcentage</span>
                        <span className="font-medium">{pourcentage.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pourcentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                      {resultat.date_creation && (
                        <span>Créé le: {new Date(resultat.date_creation).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(resultat)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(resultat.code)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Modale pour Résultat
interface ResultatModalProps {
  resultat: ResultatDepartement | null;
  departements: Departement[];
  partis: PartiPolitique[];
  onClose: () => void;
  onSave: () => void;
}

const ResultatModal: React.FC<ResultatModalProps> = ({ 
  resultat, 
  departements, 
  partis, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    code_departement: resultat?.code_departement || '',
    code_parti: resultat?.code_parti || '',
    nombre_vote: resultat?.nombre_vote || '',
    pourcentage: resultat?.pourcentage || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code_departement || !formData.code_parti || !formData.nombre_vote) {
      setError('Le département, le parti et le nombre de votes sont requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        code_departement: Number(formData.code_departement),
        code_parti: Number(formData.code_parti),
        nombre_vote: Number(formData.nombre_vote),
        pourcentage: formData.pourcentage ? Number(formData.pourcentage) : undefined
      };
      
      if (resultat) {
        await resultatsDepartementApi.update(resultat.code, submitData);
      } else {
        await resultatsDepartementApi.create(submitData);
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
          {resultat ? 'Modifier le résultat' : 'Nouveau résultat'}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département *
            </label>
            <select
              value={formData.code_departement}
              onChange={(e) => setFormData({ ...formData, code_departement: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
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
              Parti politique *
            </label>
            <select
              value={formData.code_parti}
              onChange={(e) => setFormData({ ...formData, code_parti: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un parti</option>
              {partis.map((parti) => (
                <option key={parti.code} value={parti.code}>
                  {parti.designation} ({parti.abbreviation})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de votes *
            </label>
            <input
              type="number"
              min="0"
              value={formData.nombre_vote}
              onChange={(e) => setFormData({ ...formData, nombre_vote: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pourcentage (optionnel)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.pourcentage}
              onChange={(e) => setFormData({ ...formData, pourcentage: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Calculé automatiquement si vide"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si vide, le pourcentage sera calculé automatiquement
            </p>
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

export default ResultatsDepartementManagement;
