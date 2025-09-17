// SubmissionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPollingStationsByArrondissement, submitResults } from '../api/submissionApi';
import PollingStationList from '../components/pollingStationList';
import SubmissionForm from '../components/submissionForm';
import type { PollingStation, VoterStats, PartyVotes } from '../data/submissionData';

const SubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
// Add these state variables at the top of your component
const [searchTerm, setSearchTerm] = useState('');
const [showSubmitted, setShowSubmitted] = useState(true);
const [showPending, setShowPending] = useState(true);


const [filterStatus, setFilterStatus] = useState('all');

const filteredStations = pollingStations.filter(station => {
  // Filter by search term
  const matchesSearch = searchTerm === '' || 
    station.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.code.toString().includes(searchTerm);
  
  // Filter by status
  const matchesStatus = 
    filterStatus === 'all' ||
    (filterStatus === 'submitted' && station.data_filled === 1) ||
    (filterStatus === 'pending' && station.data_filled === 1);
  
  return matchesSearch && matchesStatus;
});

  useEffect(() => {
    loadPollingStations();
  }, [user]);

  const loadPollingStations = async () => {
    // Get the first arrondissement code from user's arrondissements array
    const arrondissementCode = user?.arrondissements?.[0]?.code;
    
    if (!arrondissementCode) {
      setError('Aucun arrondissement associé à votre compte');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const stations = await getPollingStationsByArrondissement(arrondissementCode);
      console.log(stations);
      setPollingStations(stations);
    } catch (err) {
      setError('Erreur lors du chargement des bureaux de vote');
      console.error('Error loading polling stations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationSelect = (station: PollingStation) => {
    if (station.data_filled === 1) {
      // Show view-only modal for already submitted stations
      return;
    }
    setSelectedStation(station);
  };

  const handleSubmitResults = async (voterStats: VoterStats, partyVotes: PartyVotes[], imageFile: File | undefined) => {
    if (!selectedStation || !user) return;
    
    try {
      await submitResults({
        userId: user.code, // Use user.code instead of user.id
        pollingStationId: selectedStation.code,
        voterStats,
        partyVotes,
        imageFile
      });
      
      // Update local state to mark station as submitted
      setPollingStations(prev => prev.map(station => 
        station.code === selectedStation.code 
          ? { ...station, data_filled: 1 }
          : station
      ));
      
      setSelectedStation(null);
      // Show success message
    } catch (err) {
      console.error('Error submitting results:', err);
      // Show error message
    }
  };

  const handleCloseForm = () => {
    setSelectedStation(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des bureaux de vote...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saisie des résultats</h1>
        <p className="text-gray-600">
          Sélectionnez un bureau de vote pour saisir les résultats. Les bureaux déjà complétés sont indiqués par une coche verte.
        </p>
        {user?.arrondissements && user.arrondissements.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Arrondissement: {user.arrondissements[0].libelle}
          </p>
        )}
      </div>

      {/* Compact Search Bar */}
<div className="bg-white shadow rounded-lg p-4">
  <div className="flex items-center gap-4">
    <div className="flex-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Rechercher un bureau de vote..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <select
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">Tous</option>
        <option value="submitted">Soumis</option>
        <option value="pending">En attente</option>
      </select>
    </div>
  </div>
</div>

      <PollingStationList
        pollingStations={filteredStations}
        onStationSelect={handleStationSelect}
      />

      {selectedStation && (
        <SubmissionForm
          station={selectedStation}
          onSubmit={handleSubmitResults}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default SubmissionPage;