/**
 * @file Composant principal pour la gestion des participations départementales
 */

import React, { useState, useEffect } from 'react';
import {
  participationDepartementApi,
  type ParticipationDepartement,
  type ParticipationDepartementInput
} from '../api/participationApi';
import { departementsApi } from '../api/commissionApi';
import { regionsApi } from '../api/arrondissementApi';
import { useAuth } from '../contexts/AuthContext';

interface ParticipationManagementProps {
  className?: string;
}

interface Region {
  code: number;
  libelle: string;
  abbreviation?: string;
}

interface Departement {
  code: number;
  libelle: string;
  abbreviation?: string;
  region?: {
    code: number;
    libelle: string;
    abbreviation?: string;
  };
}

export const ParticipationManagement: React.FC<ParticipationManagementProps> = ({ className = '' }) => {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les permissions - seuls les administrateurs peuvent accéder
  if (!user || !hasRole([1])) { // 1 = Administrateur
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Seuls les administrateurs peuvent accéder à la gestion des participations départementales.
          </p>
          <p className="text-sm text-gray-500">
            Votre rôle actuel ne vous permet pas d'accéder à cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // États pour les données
  const [participations, setParticipations] = useState<ParticipationDepartement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // États pour les modales
  const [showModal, setShowModal] = useState(false);
  const [editingParticipation, setEditingParticipation] = useState<ParticipationDepartement | null>(null);

  // Filtres
  const [selectedRegion, setSelectedRegion] = useState<number | ''>('');
  const [selectedDepartement, setSelectedDepartement] = useState<number | ''>('');

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Rechargement des participations quand les filtres changent
  useEffect(() => {
    loadParticipations();
  }, [selectedRegion, selectedDepartement]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [regionsData, departementsData] = await Promise.all([
        regionsApi.getAll(),
        departementsApi.getAll()
      ]);
      
      setRegions(regionsData);
      setDepartements(departementsData);
      
      await loadParticipations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipations = async () => {
    try {
      const filters: any = {};
      if (selectedRegion) filters.region = Number(selectedRegion);
      if (selectedDepartement) filters.departement = Number(selectedDepartement);
      
      const data = await participationDepartementApi.getAll(filters);
      setParticipations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des participations');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette participation ?')) return;
    
    try {
      await participationDepartementApi.delete(id);
      await loadParticipations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // Filtrer les départements par région sélectionnée
  const filteredDepartements = selectedRegion
    ? departements.filter(dept => dept.region?.code === Number(selectedRegion))
    : departements;

  // Calculer les statistiques
  const totalInscrits = participations.reduce((sum, p) => sum + p.nombre_inscrit, 0);
  const totalVotants = participations.reduce((sum, p) => sum + p.nombre_votant, 0);
  const totalSuffragesValables = participations.reduce((sum, p) => sum + p.nombre_suffrages_valable, 0);
  const tauxParticipationMoyen = totalInscrits > 0 ? (totalVotants / totalInscrits) * 100 : 0;

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
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Participations Départementales</h2>
        <p className="text-gray-600 mt-1">
          Gérez les données de participation électorale par département
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

      {/* Statistiques générales */}
      {participations.length > 0 && (
        <div className="mx-6 mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{participations.length}</div>
            <div className="text-sm text-gray-600">Départements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalInscrits.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Inscrits total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalVotants.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Votants total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{tauxParticipationMoyen.toFixed(2)}%</div>
            <div className="text-sm text-gray-600">Taux moyen</div>
          </div>
        </div>
      )}

      {/* Filters and Add button */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value ? Number(e.target.value) : '');
                setSelectedDepartement(''); // Reset département
              }}
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
              onChange={(e) => setSelectedDepartement(e.target.value ? Number(e.target.value) : '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les départements</option>
              {filteredDepartements.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.libelle} ({dept.abbreviation})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditingParticipation(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Ajouter une participation
          </button>
        </div>

        {/* Participations list */}
        <div className="space-y-4">
          {participations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune participation trouvée
            </div>
          ) : (
            participations.map((participation) => (
              <ParticipationCard
                key={participation.code}
                participation={participation}
                onEdit={() => {
                  setEditingParticipation(participation);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(participation.code)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ParticipationModal
          participation={editingParticipation}
          departements={departements}
          onClose={() => {
            setShowModal(false);
            setEditingParticipation(null);
          }}
          onSave={async () => {
            await loadParticipations();
            setShowModal(false);
            setEditingParticipation(null);
          }}
        />
      )}
    </div>
  );
};

// Composant pour afficher une carte de participation
interface ParticipationCardProps {
  participation: ParticipationDepartement;
  onEdit: () => void;
  onDelete: () => void;
}

const ParticipationCard: React.FC<ParticipationCardProps> = ({ participation, onEdit, onDelete }) => {
  const tauxParticipation = participation.taux_participation || 
    participationDepartementApi.calculateTauxParticipation(participation.nombre_votant, participation.nombre_inscrit);
  
  const suffrageExprime = participation.suffrage_exprime ||
    participationDepartementApi.calculateSuffrageExprime(participation.nombre_suffrages_valable, participation.nombre_votant);

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {participation.departement?.libelle} ({participation.departement?.abbreviation})
            </h3>
            {participation.departement?.region && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {participation.departement.region.libelle}
              </span>
            )}
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-800">{participation.nombre_inscrit.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Inscrits</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-800">{participation.nombre_votant.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Votants</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-800">{tauxParticipation.toFixed(2)}%</div>
              <div className="text-xs text-gray-600">Taux participation</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-800">{participation.nombre_suffrages_valable.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Suffrages valables</div>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
            <div>Bureaux de vote: <span className="font-medium">{participation.nombre_bureau_vote}</span></div>
            <div>Bulletins nuls: <span className="font-medium">{participation.bulletin_nul}</span></div>
            <div>Enveloppes urnes: <span className="font-medium">{participation.nombre_enveloppe_urnes}</span></div>
            <div>Enveloppes vides: <span className="font-medium">{participation.nombre_enveloppe_vide}</span></div>
            <div>Non ELECAM: <span className="font-medium">{participation.nombre_enveloppe_non_elecam}</span></div>
            <div>Suffrage exprimé: <span className="font-medium">{suffrageExprime.toFixed(2)}%</span></div>
          </div>

          {/* Date de création */}
          {participation.date_creation && (
            <div className="mt-3 text-xs text-gray-500">
              Créé le: {new Date(participation.date_creation).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
          >
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal pour créer/modifier une participation
interface ParticipationModalProps {
  participation: ParticipationDepartement | null;
  departements: Departement[];
  onClose: () => void;
  onSave: () => void;
}

const ParticipationModal: React.FC<ParticipationModalProps> = ({ 
  participation, 
  departements, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<ParticipationDepartementInput>({
    code_departement: participation?.code_departement || 0,
    nombre_bureau_vote: participation?.nombre_bureau_vote || 0,
    nombre_inscrit: participation?.nombre_inscrit || 0,
    nombre_enveloppe_urnes: participation?.nombre_enveloppe_urnes || 0,
    nombre_enveloppe_bulletins_differents: participation?.nombre_enveloppe_bulletins_differents || 0,
    nombre_bulletin_electeur_identifiable: participation?.nombre_bulletin_electeur_identifiable || 0,
    nombre_bulletin_enveloppes_signes: participation?.nombre_bulletin_enveloppes_signes || 0,
    nombre_enveloppe_non_elecam: participation?.nombre_enveloppe_non_elecam || 0,
    nombre_bulletin_non_elecam: participation?.nombre_bulletin_non_elecam || 0,
    nombre_bulletin_sans_enveloppe: participation?.nombre_bulletin_sans_enveloppe || 0,
    nombre_enveloppe_vide: participation?.nombre_enveloppe_vide || 0,
    nombre_suffrages_valable: participation?.nombre_suffrages_valable || 0,
    nombre_votant: participation?.nombre_votant || 0,
    bulletin_nul: participation?.bulletin_nul || 0,
    suffrage_exprime: participation?.suffrage_exprime,
    taux_participation: participation?.taux_participation
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculs automatiques
  const calculatedTauxParticipation = participationDepartementApi.calculateTauxParticipation(
    formData.nombre_votant, 
    formData.nombre_inscrit
  );

  const calculatedSuffrageExprime = participationDepartementApi.calculateSuffrageExprime(
    formData.nombre_suffrages_valable, 
    formData.nombre_votant
  );

  // Validation en temps réel
  useEffect(() => {
    const validation = participationDepartementApi.validateData(formData);
    setValidationErrors(validation.errors);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code_departement) {
      setError('Le département est requis');
      return;
    }

    const validation = participationDepartementApi.validateData(formData);
    if (!validation.isValid) {
      setError('Veuillez corriger les erreurs de validation');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Mettre à jour les calculs automatiques
      const dataToSave = {
        ...formData,
        taux_participation: calculatedTauxParticipation,
        suffrage_exprime: calculatedSuffrageExprime
      };
      
      if (participation) {
        await participationDepartementApi.update(participation.code, dataToSave);
      } else {
        await participationDepartementApi.create(dataToSave);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (field: keyof ParticipationDepartementInput, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">
            {participation ? 'Modifier la participation' : 'Nouvelle participation'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-yellow-800 text-sm font-medium mb-2">Erreurs de validation :</div>
              <ul className="text-yellow-700 text-sm list-disc list-inside">
                {validationErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Sélection du département */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département *
            </label>
            <select
              value={formData.code_departement}
              onChange={(e) => setFormData({ ...formData, code_departement: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!participation} // Désactiver pour modification
            >
              <option value={0}>Sélectionner un département</option>
              {departements.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.libelle} ({dept.abbreviation}) - {dept.region?.libelle}
                </option>
              ))}
            </select>
          </div>

          {/* Calculs automatiques */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Calculs automatiques</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Taux de participation: </span>
                <span className="font-medium">{calculatedTauxParticipation.toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-blue-700">Suffrage exprimé: </span>
                <span className="font-medium">{calculatedSuffrageExprime.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Champs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de bureaux de vote
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_bureau_vote}
                onChange={(e) => handleNumberChange('nombre_bureau_vote', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'inscrits
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_inscrit}
                onChange={(e) => handleNumberChange('nombre_inscrit', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de votants
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_votant}
                onChange={(e) => handleNumberChange('nombre_votant', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suffrages valables
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_suffrages_valable}
                onChange={(e) => handleNumberChange('nombre_suffrages_valable', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulletins nuls
              </label>
              <input
                type="number"
                min="0"
                value={formData.bulletin_nul}
                onChange={(e) => handleNumberChange('bulletin_nul', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enveloppes urnes
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_enveloppe_urnes}
                onChange={(e) => handleNumberChange('nombre_enveloppe_urnes', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Champs détaillés (collapsible) */}
          <details className="mb-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Détails supplémentaires (cliquer pour développer)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enveloppes bulletins différents
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_enveloppe_bulletins_differents}
                  onChange={(e) => handleNumberChange('nombre_enveloppe_bulletins_differents', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulletins électeur identifiable
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_bulletin_electeur_identifiable}
                  onChange={(e) => handleNumberChange('nombre_bulletin_electeur_identifiable', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulletins enveloppes signés
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_bulletin_enveloppes_signes}
                  onChange={(e) => handleNumberChange('nombre_bulletin_enveloppes_signes', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enveloppes non ELECAM
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_enveloppe_non_elecam}
                  onChange={(e) => handleNumberChange('nombre_enveloppe_non_elecam', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulletins non ELECAM
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_bulletin_non_elecam}
                  onChange={(e) => handleNumberChange('nombre_bulletin_non_elecam', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulletins sans enveloppe
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_bulletin_sans_enveloppe}
                  onChange={(e) => handleNumberChange('nombre_bulletin_sans_enveloppe', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enveloppes vides
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_enveloppe_vide}
                  onChange={(e) => handleNumberChange('nombre_enveloppe_vide', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </details>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              disabled={loading || validationErrors.length > 0}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipationManagement;
