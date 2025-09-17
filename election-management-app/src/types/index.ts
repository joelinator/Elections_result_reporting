// Types for authentication and user management
export interface User {
  id: number;
  code: number;
  username: string;
  email: string;
  noms_prenoms: string;
  role: UserRole;
  departements?: UserDepartment[];
  permissions?: string[];
}

export interface UserRole {
  code: number;
  libelle: string;
}

export interface UserDepartment {
  code: number;
  libelle: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// Election data types
export interface Department {
  code: number;
  libelle: string;
  abbreviation?: string;
  chef_lieu?: string;
  region?: Region;
  participationData?: ParticipationData;
}

export interface Region {
  code: number;
  libelle: string;
  abbreviation?: string;
  chef_lieu?: string;
}

export interface ParticipationData {
  code: number;
  code_departement: number;
  nombre_inscrit: number;
  nombre_votant: number;
  taux_participation?: number;
  bulletin_nul: number;
  suffrage_exprime?: number;
}

export interface Arrondissement {
  code: number;
  libelle: string;
  code_departement: number;
  departement?: Department;
}

export interface BureauVote {
  code: number;
  designation: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  code_arrondissement: number;
  arrondissement?: Arrondissement;
  effectif?: number;
  data_filled: number;
}

export interface Candidate {
  code: number;
  noms_prenoms: string;
  photo?: string;
  parti?: PartiPolitique;
}

export interface PartiPolitique {
  code: number;
  designation: string;
  abbreviation: string;
  coloration_bulletin?: string;
  candidat?: Candidate;
}

export interface ElectionResult {
  code: number;
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
  parti: PartiPolitique;
}

export interface PVDocument {
  code: number;
  code_arrondissement: number;
  url_pv: string;
  libelle: string;
  timestamp: string;
  arrondissement: Arrondissement;
}