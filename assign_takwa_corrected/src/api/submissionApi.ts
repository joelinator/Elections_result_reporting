// api/electionApi.ts
import type { PollingStation, PoliticalParty, SubmissionData, ApiResponse, PaginatedResponse } from '../data/submissionData';

const API_BASE_URL =  'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev/api';
// const API_BASE_URL =  'http://api.voteflow.cm/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Polling Station API functions
export const electionApi = {
//   console.log('Get polling stations by arrondissement');
  getPollingStationsByArrondissement: async (arrondissementId: number): Promise<PollingStation[]> => {
    return apiRequest<PollingStation[]>(`/territoriale/bureaux-vote/arrondissement/${arrondissementId}`);
  },

  // Get all polling stations (with optional filters)
  getPollingStations: async (filters?: {
    codeArrondissement?: number;
    // codeCommune?: number;
    codeDepartement?: number;
    hasSubmittedData?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PollingStation>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return apiRequest<PaginatedResponse<PollingStation>>(`/polling-stations?${params.toString()}`);
  },

  // Get single polling station by ID
  getPollingStation: async (id: number): Promise<PollingStation> => {
    return apiRequest<PollingStation>(`/polling-stations/${id}`);
  },

  // Get political parties
  getPoliticalParties: async (): Promise<PoliticalParty[]> => {
    return apiRequest<PoliticalParty[]>('/election/partis');
  },

  // Get political party by ID
  getPoliticalParty: async (id: number): Promise<PoliticalParty> => {
    return apiRequest<PoliticalParty>(`/political-parties/${id}`);
  },

  // Submit election results
  submitResults: async (data: {
    userId: number;
    pollingStationId: number;
    voterStats: {
      nombreInscrit: number;
      nombreVotant: number;
      bulletinNul: number;
    };
    partyVotes: Array<{
      partyId: number;
      nombreVote: number;
    }>;
    imageFile?: File;
  }): Promise<ApiResponse<{ submissionId: number }>> => {
    // const formData = new FormData();
    
    // Add JSON data
    const payload = {
    codeUtilisateur: Number(data.userId),
    codeBureauVote: Number(data.pollingStationId),
    nombreInscrit: Number(data.voterStats.nombreInscrit),
    nombreVotant: Number(data.voterStats.nombreVotant),
    bulletinNul: Number(data.voterStats.bulletinNul),
    donneesLocale: data.partyVotes.map(vote => ({ // Changed to donneesLocale (no underscore)
      code_parti_politique: Number(vote.partyId),
      nombre_vote: Number(vote.nombreVote),
    })),
    dateLocale: new Date().toISOString(),
  };


  if (isNaN(payload.codeUtilisateur) || payload.codeUtilisateur <= 0) {
    throw new Error('codeUtilisateur doit être un nombre valide');
  }
  if (isNaN(payload.codeBureauVote) || payload.codeBureauVote <= 0) {
    throw new Error('codeBureauVote doit être un nombre valide');
  }
  if (isNaN(payload.nombreInscrit) || payload.nombreInscrit <= 0) {
    throw new Error('nombreInscrit doit être un nombre valide');
  }
  if (isNaN(payload.nombreVotant) || payload.nombreVotant <= 0) {
    throw new Error('nombreVotant doit être un nombre valide');
  }
  if (isNaN(payload.bulletinNul) || payload.bulletinNul < 0) {
    throw new Error('bulletinNul doit être un nombre valide');
  }

  payload.donneesLocale.forEach(vote => {
    if (isNaN(vote.code_parti_politique) || isNaN(vote.nombre_vote)) {
      throw new Error('Les votes des partis doivent contenir des valeurs numériques valides');
    }
  });
  console.log('Payload being sent:', JSON.stringify(payload, null, 2));

    const token = localStorage.getItem('accessToken') || '';
    console.log(token)

    if (data.imageFile) {
        uploadPvImage(data.imageFile, data.pollingStationId, token);
    }

    return apiRequest<ApiResponse<{ submissionId: number }>>('/submission/result', {
      method: 'POST',
      headers: {
        // Don't set Content-Type when using FormData, browser will set it automatically
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  uploadPvImage: async (
  imageFile: File, 
  pollingStationId: number, 
  authToken?: string
): Promise<ApiResponse<{ imageUrl: string }>> => {
  const formData = new FormData();
  console.log('in pv upload function', authToken);
  formData.append('file', imageFile);
  formData.append('codeBureauVote', pollingStationId.toString());
  
  const token = authToken || localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('Authentication token is required');
  }
  console.log(formData.entries);
  
  return apiRequest<ApiResponse<{ imageUrl: string }>>('/submission/pv', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
},

  // Get submission by polling station ID
  getSubmissionByPollingStation: async (pollingStationId: number): Promise<SubmissionData | null> => {
    try {
      return await apiRequest<SubmissionData>(`/submissions/bureaux-vote/${pollingStationId}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null; // No submission found
      }
      throw error;
    }
  },

  // Get user's submissions
  getUserSubmissions: async (userId: number): Promise<SubmissionData[]> => {
    return apiRequest<SubmissionData[]>(`/submissions/user/${userId}`);
  },


  // Get election statistics
  getElectionStats: async (filters?: {
    codeArrondissement?: number;
    codeCommune?: number;
    codeDepartement?: number;
    codeRegion?: number;
  }): Promise<any> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return apiRequest<any>(`/election/stats?${params.toString()}`);
  },
};

// Export individual functions for easier importing
export const getPollingStationsByArrondissement = electionApi.getPollingStationsByArrondissement;
export const getPollingStations = electionApi.getPollingStations;
export const getPollingStation = electionApi.getPollingStation;
export const getPoliticalParties = electionApi.getPoliticalParties;
export const getPoliticalParty = electionApi.getPoliticalParty;
export const submitResults = electionApi.submitResults;
export const getSubmissionByPollingStation = electionApi.getSubmissionByPollingStation;
export const getUserSubmissions = electionApi.getUserSubmissions;
export const uploadPvImage = electionApi.uploadPvImage;
export const getElectionStats = electionApi.getElectionStats;

export default electionApi;