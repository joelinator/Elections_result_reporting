import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPollingStationResults,
  updatePollingStationResult,
  validatePollingStationResult,
  validateMultipleResults,
  getPVForBureau,
  getParticipationByBureau,
  updateParticipation,
  type PV
} from '../api/electionApi';

interface PartiPolitique {
  code: number;
  designation: string;
  abbreviation: string;
  coloration_bulletin: string;
}

interface Bureau {
  code: number;
  designation: string;
  code_arrondissement: number;
  description?: string;
}

interface PollingStationResult {
  code: number;
  code_bureau: number;
  bureau: Bureau;
  code_parti_politique: number;
  parti_politique: PartiPolitique;
  nombre_vote: number;
  statut_validation: number;
  code_createur: string;
  code_modificateur: string | null;
  date_creation: string;
  date_modification: string | null;
}

interface GroupedResult {
  bureau_code: number;
  bureau: Bureau;
  results: PollingStationResult[];
  total_votes: number;
  validation_status: number;
}

interface Participation {
  code: number;
  code_bureau_vote: number;
  nombre_inscrit: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime: number;
  taux_participation: number;
  code_createur: number;
  code_modificateur: number;
  date_creation: string;
  date_modification: string;
}

// Utility function to clean PV URLs
const cleanPVUrl = (url: string): string => {
  if (!url) return url;
  let cleanUrl = url.replace(/\/?uploads\/pv\//, '/pv/');
  return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
};

const ValidationResultsNew: React.FC = () => {
  const [selectedBureau, setSelectedBureau] = useState<string>('all');
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [editingVotes, setEditingVotes] = useState<{ [key: string]: number }>({});
  const [validationStatus, setValidationStatus] = useState<number>(0);

  // Modal states
  const [pvModalOpen, setPvModalOpen] = useState(false);
  const [participationModalOpen, setParticipationModalOpen] = useState(false);
  const [selectedBureauForModal, setSelectedBureauForModal] = useState<Bureau | null>(null);

  // Warning states
  const [validationWarnings, setValidationWarnings] = useState<{
    message: string;
    validationErrors: Array<{
      field: string;
      value: any;
      constraint: string;
      message: string;
    }>;
    suggestions: string[];
    context: string;
  } | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  // Confirmation states for pre-save validation
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [voteConfirmationModalOpen, setVoteConfirmationModalOpen] = useState(false);
  const [pendingParticipationUpdate, setPendingParticipationUpdate] = useState<{
    codeBureauVote: number;
    data: any;
  } | null>(null);
  const [pendingVoteUpdate, setPendingVoteUpdate] = useState<{
    code: number;
    nombre_vote: number;
    currentVotes: number;
    totalVotes: number;
    partyName: string;
  } | null>(null);
  const [clientValidationErrors, setClientValidationErrors] = useState<Array<{
    field: string;
    value: any;
    constraint: string;
    message: string;
  }>>([]);
  const [voteValidationErrors, setVoteValidationErrors] = useState<Array<{
    field: string;
    value: any;
    constraint: string;
    message: string;
  }>>([]);

  // Track last operation for potential undo
  const [lastOperation, setLastOperation] = useState<{
    type: 'vote' | 'participation';
    data: any;
    originalValue: any;
  } | null>(null);

  // Participation form data
  const [participationFormData, setParticipationFormData] = useState({
    nombre_inscrit: 0,
    nombre_votant: 0,
    bulletin_nul: 0,
    suffrage_exprime: 0,
    taux_participation: 0
  });

  const queryClient = useQueryClient();

  // Get current user
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.code;

  const {
    data: rawResults = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['polling-station-results-new', validationStatus, userId],
    queryFn: () => getPollingStationResults(validationStatus, userId),
    refetchInterval: 30000,
  });

  // Fetch PV images for selected bureau
  const { data: pvData, isLoading: isPVLoading } = useQuery({
    queryKey: ['pvData', selectedBureauForModal?.code],
    queryFn: () => selectedBureauForModal ? getPVForBureau(selectedBureauForModal.code) : Promise.resolve([]),
    enabled: !!selectedBureauForModal && pvModalOpen,
  });

  // Fetch participation data for selected bureau
  const { data: participation } = useQuery({
    queryKey: ['participation', selectedBureauForModal?.code],
    queryFn: () => selectedBureauForModal ? getParticipationByBureau(selectedBureauForModal.code) : null,
    enabled: !!selectedBureauForModal && participationModalOpen,
  });

  // Sync participation data to form when loaded
  useEffect(() => {
    if (participation) {
      setParticipationFormData({
        nombre_inscrit: participation.nombre_inscrit || 0,
        nombre_votant: participation.nombre_votant || 0,
        bulletin_nul: participation.bulletin_nul || 0,
        suffrage_exprime: participation.suffrage_exprime || 0,
        taux_participation: participation.taux_participation || 0
      });
    }
  }, [participation]);

  // Group results by bureau
  const groupedResults: GroupedResult[] = React.useMemo(() => {
    const bureauGroups: { [key: number]: GroupedResult } = {};

    rawResults.forEach((result: PollingStationResult) => {
      const bureauCode = result.code_bureau;

      if (!bureauGroups[bureauCode]) {
        bureauGroups[bureauCode] = {
          bureau_code: bureauCode,
          bureau: result.bureau,
          results: [],
          total_votes: 0,
          validation_status: result.statut_validation
        };
      }

      bureauGroups[bureauCode].results.push(result);
      bureauGroups[bureauCode].total_votes += result.nombre_vote;
    });

    return Object.values(bureauGroups);
  }, [rawResults]);

  // Get unique parties from all results
  const allParties: PartiPolitique[] = React.useMemo(() => {
    const partyMap = new Map<number, PartiPolitique>();

    rawResults.forEach((result: PollingStationResult) => {
      partyMap.set(result.parti_politique.code, result.parti_politique);
    });

    return Array.from(partyMap.values()).sort((a, b) => a.designation.localeCompare(b.designation));
  }, [rawResults]);

  // Filter results based on selected bureau
  const filteredResults = selectedBureau === 'all'
    ? groupedResults
    : groupedResults.filter(group => group.bureau_code.toString() === selectedBureau);

  // Mutation for updating vote counts
  const updateVoteMutation = useMutation({
    mutationFn: ({ code, nombre_vote, originalValue }: { code: number; nombre_vote: number; originalValue?: number }) => {
      // Store original value for potential undo
      if (originalValue !== undefined) {
        setLastOperation({
          type: 'vote',
          data: { code, nombre_vote },
          originalValue: { code, nombre_vote: originalValue }
        });
      }
      return updatePollingStationResult(code, { nombre_vote });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['polling-station-results-new'] });

      // Check if there are validation warnings in the response
      if (data && typeof data === 'object' && 'validationWarnings' in data && data.validationWarnings) {
        setValidationWarnings(data.validationWarnings as any);
        setWarningModalOpen(true);
      }
    },
    onError: (error: any) => {
      // Handle API errors that might contain validation warnings
      if (error?.response?.data?.validationWarnings) {
        setValidationWarnings(error.response.data.validationWarnings);
        setWarningModalOpen(true);
      }
    }
  });

  // Mutation for validation
  const validateMutation = useMutation({
    mutationFn: (resultCode: number) => validatePollingStationResult(resultCode, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polling-station-results-new'] });
      setSelectedResults(new Set());
    }
  });

  // Mutation for bulk validation
  const bulkValidateMutation = useMutation({
    mutationFn: (resultCodes: number[]) => validateMultipleResults(resultCodes, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polling-station-results-new'] });
      setSelectedResults(new Set());
    }
  });

  // Mutation for updating participation
  const updateParticipationMutation = useMutation({
    mutationFn: ({ codeBureauVote, data, originalValue }: { codeBureauVote: number; data: any; originalValue?: any }) => {
      // Store original value for potential undo
      if (originalValue !== undefined) {
        setLastOperation({
          type: 'participation',
          data: { codeBureauVote, data },
          originalValue: { codeBureauVote, data: originalValue }
        });
      }
      return updateParticipation(codeBureauVote, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['participation'] });
      setParticipationModalOpen(false);
      setSelectedBureauForModal(null);

      // Check if there are validation warnings in the response
      if (data && typeof data === 'object' && 'validationWarnings' in data && data.validationWarnings) {
        setValidationWarnings(data.validationWarnings as any);
        setWarningModalOpen(true);
      }
    },
    onError: (error: any) => {
      // Handle API errors that might contain validation warnings
      if (error?.response?.data?.validationWarnings) {
        setValidationWarnings(error.response.data.validationWarnings);
        setWarningModalOpen(true);
      }
    }
  });

  const handleVoteChange = (resultCode: number, newVote: string) => {
    const voteValue = parseInt(newVote) || 0;
    setEditingVotes(prev => ({ ...prev, [resultCode]: voteValue }));
  };

  const handleSaveVote = (resultCode: number) => {
    const newVote = editingVotes[resultCode];
    if (newVote !== undefined) {
      // Find the current result to get original values
      let partyName = '';
      let currentVotes = 0;
      let totalVotes = 0;

      for (const group of groupedResults) {
        const result = group.results.find(r => r.code === resultCode);
        if (result) {
          partyName = result.parti_politique.abbreviation;
          currentVotes = result.nombre_vote;
          totalVotes = group.total_votes;
          break;
        }
      }

      // Validate vote data on client side first
      const errors = validateVoteData(newVote, resultCode, groupedResults);

      if (errors.length > 0) {
        // Show confirmation modal for inconsistent data
        setVoteValidationErrors(errors);
        setPendingVoteUpdate({
          code: resultCode,
          nombre_vote: newVote,
          currentVotes,
          totalVotes,
          partyName
        });
        setVoteConfirmationModalOpen(true);
      } else {
        // Data is valid, proceed directly
        updateVoteMutation.mutate({
          code: resultCode,
          nombre_vote: newVote,
          originalValue: currentVotes
        });
        setEditingVotes(prev => {
          const updated = { ...prev };
          delete updated[resultCode];
          return updated;
        });
      }
    }
  };

  const handleCancelEdit = (resultCode: number) => {
    setEditingVotes(prev => {
      const updated = { ...prev };
      delete updated[resultCode];
      return updated;
    });
  };

  const handleValidate = (resultCode: number) => {
    validateMutation.mutate(resultCode);
  };

  const handleBulkValidate = () => {
    if (selectedResults.size > 0) {
      bulkValidateMutation.mutate(Array.from(selectedResults));
    }
  };

  const handleSelectResult = (resultCode: number, checked: boolean) => {
    const newSelected = new Set(selectedResults);
    if (checked) {
      newSelected.add(resultCode);
    } else {
      newSelected.delete(resultCode);
    }
    setSelectedResults(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedResults.size === rawResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(rawResults.map((r: PollingStationResult) => r.code)));
    }
  };

  const calculatePercentage = (votes: number, totalVotes: number): string => {
    if (totalVotes === 0) return '0.0';
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  // Modal handlers
  const handleViewPV = (bureau: Bureau) => {
    setSelectedBureauForModal(bureau);
    setPvModalOpen(true);
  };

  const handleEditParticipation = (bureau: Bureau) => {
    setSelectedBureauForModal(bureau);
    setParticipationModalOpen(true);
  };

  const closeModals = () => {
    setPvModalOpen(false);
    setParticipationModalOpen(false);
    setSelectedBureauForModal(null);
  };

  const closeWarningModal = () => {
    setWarningModalOpen(false);
    setValidationWarnings(null);
  };

  const handleUndoLastOperation = () => {
    if (lastOperation) {
      if (lastOperation.type === 'vote') {
        // Undo vote change
        updateVoteMutation.mutate({
          code: lastOperation.originalValue.code,
          nombre_vote: lastOperation.originalValue.nombre_vote
        });
      } else if (lastOperation.type === 'participation') {
        // Undo participation change
        updateParticipationMutation.mutate({
          codeBureauVote: lastOperation.originalValue.codeBureauVote,
          data: {
            ...lastOperation.originalValue.data,
            code_modificateur: user?.code,
          }
        });
      }

      // Clear the last operation and close modal
      setLastOperation(null);
      setWarningModalOpen(false);
      setValidationWarnings(null);
    }
  };

  // Client-side validation for participation data
  const validateParticipationData = (data: typeof participationFormData) => {
    const errors: Array<{
      field: string;
      value: any;
      constraint: string;
      message: string;
    }> = [];

    // Check for negative values
    if (data.nombre_inscrit < 0) {
      errors.push({
        field: 'nombre_inscrit',
        value: data.nombre_inscrit,
        constraint: 'must be >= 0',
        message: 'Le nombre d\'inscrits ne peut pas être négatif'
      });
    }

    if (data.nombre_votant < 0) {
      errors.push({
        field: 'nombre_votant',
        value: data.nombre_votant,
        constraint: 'must be >= 0',
        message: 'Le nombre de votants ne peut pas être négatif'
      });
    }

    if (data.bulletin_nul < 0) {
      errors.push({
        field: 'bulletin_nul',
        value: data.bulletin_nul,
        constraint: 'must be >= 0',
        message: 'Le nombre de bulletins nuls ne peut pas être négatif'
      });
    }

    if (data.suffrage_exprime < 0) {
      errors.push({
        field: 'suffrage_exprime',
        value: data.suffrage_exprime,
        constraint: 'must be >= 0',
        message: 'Le nombre de suffrages exprimés ne peut pas être négatif'
      });
    }

    // Check participation rate
    if (data.taux_participation < 0 || data.taux_participation > 100) {
      errors.push({
        field: 'taux_participation',
        value: data.taux_participation,
        constraint: 'must be between 0 and 100',
        message: 'Le taux de participation doit être entre 0% et 100%'
      });
    }

    // Check logical consistency
    if (data.nombre_votant > data.nombre_inscrit) {
      errors.push({
        field: 'nombre_votant_consistency',
        value: data.nombre_votant,
        constraint: 'must not exceed nombre_inscrit',
        message: `Le nombre de votants (${data.nombre_votant}) ne peut pas dépasser le nombre d'inscrits (${data.nombre_inscrit})`
      });
    }

    const totalBallots = data.bulletin_nul + data.suffrage_exprime;
    if (totalBallots !== data.nombre_votant && data.nombre_votant > 0) {
      errors.push({
        field: 'ballot_consistency',
        value: totalBallots,
        constraint: 'bulletin_nul + suffrage_exprime must equal nombre_votant',
        message: `Bulletins nuls (${data.bulletin_nul}) + Suffrages exprimés (${data.suffrage_exprime}) = ${totalBallots} doit égaler le nombre de votants (${data.nombre_votant})`
      });
    }

    // Check calculated participation rate
    if (data.nombre_inscrit > 0) {
      const calculatedRate = (data.nombre_votant / data.nombre_inscrit) * 100;
      const rateDifference = Math.abs(calculatedRate - data.taux_participation);
      if (rateDifference > 0.1) { // Allow small rounding differences
        errors.push({
          field: 'taux_participation_calculation',
          value: data.taux_participation,
          constraint: `calculated rate should be ${calculatedRate.toFixed(2)}%`,
          message: `Le taux de participation saisi (${data.taux_participation}%) ne correspond pas au taux calculé (${calculatedRate.toFixed(2)}%)`
        });
      }
    }

    return errors;
  };

  // Client-side validation for vote data
  const validateVoteData = (newVote: number, resultCode: number, groupedResults: GroupedResult[]) => {
    const errors: Array<{
      field: string;
      value: any;
      constraint: string;
      message: string;
    }> = [];

    // Check for negative values
    if (newVote < 0) {
      errors.push({
        field: 'nombre_vote',
        value: newVote,
        constraint: 'must be >= 0',
        message: 'Le nombre de votes ne peut pas être négatif'
      });
    }

    // Find the result and its group to get context
    let currentResult: PollingStationResult | null = null;
    let currentGroup: GroupedResult | null = null;

    for (const group of groupedResults) {
      const result = group.results.find(r => r.code === resultCode);
      if (result) {
        currentResult = result;
        currentGroup = group;
        break;
      }
    }

    if (currentResult && currentGroup) {
      // Calculate new total votes for the bureau (excluding the current result being edited)
      const otherVotes = currentGroup.results
        .filter(r => r.code !== resultCode)
        .reduce((sum, r) => sum + r.nombre_vote, 0);
      const newTotalVotes = otherVotes + newVote;

      // Check if new vote would be excessively large compared to other parties
      const maxOtherPartyVotes = Math.max(...currentGroup.results
        .filter(r => r.code !== resultCode)
        .map(r => r.nombre_vote), 0);

      if (newVote > maxOtherPartyVotes * 10 && maxOtherPartyVotes > 0) {
        errors.push({
          field: 'vote_proportion',
          value: newVote,
          constraint: `suspiciously higher than other parties (max: ${maxOtherPartyVotes})`,
          message: `Ce nombre de votes (${newVote}) semble anormalement élevé comparé aux autres partis (max: ${maxOtherPartyVotes})`
        });
      }

      // Estimate potential issues with participation data
      // This is a basic check - the server will do more comprehensive validation
      if (newTotalVotes > 10000) { // Arbitrary threshold for very large numbers
        errors.push({
          field: 'total_votes_estimate',
          value: newTotalVotes,
          constraint: 'total votes seem unusually high',
          message: `Le total des votes pour ce bureau (${newTotalVotes}) semble anormalement élevé`
        });
      }
    }

    return errors;
  };

  const handleUpdateParticipation = () => {
    if (selectedBureauForModal && user) {
      // Validate data on client side first
      const errors = validateParticipationData(participationFormData);

      if (errors.length > 0) {
        // Show confirmation modal for inconsistent data
        setClientValidationErrors(errors);
        setPendingParticipationUpdate({
          codeBureauVote: selectedBureauForModal.code,
          data: {
            ...participationFormData,
            code_modificateur: user.code,
          }
        });
        setConfirmationModalOpen(true);
      } else {
        // Data is valid, proceed directly
        updateParticipationMutation.mutate({
          codeBureauVote: selectedBureauForModal.code,
          data: {
            ...participationFormData,
            code_modificateur: user.code,
          },
          originalValue: participation
        });
      }
    }
  };

  const handleConfirmSaveWithErrors = () => {
    if (pendingParticipationUpdate) {
      updateParticipationMutation.mutate({
        ...pendingParticipationUpdate,
        originalValue: participation
      });
      setConfirmationModalOpen(false);
      setPendingParticipationUpdate(null);
      setClientValidationErrors([]);
    }
  };

  const handleCancelSave = () => {
    setConfirmationModalOpen(false);
    setPendingParticipationUpdate(null);
    setClientValidationErrors([]);
  };

  const handleConfirmSaveVoteWithErrors = () => {
    if (pendingVoteUpdate) {
      updateVoteMutation.mutate({
        code: pendingVoteUpdate.code,
        nombre_vote: pendingVoteUpdate.nombre_vote,
        originalValue: pendingVoteUpdate.currentVotes
      });
      setEditingVotes(prev => {
        const updated = { ...prev };
        delete updated[pendingVoteUpdate.code];
        return updated;
      });
      setVoteConfirmationModalOpen(false);
      setPendingVoteUpdate(null);
      setVoteValidationErrors([]);
    }
  };

  const handleCancelVoteSave = () => {
    setVoteConfirmationModalOpen(false);
    setPendingVoteUpdate(null);
    setVoteValidationErrors([]);
  };

  const handleParticipationChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setParticipationFormData(prev => ({ ...prev, [field]: numValue }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erreur lors du chargement: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Nouvelle Validation des Résultats</h1>
        <p className="text-blue-100">Interface améliorée de validation avec modification directe des votes</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les bureaux</option>
              {groupedResults.map((group) => (
                <option key={group.bureau_code} value={group.bureau_code.toString()}>
                  {group.bureau.designation}
                </option>
              ))}
            </select>

            <select
              value={validationStatus}
              onChange={(e) => setValidationStatus(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>En attente de validation</option>
              <option value={1}>Validés</option>
              <option value={2}>Rejetés</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedResults.size > 0 && (
              <button
                onClick={handleBulkValidate}
                disabled={bulkValidateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <i className="fas fa-check mr-2"></i>
                Valider la sélection ({selectedResults.size})
              </button>
            )}

            <button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Actualiser
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Total: {filteredResults.length} bureau(x) • {rawResults.length} résultat(s)
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <i className="fas fa-inbox text-4xl mb-4 text-gray-400"></i>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun résultat trouvé</h3>
            <p>Aucun résultat ne correspond aux critères sélectionnés.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedResults.size === rawResults.length && rawResults.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className=" px-6 py-4 text-left text-xs  text-black -500 uppercase tracking-wider">
                    Bureau de Vote
                  </th>
                  {allParties.map((party) => (
                    <th key={party.code} className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: party.coloration_bulletin }}
                          ></div>
                          <span className="font-bold text-black">{party.abbreviation}</span>
                        </div>
                        <div className="text-xs text-gray-400 normal-case">Votes / %</div>
                      </div>
                    </th>
                  ))}
                  <th className=" px-6 py-4 text-center text-xs  text-black-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((group) => (
                  <tr key={group.bureau_code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* We'll handle individual result selection later */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {group.bureau.designation}
                        </span>
                        <span className="text-xs text-gray-500">
                          Code: {group.bureau_code} • Total: {group.total_votes} votes
                        </span>
                      </div>
                    </td>

                    {allParties.map((party) => {
                      const result = group.results.find(r => r.code_parti_politique === party.code);
                      const currentVotes = result ? result.nombre_vote : 0;
                      const editingValue = result ? editingVotes[result.code] : undefined;
                      const isEditing = editingValue !== undefined;
                      const displayVotes = isEditing ? editingValue : currentVotes;
                      const percentage = calculatePercentage(displayVotes, group.total_votes);

                      return (
                        <td key={party.code} className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            {result && isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editingValue}
                                  onChange={(e) => handleVoteChange(result.code, e.target.value)}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  min="0"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveVote(result.code);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit(result.code);
                                    }
                                  }}
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleSaveVote(result.code)}
                                    className="text-green-600 hover:text-green-800 text-xs"
                                    title="Sauvegarder"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    onClick={() => handleCancelEdit(result.code)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    title="Annuler"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`cursor-pointer px-2 py-1 rounded ${result ? 'hover:bg-blue-50' : 'text-gray-400'}`}
                                onClick={() => result && setEditingVotes(prev => ({ ...prev, [result.code]: result.nombre_vote }))}
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {displayVotes.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {percentage}%
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-2">
                        {/* Validation button and status */}
                        <div className="flex items-center gap-2">
                          {group.validation_status === 0 && (
                            <button
                              onClick={() => {
                                // Validate all results for this bureau
                                group.results.forEach(result => {
                                  validateMutation.mutate(result.code);
                                });
                              }}
                              disabled={validateMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              <i className="fas fa-check mr-1"></i>
                              Valider
                            </button>
                          )}

                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            group.validation_status === 1
                              ? 'bg-green-100 text-green-800'
                              : group.validation_status === 2
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {group.validation_status === 1 ? (
                              <>
                                <i className="fas fa-check mr-1"></i>
                                Validé
                              </>
                            ) : group.validation_status === 2 ? (
                              <>
                                <i className="fas fa-times mr-1"></i>
                                Rejeté
                              </>
                            ) : (
                              <>
                                <i className="fas fa-clock mr-1"></i>
                                En attente
                              </>
                            )}
                          </span>
                        </div>

                        {/* PV and Participation buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewPV(group.bureau)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Voir le procès-verbal"
                          >
                            <i className="fas fa-file-image mr-1"></i>
                            PV
                          </button>

                          <button
                            onClick={() => handleEditParticipation(group.bureau)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Modifier la participation"
                          >
                            <i className="fas fa-users mr-1"></i>
                            Participation
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PV Modal */}
      {pvModalOpen && selectedBureauForModal && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Procès-Verbal - Bureau {selectedBureauForModal.code}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Bureau Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations du Bureau</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Code Bureau</label>
                    <p className="text-gray-900 font-medium">{selectedBureauForModal.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Désignation</label>
                    <p className="text-gray-900 font-medium">{selectedBureauForModal.designation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Arrondissement</label>
                    <p className="text-gray-900 font-medium">{selectedBureauForModal.code_arrondissement}</p>
                  </div>
                  {selectedBureauForModal.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900 font-medium">{selectedBureauForModal.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PV Images */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Procès-Verbal</h3>
                {isPVLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">Chargement du procès-verbal...</span>
                  </div>
                ) : pvData && pvData.length > 0 ? (
                  <div className="space-y-4">
                    {pvData.map((pv: PV) => (
                      <div key={pv.code} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">PV #{pv.code}</h4>
                            <p className="text-sm text-gray-600">Hash: {pv.hash_file}</p>
                            <p className="text-sm text-gray-600">Date: {new Date(pv.timestamp).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <img
                            src={`http://api.voteflow.cm${cleanPVUrl(pv.url_pv)}`}
                            alt={`Procès-verbal du bureau ${selectedBureauForModal.code}`}
                            className="w-full max-w-full rounded-lg border border-gray-300 shadow-md"
                            style={{ maxHeight: '600px', objectFit: 'contain' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const nextElement = target.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden flex-col items-center justify-center py-12 text-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                            <i className="fas fa-image text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-600">Impossible de charger l'image</p>
                            <p className="text-sm text-gray-500 mt-2">{cleanPVUrl(pv.url_pv)}</p>
                            <a
                              href={`http://api.voteflow.cm${cleanPVUrl(pv.url_pv)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-3 text-blue-600 hover:text-blue-800"
                            >
                              Ouvrir dans un nouvel onglet
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <i className="fas fa-file-image text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 font-medium">Aucun procès-verbal disponible</p>
                    <p className="text-sm text-gray-500 mt-2">Le procès-verbal n'a pas encore été téléchargé pour ce bureau.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participation Modal */}
      {participationModalOpen && selectedBureauForModal && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Modifier la Participation - Bureau {selectedBureauForModal.code}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Bureau Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations du Bureau</h3>
                <p className="text-gray-900 font-medium">{selectedBureauForModal.designation}</p>
                <p className="text-sm text-gray-600">Code: {selectedBureauForModal.code}</p>
              </div>

              {/* Participation Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Données de Participation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre d'Inscrits
                    </label>
                    <input
                      type="number"
                      value={participationFormData.nombre_inscrit}
                      onChange={(e) => handleParticipationChange('nombre_inscrit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Votants
                    </label>
                    <input
                      type="number"
                      value={participationFormData.nombre_votant}
                      onChange={(e) => handleParticipationChange('nombre_votant', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulletins Nuls
                    </label>
                    <input
                      type="number"
                      value={participationFormData.bulletin_nul}
                      onChange={(e) => handleParticipationChange('bulletin_nul', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suffrages Exprimés
                    </label>
                    <input
                      type="number"
                      value={participationFormData.suffrage_exprime}
                      onChange={(e) => handleParticipationChange('suffrage_exprime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux de Participation (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={participationFormData.taux_participation}
                      onChange={(e) => handleParticipationChange('taux_participation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateParticipation}
                  disabled={updateParticipationMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {updateParticipationMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warning Modal */}
      {warningModalOpen && validationWarnings && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-yellow-200 bg-yellow-50/80">
              <div className="flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-2xl text-yellow-600"></i>
                <h2 className="text-xl font-semibold text-yellow-800">
                  Avertissement - Données Incohérentes
                </h2>
              </div>
              <button
                onClick={closeWarningModal}
                className="text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Warning Message */}
              <div className="bg-yellow-50/50 rounded-lg p-4 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Message d'Avertissement</h3>
                <p className="text-yellow-700">{validationWarnings.message}</p>
                {validationWarnings.context && (
                  <p className="text-sm text-yellow-600 mt-2">Contexte: {validationWarnings.context}</p>
                )}
              </div>

              {/* Validation Errors */}
              {validationWarnings.validationErrors && validationWarnings.validationErrors.length > 0 && (
                <div className="bg-red-50/50 rounded-lg p-4 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Erreurs de Validation Détectées</h3>
                  <div className="space-y-3">
                    {validationWarnings.validationErrors.map((error, index) => (
                      <div key={index} className="bg-white/80 rounded-lg p-3 border border-red-100">
                        <div className="flex items-start gap-2">
                          <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                          <div className="flex-1">
                            <p className="font-medium text-red-800">{error.message}</p>
                            <div className="text-sm text-red-600 mt-1">
                              <span className="font-medium">Champ:</span> {error.field} |
                              <span className="font-medium ml-2">Valeur:</span> {error.value} |
                              <span className="font-medium ml-2">Contrainte:</span> {error.constraint}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {validationWarnings.suggestions && validationWarnings.suggestions.length > 0 && (
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Suggestions</h3>
                  <ul className="space-y-2">
                    {validationWarnings.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <i className="fas fa-lightbulb text-blue-500 mt-0.5"></i>
                        <span className="text-blue-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Notice */}
              <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-amber-600 text-xl mt-0.5"></i>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 mb-2">Information Importante</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      La modification a été enregistrée avec succès malgré les incohérences détectées.
                      Le statut de validation a été remis à "En attente" pour permettre une nouvelle vérification.
                      Nous vous recommandons de vérifier les données et de corriger les incohérences si nécessaire.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {lastOperation && (
                  <button
                    onClick={handleUndoLastOperation}
                    disabled={updateVoteMutation.isPending || updateParticipationMutation.isPending}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 rounded-lg transition-colors"
                  >
                    {updateVoteMutation.isPending || updateParticipationMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Annulation...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-undo mr-2"></i>
                        Annuler les Modifications
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={closeWarningModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <i className="fas fa-check mr-2"></i>
                  J'ai Compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Inconsistent Data */}
      {confirmationModalOpen && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-orange-200 bg-orange-50/80">
              <div className="flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-2xl text-orange-600"></i>
                <h2 className="text-xl font-semibold text-orange-800">
                  Confirmation - Données Incohérentes Détectées
                </h2>
              </div>
              <button
                onClick={handleCancelSave}
                className="text-orange-600 hover:text-orange-800 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Warning Message */}
              <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">⚠️ Attention !</h3>
                <p className="text-orange-700">
                  Les données que vous souhaitez sauvegarder contiennent des incohérences.
                  Voulez-vous vraiment enregistrer ces informations incorrectes ?
                </p>
              </div>

              {/* Validation Errors */}
              <div className="bg-red-50/50 rounded-lg p-4 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Problèmes Détectés :</h3>
                <div className="space-y-3">
                  {clientValidationErrors.map((error, index) => (
                    <div key={index} className="bg-white/80 rounded-lg p-3 border border-red-100">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                        <div className="flex-1">
                          <p className="font-medium text-red-800">{error.message}</p>
                          <div className="text-sm text-red-600 mt-1">
                            <span className="font-medium">Valeur actuelle:</span> {error.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Nos Recommandations :</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Cliquez sur <strong>"Annuler"</strong> pour corriger les données avant de sauvegarder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Vérifiez la cohérence entre les différents champs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Contactez votre superviseur si les données sont correctes malgré les alertes</span>
                  </li>
                </ul>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-amber-600 text-xl mt-0.5"></i>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 mb-2">Information Importante</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      Si vous choisissez de sauvegarder ces données incohérentes, le bureau sera marqué comme
                      ayant des données problématiques et nécessitera une révision administrative.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelSave}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSaveWithErrors}
                  disabled={updateParticipationMutation.isPending}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {updateParticipationMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Sauvegarder quand même
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vote Confirmation Modal for Inconsistent Data */}
      {voteConfirmationModalOpen && pendingVoteUpdate && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-orange-200 bg-orange-50/80">
              <div className="flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-2xl text-orange-600"></i>
                <h2 className="text-xl font-semibold text-orange-800">
                  Confirmation - Vote Suspect Détecté
                </h2>
              </div>
              <button
                onClick={handleCancelVoteSave}
                className="text-orange-600 hover:text-orange-800 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Vote Context */}
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">🗳️ Modification de Vote</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Parti Politique:</span>
                    <p className="text-blue-800 font-semibold">{pendingVoteUpdate.partyName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Nouveau Nombre de Votes:</span>
                    <p className="text-blue-800 font-bold text-lg">{pendingVoteUpdate.nombre_vote.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Nombre Actuel:</span>
                    <p className="text-blue-800">{pendingVoteUpdate.currentVotes.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Différence:</span>
                    <p className={`font-semibold ${pendingVoteUpdate.nombre_vote > pendingVoteUpdate.currentVotes ? 'text-green-600' : 'text-red-600'}`}>
                      {pendingVoteUpdate.nombre_vote > pendingVoteUpdate.currentVotes ? '+' : ''}
                      {(pendingVoteUpdate.nombre_vote - pendingVoteUpdate.currentVotes).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">⚠️ Attention !</h3>
                <p className="text-orange-700">
                  Le nombre de votes que vous souhaitez enregistrer présente des anomalies.
                  Voulez-vous vraiment enregistrer cette valeur suspecte ?
                </p>
              </div>

              {/* Validation Errors */}
              <div className="bg-red-50/50 rounded-lg p-4 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Anomalies Détectées :</h3>
                <div className="space-y-3">
                  {voteValidationErrors.map((error, index) => (
                    <div key={index} className="bg-white/80 rounded-lg p-3 border border-red-100">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                        <div className="flex-1">
                          <p className="font-medium text-red-800">{error.message}</p>
                          <div className="text-sm text-red-600 mt-1">
                            <span className="font-medium">Valeur saisie:</span> {error.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Nos Recommandations :</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Cliquez sur <strong>"Annuler"</strong> pour vérifier et corriger la valeur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Vérifiez le procès-verbal pour confirmer le nombre exact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Assurez-vous que ce nombre est cohérent avec la participation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                    <span>Contactez votre superviseur en cas de doute</span>
                  </li>
                </ul>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-amber-600 text-xl mt-0.5"></i>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 mb-2">Information Importante</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      Si vous choisissez de sauvegarder ce vote suspect, le résultat sera marqué comme
                      nécessitant une révision et le statut de validation sera remis à "En attente".
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelVoteSave}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSaveVoteWithErrors}
                  disabled={updateVoteMutation.isPending}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {updateVoteMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Sauvegarder quand même
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResultsNew;