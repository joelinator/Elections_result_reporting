/**
 * @file Composant principal pour la gestion des participations d'arrondissement
 */

import React, { useState, useEffect } from 'react';
import {
  participationArrondissementApi,
  type ParticipationArrondissement,
  type ParticipationArrondissementInput
} from '../api/participationArrondissementApi';
import { arrondissementApi } from '../api/arrondissementApi';
import { departementsApi } from '../api/commissionApi';
import { regionsApi } from '../api/arrondissementApi';
import { useAuth } from '../contexts/AuthContext';

interface ParticipationArrondissementManagementProps {
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

interface Arrondissement {
  code: number;
  libelle: string;
  abbreviation?: string;
  departement?: {
    code: number;
    libelle: string;
    abbreviation?: string;
  };
}

export const ParticipationArrondissementManagement: React.FC<ParticipationArrondissementManagementProps> = ({ className = '' }) => {
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
            Seuls les administrateurs et scrutateurs départementaux peuvent accéder à la gestion des participations d'arrondissement.
          </p>
          <p className="text-sm text-gray-500">
            Votre rôle actuel ne vous permet pas d'accéder à cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // États pour les données
  const [participations, setParticipations] = useState<ParticipationArrondissement[]>([]);
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // États pour les modales
  const [showModal, setShowModal] = useState(false);
  const [editingParticipation, setEditingParticipation] = useState<ParticipationArrondissement | null>(null);

  // Filtres
  const [selectedRegion, setSelectedRegion] = useState<number | ''>('');
  const [selectedDepartement, setSelectedDepartement] = useState<number | ''>('');
  const [selectedArrondissement, setSelectedArrondissement] = useState<number | ''>('');

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Rechargement des participations quand les filtres changent
  useEffect(() => {
    loadParticipations();
  }, [selectedRegion, selectedDepartement, selectedArrondissement]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [regionsData, departementsData, arrondissementsData] = await Promise.all([
        regionsApi.getAll(),
        departementsApi.getAll(),
        arrondissementApi.getAll()
      ]);
      
      setRegions(regionsData);
      setDepartements(departementsData);
      setArrondissements(arrondissementsData);
      
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
      if (selectedArrondissement) filters.arrondissement = Number(selectedArrondissement);
      
      const data = await participationArrondissementApi.getAll(filters);
      setParticipations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des participations');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette participation ?')) return;
    
    try {
      await participationArrondissementApi.delete(id);
      await loadParticipations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // Filtrer les départements par région sélectionnée
  const filteredDepartements = selectedRegion
    ? departements.filter(dept => dept.region?.code === Number(selectedRegion))
    : departements;

  // Filtrer les arrondissements par département sélectionné
  const filteredArrondissements = selectedDepartement
    ? arrondissements.filter(arr => arr.departement?.code === Number(selectedDepartement))
    : arrondissements;

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
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Participations d'Arrondissement</h2>
        <p className="text-gray-600 mt-1">
          Gérez les données de participation électorale par arrondissement
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
            <div className="text-sm text-gray-600">Arrondissements</div>
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
                setSelectedArrondissement(''); // Reset arrondissement
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
              onChange={(e) => {
                setSelectedDepartement(e.target.value ? Number(e.target.value) : '');
                setSelectedArrondissement(''); // Reset arrondissement
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les départements</option>
              {filteredDepartements.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.libelle} ({dept.abbreviation})
                </option>
              ))}
            </select>

            <select
              value={selectedArrondissement}
              onChange={(e) => setSelectedArrondissement(e.target.value ? Number(e.target.value) : '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les arrondissements</option>
              {filteredArrondissements.map((arr) => (
                <option key={arr.code} value={arr.code}>
                  {arr.libelle} ({arr.abbreviation})
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
              <ParticipationArrondissementCard
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
        <ParticipationArrondissementModal
          participation={editingParticipation}
          arrondissements={arrondissements}
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

// Composant pour afficher une carte de participation d'arrondissement
interface ParticipationArrondissementCardProps {
  participation: ParticipationArrondissement;
  onEdit: () => void;
  onDelete: () => void;
}

const ParticipationArrondissementCard: React.FC<ParticipationArrondissementCardProps> = ({ participation, onEdit, onDelete }) => {
  const tauxParticipation = participation.taux_participation || 
    participationArrondissementApi.calculateTauxParticipation(participation.nombre_votant, participation.nombre_inscrit);
  
  const suffrageExprime = participation.suffrage_exprime ||
    participationArrondissementApi.calculateSuffrageExprime(participation.nombre_suffrages_valable, participation.nombre_votant);

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {participation.arrondissement?.libelle} ({participation.arrondissement?.abbreviation})
            </h3>
            {participation.arrondissement?.departement && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {participation.arrondissement.departement.libelle}
              </span>
            )}
            {participation.arrondissement?.departement?.region && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                {participation.arrondissement.departement.region.libelle}
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

// Modal pour créer/modifier une participation d'arrondissement
interface ParticipationArrondissementModalProps {
  participation: ParticipationArrondissement | null;
  arrondissements: Arrondissement[];
  onClose: () => void;
  onSave: () => void;
}

const ParticipationArrondissementModal: React.FC<ParticipationArrondissementModalProps> = ({ 
  participation, 
  arrondissements, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<ParticipationArrondissementInput>({
    code_arrondissement: participation?.code_arrondissement || 0,
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
  const calculatedTauxParticipation = participationArrondissementApi.calculateTauxParticipation(
    formData.nombre_votant, 
    formData.nombre_inscrit
  );

  const calculatedSuffrageExprime = participationArrondissementApi.calculateSuffrageExprime(
    formData.nombre_suffrages_valable, 
    formData.nombre_votant
  );

  // Validation en temps réel
  useEffect(() => {
    const validation = participationArrondissementApi.validateData(formData);
    setValidationErrors(validation.errors);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code_arrondissement) {
      setError('L\'arrondissement est requis');
      return;
    }

    const validation = participationArrondissementApi.validateData(formData);
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
        await participationArrondissementApi.update(participation.code, dataToSave);
      } else {
        await participationArrondissementApi.create(dataToSave);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (field: keyof ParticipationArrondissementInput, value: string) => {
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
          
          {/* Sélection de l'arrondissement */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrondissement *
            </label>
            <select
              value={formData.code_arrondissement}
              onChange={(e) => setFormData({ ...formData, code_arrondissement: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!participation} // Désactiver pour modification
            >
              <option value={0}>Sélectionner un arrondissement</option>
              {arrondissements.map((arr) => (
                <option key={arr.code} value={arr.code}>
                  {arr.libelle} ({arr.abbreviation}) - {arr.departement?.libelle}
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

export default ParticipationArrondissementManagement;
