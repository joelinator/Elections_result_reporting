/**
 * @file Composant principal pour la gestion des redressements
 */

import React, { useState, useEffect } from 'react';
import {
  redressementCandidatApi,
  redressementBureauVoteApi,
  bureauxVoteApi,
  partisPolitiquesApi,
  type RedressementCandidat,
  type RedressementBureauVote,
  type BureauVote,
  type PartiPolitique,
  type RedressementCandidatInput,
  type RedressementBureauVoteInput
} from '../api/redressementApi';
import { departementsApi } from '../api/commissionApi';
import { arrondissementApi } from '../api/arrondissementApi';

interface RedressementManagementProps {
  className?: string;
}

interface Departement {
  code: number;
  libelle: string;
  abbreviation?: string;
}

interface Arrondissement {
  code: number;
  libelle: string;
  abbreviation?: string;
  code_departement?: number;
}

export const RedressementManagement: React.FC<RedressementManagementProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'candidats' | 'bureaux'>('candidats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [redressementsCandidats, setRedressementsCandidats] = useState<RedressementCandidat[]>([]);
  const [redressementsBureaux, setRedressementsBureaux] = useState<RedressementBureauVote[]>([]);
  const [bureauxVote, setBureauxVote] = useState<BureauVote[]>([]);
  const [partis, setPartis] = useState<PartiPolitique[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);

  // États pour les modales
  const [showCandidatModal, setShowCandidatModal] = useState(false);
  const [showBureauModal, setShowBureauModal] = useState(false);
  const [editingCandidat, setEditingCandidat] = useState<RedressementCandidat | null>(null);
  const [editingBureau, setEditingBureau] = useState<RedressementBureauVote | null>(null);

  // Filtres
  const [selectedDepartement, setSelectedDepartement] = useState<number | ''>('');
  const [selectedArrondissement, setSelectedArrondissement] = useState<number | ''>('');
  const [selectedBureau, setSelectedBureau] = useState<number | ''>('');
  const [selectedParti, setSelectedParti] = useState<number | ''>('');

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Rechargement des données quand les filtres changent
  useEffect(() => {
    loadDataForActiveTab();
  }, [activeTab, selectedDepartement, selectedArrondissement, selectedBureau, selectedParti]);

  // Charger les arrondissements quand le département change
  useEffect(() => {
    if (selectedDepartement) {
      loadArrondissements();
    } else {
      setArrondissements([]);
    }
    setSelectedArrondissement('');
    setSelectedBureau('');
  }, [selectedDepartement]);

  // Charger les bureaux de vote quand l'arrondissement change
  useEffect(() => {
    if (selectedArrondissement) {
      loadBureauxVote();
    } else {
      setBureauxVote([]);
    }
    setSelectedBureau('');
  }, [selectedArrondissement]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [departementsData, partisData] = await Promise.all([
        departementsApi.getAll(),
        partisPolitiquesApi.getAll()
      ]);
      
      setDepartements(departementsData);
      setPartis(partisData);
      
      await loadDataForActiveTab();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadArrondissements = async () => {
    try {
      const data = await arrondissementApi.getAll({ 
        departement: selectedDepartement ? Number(selectedDepartement) : undefined 
      });
      setArrondissements(data);
    } catch (err) {
      console.error('Erreur lors du chargement des arrondissements:', err);
    }
  };

  const loadBureauxVote = async () => {
    try {
      const data = await bureauxVoteApi.getAll({ 
        arrondissement: selectedArrondissement ? Number(selectedArrondissement) : undefined 
      });
      setBureauxVote(data);
    } catch (err) {
      console.error('Erreur lors du chargement des bureaux de vote:', err);
    }
  };

  const loadDataForActiveTab = async () => {
    try {
      if (activeTab === 'candidats') {
        await loadRedressementsCandidats();
      } else {
        await loadRedressementsBureaux();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    }
  };

  const loadRedressementsCandidats = async () => {
    try {
      const filters: any = {};
      if (selectedBureau) filters.bureau_vote = Number(selectedBureau);
      if (selectedParti) filters.parti = Number(selectedParti);
      if (selectedArrondissement && !selectedBureau) filters.arrondissement = Number(selectedArrondissement);
      
      const data = await redressementCandidatApi.getAll(filters);
      setRedressementsCandidats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des redressements candidats:', err);
    }
  };

  const loadRedressementsBureaux = async () => {
    try {
      const filters: any = {};
      if (selectedBureau) filters.bureau_vote = Number(selectedBureau);
      if (selectedArrondissement && !selectedBureau) filters.arrondissement = Number(selectedArrondissement);
      if (selectedDepartement && !selectedArrondissement) filters.departement = Number(selectedDepartement);
      
      const data = await redressementBureauVoteApi.getAll(filters);
      setRedressementsBureaux(data);
    } catch (err) {
      console.error('Erreur lors du chargement des redressements bureaux:', err);
    }
  };

  const handleDeleteCandidat = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce redressement candidat ?')) return;
    
    try {
      await redressementCandidatApi.delete(id);
      await loadRedressementsCandidats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDeleteBureau = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce redressement bureau ?')) return;
    
    try {
      await redressementBureauVoteApi.delete(id);
      await loadRedressementsBureaux();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleTabChange = (tab: 'candidats' | 'bureaux') => {
    setActiveTab(tab);
    setError(null);
  };

  // Filtrer les arrondissements par département
  const filteredArrondissements = selectedDepartement
    ? arrondissements.filter(arr => arr.code_departement === Number(selectedDepartement))
    : arrondissements;

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
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Redressements</h2>
        <p className="text-gray-600 mt-1">
          Gérez les redressements des candidats et des bureaux de vote
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
            { key: 'candidats', label: 'Redressements Candidats', count: redressementsCandidats.length },
            { key: 'bureaux', label: 'Redressements Bureaux', count: redressementsBureaux.length }
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

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={selectedDepartement}
            onChange={(e) => setSelectedDepartement(e.target.value ? Number(e.target.value) : '')}
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
            value={selectedArrondissement}
            onChange={(e) => setSelectedArrondissement(e.target.value ? Number(e.target.value) : '')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedDepartement}
          >
            <option value="">Tous les arrondissements</option>
            {filteredArrondissements.map((arr) => (
              <option key={arr.code} value={arr.code}>
                {arr.libelle} ({arr.abbreviation})
              </option>
            ))}
          </select>

          <select
            value={selectedBureau}
            onChange={(e) => setSelectedBureau(e.target.value ? Number(e.target.value) : '')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedArrondissement}
          >
            <option value="">Tous les bureaux</option>
            {bureauxVote.map((bureau) => (
              <option key={bureau.code} value={bureau.code}>
                {bureau.designation}
              </option>
            ))}
          </select>

          {activeTab === 'candidats' && (
            <select
              value={selectedParti}
              onChange={(e) => setSelectedParti(e.target.value ? Number(e.target.value) : '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les partis</option>
              {partis.map((parti) => (
                <option key={parti.code} value={parti.code}>
                  {parti.designation} ({parti.abbreviation})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {activeTab === 'candidats' 
              ? `${redressementsCandidats.length} redressement(s) candidat(s)`
              : `${redressementsBureaux.length} redressement(s) bureau(x)`
            }
          </div>
          <button
            onClick={() => {
              if (activeTab === 'candidats') {
                setEditingCandidat(null);
                setShowCandidatModal(true);
              } else {
                setEditingBureau(null);
                setShowBureauModal(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {activeTab === 'candidats' ? 'Ajouter un redressement candidat' : 'Ajouter un redressement bureau'}
          </button>
        </div>

        {activeTab === 'candidats' ? (
          <RedressementsCandidatsView
            redressements={redressementsCandidats}
            onEdit={(redressement) => {
              setEditingCandidat(redressement);
              setShowCandidatModal(true);
            }}
            onDelete={handleDeleteCandidat}
          />
        ) : (
          <RedressementsBureauxView
            redressements={redressementsBureaux}
            onEdit={(redressement) => {
              setEditingBureau(redressement);
              setShowBureauModal(true);
            }}
            onDelete={handleDeleteBureau}
          />
        )}
      </div>

      {/* Modales */}
      {showCandidatModal && (
        <RedressementCandidatModal
          redressement={editingCandidat}
          bureauxVote={bureauxVote}
          partis={partis}
          onClose={() => {
            setShowCandidatModal(false);
            setEditingCandidat(null);
          }}
          onSave={async () => {
            await loadRedressementsCandidats();
            setShowCandidatModal(false);
            setEditingCandidat(null);
          }}
        />
      )}

      {showBureauModal && (
        <RedressementBureauModal
          redressement={editingBureau}
          bureauxVote={bureauxVote}
          onClose={() => {
            setShowBureauModal(false);
            setEditingBureau(null);
          }}
          onSave={async () => {
            await loadRedressementsBureaux();
            setShowBureauModal(false);
            setEditingBureau(null);
          }}
        />
      )}
    </div>
  );
};

// Composant pour afficher les redressements candidats
interface RedressementsCandidatsViewProps {
  redressements: RedressementCandidat[];
  onEdit: (redressement: RedressementCandidat) => void;
  onDelete: (id: number) => void;
}

const RedressementsCandidatsView: React.FC<RedressementsCandidatsViewProps> = ({ 
  redressements, 
  onEdit, 
  onDelete 
}) => (
  <div className="space-y-4">
    {redressements.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        Aucun redressement candidat trouvé
      </div>
    ) : (
      redressements.map((redressement) => {
        const difference = redressementCandidatApi.calculateDifference(
          redressement.nombre_vote_initial, 
          redressement.nombre_vote_redresse
        );
        const pourcentageChange = redressementCandidatApi.calculatePercentageChange(
          redressement.nombre_vote_initial, 
          redressement.nombre_vote_redresse
        );

        return (
          <div key={redressement.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {redressement.parti?.candidat?.noms_prenoms || redressement.parti?.designation}
                  </h3>
                  {redressement.parti?.abbreviation && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {redressement.parti.abbreviation}
                    </span>
                  )}
                  {redressement.parti?.coloration_bulletin && (
                    <div 
                      className="ml-2 w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: redressement.parti.coloration_bulletin }}
                    />
                  )}
                </div>

                <p className="text-gray-600 mb-3">
                  Bureau: {redressement.bureauVote?.designation} - {redressement.bureauVote?.arrondissement?.libelle}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {redressement.nombre_vote_initial || 0}
                    </div>
                    <div className="text-xs text-gray-600">Votes initiaux</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-800">
                      {redressement.nombre_vote_redresse || 0}
                    </div>
                    <div className="text-xs text-gray-600">Votes redressés</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${difference >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`text-lg font-bold ${difference >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </div>
                    <div className="text-xs text-gray-600">Différence</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${pourcentageChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`text-lg font-bold ${pourcentageChange >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {pourcentageChange > 0 ? '+' : ''}{pourcentageChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Changement</div>
                  </div>
                </div>

                {redressement.raison_redressement && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Raison du redressement :</div>
                    <div className="text-sm text-yellow-700">{redressement.raison_redressement}</div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Redressé le: {new Date(redressement.date_redressement).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(redressement)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(redressement.code)}
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
);

// Composant pour afficher les redressements bureaux
interface RedressementsBureauxViewProps {
  redressements: RedressementBureauVote[];
  onEdit: (redressement: RedressementBureauVote) => void;
  onDelete: (id: number) => void;
}

const RedressementsBureauxView: React.FC<RedressementsBureauxViewProps> = ({ 
  redressements, 
  onEdit, 
  onDelete 
}) => (
  <div className="space-y-4">
    {redressements.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        Aucun redressement bureau trouvé
      </div>
    ) : (
      redressements.map((redressement) => {
        const tauxInitial = redressementBureauVoteApi.calculateTauxParticipation(
          redressement.nombre_votant_initial, 
          redressement.nombre_inscrit_initial
        );
        const tauxRedresse = redressementBureauVoteApi.calculateTauxParticipation(
          redressement.nombre_votant_redresse, 
          redressement.nombre_inscrit_redresse
        );

        return (
          <div key={redressement.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {redressement.bureauVote?.designation}
                </h3>
                
                <p className="text-gray-600 mb-3">
                  {redressement.bureauVote?.arrondissement?.libelle} - {redressement.bureauVote?.arrondissement?.departement?.libelle}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-4">
                  {/* Données initiales */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Données initiales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Inscrits:</span>
                        <span className="font-medium">{redressement.nombre_inscrit_initial || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Votants:</span>
                        <span className="font-medium">{redressement.nombre_votant_initial || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux:</span>
                        <span className="font-medium">{tauxInitial.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bulletins nuls:</span>
                        <span className="font-medium">{redressement.bulletin_nul_initial || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suffrages valables:</span>
                        <span className="font-medium">{redressement.suffrage_exprime_valables_initial || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Données redressées */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-3">Données redressées</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Inscrits:</span>
                        <span className="font-medium">{redressement.nombre_inscrit_redresse || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Votants:</span>
                        <span className="font-medium">{redressement.nombre_votant_redresse || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux:</span>
                        <span className="font-medium">{tauxRedresse.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bulletins nuls:</span>
                        <span className="font-medium">{redressement.bulletin_nul_redresse || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suffrages valables:</span>
                        <span className="font-medium">{redressement.suffrage_exprime_valables_redresse || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Erreurs matérielles */}
                {(redressement.erreurs_materielles_initiales || redressement.erreurs_materielles_initiales_redresse) && (
                  <div className="bg-orange-50 p-3 rounded-lg mb-3">
                    <div className="text-sm font-medium text-orange-800 mb-2">Erreurs matérielles :</div>
                    {redressement.erreurs_materielles_initiales && (
                      <div className="text-sm text-orange-700 mb-1">
                        <span className="font-medium">Initiales:</span> {redressement.erreurs_materielles_initiales}
                      </div>
                    )}
                    {redressement.erreurs_materielles_initiales_redresse && (
                      <div className="text-sm text-orange-700">
                        <span className="font-medium">Redressées:</span> {redressement.erreurs_materielles_initiales_redresse}
                      </div>
                    )}
                  </div>
                )}

                {redressement.raison_redressement && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Raison du redressement :</div>
                    <div className="text-sm text-yellow-700">{redressement.raison_redressement}</div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Redressé le: {new Date(redressement.date_redressement).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(redressement)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(redressement.code)}
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
);

// Modal pour redressement candidat
interface RedressementCandidatModalProps {
  redressement: RedressementCandidat | null;
  bureauxVote: BureauVote[];
  partis: PartiPolitique[];
  onClose: () => void;
  onSave: () => void;
}

const RedressementCandidatModal: React.FC<RedressementCandidatModalProps> = ({ 
  redressement, 
  bureauxVote, 
  partis, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<RedressementCandidatInput>({
    code_bureau_vote: redressement?.code_bureau_vote || 0,
    code_parti: redressement?.code_parti || 0,
    nombre_vote_initial: redressement?.nombre_vote_initial || 0,
    nombre_vote_redresse: redressement?.nombre_vote_redresse || 0,
    raison_redressement: redressement?.raison_redressement || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difference = redressementCandidatApi.calculateDifference(
    formData.nombre_vote_initial, 
    formData.nombre_vote_redresse
  );
  const pourcentageChange = redressementCandidatApi.calculatePercentageChange(
    formData.nombre_vote_initial, 
    formData.nombre_vote_redresse
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code_bureau_vote || !formData.code_parti) {
      setError('Le bureau de vote et le parti sont requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (redressement) {
        await redressementCandidatApi.update(redressement.code, {
          nombre_vote_initial: formData.nombre_vote_initial,
          nombre_vote_redresse: formData.nombre_vote_redresse,
          raison_redressement: formData.raison_redressement
        });
      } else {
        await redressementCandidatApi.create(formData);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">
            {redressement ? 'Modifier le redressement candidat' : 'Nouveau redressement candidat'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Calculs en temps réel */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Calculs automatiques</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Différence: </span>
                <span className={`font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference > 0 ? '+' : ''}{difference} votes
                </span>
              </div>
              <div>
                <span className="text-blue-700">Changement: </span>
                <span className={`font-medium ${pourcentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pourcentageChange > 0 ? '+' : ''}{pourcentageChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bureau de vote *
              </label>
              <select
                value={formData.code_bureau_vote}
                onChange={(e) => setFormData({ ...formData, code_bureau_vote: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!redressement}
              >
                <option value={0}>Sélectionner un bureau</option>
                {bureauxVote.map((bureau) => (
                  <option key={bureau.code} value={bureau.code}>
                    {bureau.designation} - {bureau.arrondissement?.libelle}
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
                onChange={(e) => setFormData({ ...formData, code_parti: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!redressement}
              >
                <option value={0}>Sélectionner un parti</option>
                {partis.map((parti) => (
                  <option key={parti.code} value={parti.code}>
                    {parti.candidat?.noms_prenoms || parti.designation} ({parti.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votes initiaux
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_vote_initial}
                onChange={(e) => setFormData({ ...formData, nombre_vote_initial: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votes redressés
              </label>
              <input
                type="number"
                min="0"
                value={formData.nombre_vote_redresse}
                onChange={(e) => setFormData({ ...formData, nombre_vote_redresse: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison du redressement
            </label>
            <textarea
              value={formData.raison_redressement}
              onChange={(e) => setFormData({ ...formData, raison_redressement: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Expliquez la raison du redressement..."
            />
          </div>
          
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

// Modal pour redressement bureau
interface RedressementBureauModalProps {
  redressement: RedressementBureauVote | null;
  bureauxVote: BureauVote[];
  onClose: () => void;
  onSave: () => void;
}

const RedressementBureauModal: React.FC<RedressementBureauModalProps> = ({ 
  redressement, 
  bureauxVote, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<RedressementBureauVoteInput>({
    code_bureau_vote: redressement?.code_bureau_vote || 0,
    nombre_inscrit_initial: redressement?.nombre_inscrit_initial || 0,
    nombre_inscrit_redresse: redressement?.nombre_inscrit_redresse || 0,
    nombre_votant_initial: redressement?.nombre_votant_initial || 0,
    nombre_votant_redresse: redressement?.nombre_votant_redresse || 0,
    taux_participation_initial: redressement?.taux_participation_initial || 0,
    taux_participation_redresse: redressement?.taux_participation_redresse || 0,
    bulletin_nul_initial: redressement?.bulletin_nul_initial || 0,
    bulletin_nul_redresse: redressement?.bulletin_nul_redresse || 0,
    suffrage_exprime_valables_initial: redressement?.suffrage_exprime_valables_initial || 0,
    suffrage_exprime_valables_redresse: redressement?.suffrage_exprime_valables_redresse || 0,
    erreurs_materielles_initiales: redressement?.erreurs_materielles_initiales || '',
    erreurs_materielles_initiales_redresse: redressement?.erreurs_materielles_initiales_redresse || '',
    raison_redressement: redressement?.raison_redressement || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculs automatiques
  const tauxInitial = redressementBureauVoteApi.calculateTauxParticipation(
    formData.nombre_votant_initial, 
    formData.nombre_inscrit_initial
  );
  const tauxRedresse = redressementBureauVoteApi.calculateTauxParticipation(
    formData.nombre_votant_redresse, 
    formData.nombre_inscrit_redresse
  );

  // Validation en temps réel
  useEffect(() => {
    const validation = redressementBureauVoteApi.validateData(formData);
    setValidationErrors(validation.errors);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code_bureau_vote) {
      setError('Le bureau de vote est requis');
      return;
    }

    const validation = redressementBureauVoteApi.validateData(formData);
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
        taux_participation_initial: tauxInitial,
        taux_participation_redresse: tauxRedresse
      };
      
      if (redressement) {
        await redressementBureauVoteApi.update(redressement.code, dataToSave);
      } else {
        await redressementBureauVoteApi.create(dataToSave);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">
            {redressement ? 'Modifier le redressement bureau' : 'Nouveau redressement bureau'}
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

          {/* Sélection du bureau */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bureau de vote *
            </label>
            <select
              value={formData.code_bureau_vote}
              onChange={(e) => setFormData({ ...formData, code_bureau_vote: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!redressement}
            >
              <option value={0}>Sélectionner un bureau</option>
              {bureauxVote.map((bureau) => (
                <option key={bureau.code} value={bureau.code}>
                  {bureau.designation} - {bureau.arrondissement?.libelle}
                </option>
              ))}
            </select>
          </div>

          {/* Calculs automatiques */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Taux de participation calculés</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Taux initial: </span>
                <span className="font-medium">{tauxInitial.toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-blue-700">Taux redressé: </span>
                <span className="font-medium">{tauxRedresse.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Données principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Colonnes initiales */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 border-b pb-2">Données initiales</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'inscrits initial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_inscrit_initial}
                  onChange={(e) => setFormData({ ...formData, nombre_inscrit_initial: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de votants initial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_votant_initial}
                  onChange={(e) => setFormData({ ...formData, nombre_votant_initial: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulletins nuls initial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bulletin_nul_initial}
                  onChange={(e) => setFormData({ ...formData, bulletin_nul_initial: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suffrages valables initial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.suffrage_exprime_valables_initial}
                  onChange={(e) => setFormData({ ...formData, suffrage_exprime_valables_initial: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Colonnes redressées */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 border-b pb-2">Données redressées</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'inscrits redressé
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_inscrit_redresse}
                  onChange={(e) => setFormData({ ...formData, nombre_inscrit_redresse: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de votants redressé
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombre_votant_redresse}
                  onChange={(e) => setFormData({ ...formData, nombre_votant_redresse: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulletins nuls redressé
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bulletin_nul_redresse}
                  onChange={(e) => setFormData({ ...formData, bulletin_nul_redresse: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suffrages valables redressé
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.suffrage_exprime_valables_redresse}
                  onChange={(e) => setFormData({ ...formData, suffrage_exprime_valables_redresse: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Erreurs matérielles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Erreurs matérielles initiales
              </label>
              <textarea
                value={formData.erreurs_materielles_initiales}
                onChange={(e) => setFormData({ ...formData, erreurs_materielles_initiales: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Erreurs matérielles redressées
              </label>
              <textarea
                value={formData.erreurs_materielles_initiales_redresse}
                onChange={(e) => setFormData({ ...formData, erreurs_materielles_initiales_redresse: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          {/* Raison du redressement */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison du redressement
            </label>
            <textarea
              value={formData.raison_redressement}
              onChange={(e) => setFormData({ ...formData, raison_redressement: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Expliquez la raison du redressement..."
            />
          </div>
          
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

export default RedressementManagement;