// types.ts

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Polling Station Type
export interface PollingStation {
  code: number;
  designation: string;
  description?: string;
  codeArrondissement: number;
  data_filled: number;
  arrondissement?: Arrondissement;
  // Additional properties that might be useful
//   codeCommune?: number;
  codeDepartement?: number;
  codeRegion?: number;
  address?: string;
  capacity?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Arrondissement {
  code: number;
  libelle: string;
//   codeCommune: number;
  codeDepartement: number;
  codeRegion: number;
//   commune?: Commune;
  departement?: Departement;
  region?: Region;
}

// export interface Commune {
//   code: number;
//   libelle: string;
//   codeDepartement: number;
//   codeRegion: number;
// }

export interface Departement {
  code: number;
  libelle: string;
  codeRegion: number;
}

export interface Region {
  code: number;
  libelle: string;
}

// Voter Statistics Type
export interface VoterStats {
  nombreInscrit: number; // Could be number if you prefer, but string allows for formatting
  nombreVotant: number;
  bulletinNul: number;
  // Derived properties (optional)
  suffragesExprimes?: number;
  tauxParticipation?: number;
}

// Political Party Type
export interface PoliticalParty {
  code: number;
  abbreviation: string;
  coloration_bulletin?: string; // For UI display
  imageUrl?: string; // Party logo/icon
}

// Party Votes Type
export interface PartyVotes {
  partyId: number;
  nombreVote: number; // Could be number if you prefer
  party?: PoliticalParty; // Optional: full party data
}

export interface SubmissionPayload {
  codeUtilisateur: number;
  codeBureauVote: number;
  nombreInscrit: number;
  nombreVotant: number;
  bulletinNul: number;
  donneesLocale: Array<{
    code_parti_politique: number;
    nombre_vote: number;
  }>;
  dateLocale: string;
}

// Submission Data Type
export interface SubmissionData {
  pollingStationId: number;
  userId: number;
  voterStats: VoterStats;
  partyVotes: PartyVotes[];
  submissionDate: Date;
  imagePath?: string;
  imageFile?: File; // For frontend handling
  // Additional metadata
  isSubmitted?: boolean;
  submissionId?: number;
  lastModified?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Type (for reference)
export interface User {
  code: number;
  noms_prenoms: string;
  username: string;
  email: string;
  last_login: string;
  adresse: string;
  boite_postale: string;
  contact: string;
  code_role: number;
  role: {
    code: number;
    libelle: string;
  };
  arrondissements: Array<{
    code: number;
    code_departement: number;
    code_region: number;
    abbreviation: string;
    libelle: string;
    description?: string | null;
    code_createur?: number | null;
    code_modificateur?: number | null;
    date_creation?: string | null;
    date_modification?: string | null;
  }>;
  code_createur?: number | null;
  code_modificateur?: number | null;
  date_creation?: string | null;
  date_modification?: string;
}

export interface UserRole {
  id: number;
  libelle: string;
  code: string;
  permissions: string[];
}

// Form Validation Types
export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationWarnings {
  [key: string]: string;
}

export interface ValidationResult {
  errors: ValidationErrors;
  warnings: ValidationWarnings;
  isValid: boolean;
  hasWarnings: boolean;
}

// UI State Types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  warning: string | null;
}

// Filter Types for Polling Stations
export interface PollingStationFilters {
  code?: number;
  designation?: string;
  codeArrondissement?: number;
  codeCommune?: number;
  codeDepartement?: number;
  codeRegion?: number;
  hasSubmittedData?: boolean;
  searchQuery?: string;
}

// Sorting Options
export interface SortOptions {
  field: keyof PollingStation;
  direction: 'asc' | 'desc';
}

// File Upload Type
export interface FileUpload {
  file: File;
  progress: number;
  isUploading: boolean;
  error?: string;
}

// Summary Statistics Type
export interface SummaryStats {
  totalPollingStations: number;
  submittedPollingStations: number;
  pendingPollingStations: number;
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
  nullVotes: number;
  // Party-wise summary
  partyResults: PartySummary[];
}

export interface PartySummary {
  partyId: number;
  partyName: string;
  partyAbbreviation: string;
  votes: number;
  percentage: number;
  color?: string;
}

// Real-time Update Types
export interface RealTimeUpdate {
  type: 'submission' | 'validation' | 'status_change';
  data: any;
  timestamp: Date;
  userId: number;
}

// Notification Types
export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

// Export the types for easy importing
export type {
  PollingStation as PollingStationType,
  VoterStats as VoterStatsType,
  PartyVotes as PartyVotesType,
  PoliticalParty as PoliticalPartyType,
  User as UserType,
};

// Helper functions
export const createEmptyVoterStats = (): VoterStats => ({
  nombreInscrit: 0,
  nombreVotant: 0,
  bulletinNul: 0,
});

export const calculateSuffragesExprimes = (voterStats: VoterStats): number => {
  const votants = voterStats.nombreVotant || 0;
  const nuls = voterStats.bulletinNul || 0;
  return votants - nuls;
};

export const calculateTauxParticipation = (voterStats: VoterStats): number => {
  const inscrits = voterStats.nombreInscrit || 0;
  const votants = voterStats.nombreVotant || 0;
  return inscrits > 0 ? (votants / inscrits) * 100 : 0;
};

// Type guards
export const isPollingStation = (obj: any): obj is PollingStation => {
  return obj && typeof obj.code === 'number' && typeof obj.designation === 'string';
};

export const isVoterStats = (obj: any): obj is VoterStats => {
  return obj && typeof obj.nombreInscrit === 'string' && typeof obj.nombreVotant === 'string';
};