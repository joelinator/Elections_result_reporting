/**
 * @file API client pour la gestion des arrondissements et documents d'arrondissement
 */

// Configuration de base
const API_BASE_URL = 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev/api';

// Helper pour les appels fetch
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

// Helper pour les appels avec FormData (pour les uploads)
const apiFormFetch = async (endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API form call failed for ${url}:`, error);
    throw error;
  }
};

// Types TypeScript
export interface Region {
  code: number;
  libelle: string;
  abbreviation?: string;
  chef_lieu?: string;
  departements?: {
    code: number;
    libelle: string;
    abbreviation?: string;
  }[];
}

export interface Departement {
  code: number;
  libelle: string;
  abbreviation?: string;
  chef_lieu?: string;
  region?: {
    code: number;
    libelle: string;
    abbreviation?: string;
  };
}

export interface Arrondissement {
  code: number;
  code_departement?: number;
  code_region?: number;
  abbreviation?: string;
  libelle: string;
  description?: string;
  code_createur?: string;
  code_modificateur?: string;
  date_creation?: string;
  date_modification?: string;
  departement?: Departement;
  region?: Region;
  bureauVotes?: {
    code: number;
    designation: string;
    description?: string;
  }[];
  pvArrondissements?: DocumentArrondissement[];
}

export interface Candidat {
  code: number;
  noms_prenoms?: string;
  photo?: string;
  date_creation?: string;
  date_modification?: string;
  code_createur?: string;
  code_modificateur?: string;
}

export interface BureauVote {
  code: number;
  designation: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  effectif?: number;
  code_arrondissement?: number;
  arrondissement?: {
    code: number;
    libelle: string;
    abbreviation?: string;
    departement?: {
      code: number;
      libelle: string;
      abbreviation?: string;
      region?: {
        code: number;
        libelle: string;
        abbreviation?: string;
      };
    };
  };
}

export interface Commission {
  code: string;
  libelle: string;
  description?: string;
  code_departement?: number;
  date_creation?: string;
  date_modification?: string;
  departement?: Departement;
}

export interface FonctionCommission {
  code: string;
  libelle: string;
  description?: string;
  date_creation?: string;
  date_modification?: string;
}

export interface DocumentArrondissement {
  code: number;
  code_arrondissement: number;
  libelle: string;
  url_pv?: string;
  hash_file?: string;
  timestamp: string;
  arrondissement?: {
    code: number;
    libelle: string;
    abbreviation?: string;
    departement?: {
      code: number;
      libelle: string;
      abbreviation?: string;
    };
    region?: {
      code: number;
      libelle: string;
      abbreviation?: string;
    };
  };
}

// API pour les régions
export const regionsApi = {
  getAll: (): Promise<Region[]> => 
    apiFetch('/regions'),
};

// API pour les départements
export const departementApi = {
  getAll: (): Promise<Departement[]> => 
    apiFetch('/departements'),
};

// API pour les candidats
export const candidatApi = {
  getAll: (): Promise<Candidat[]> => 
    apiFetch('/candidats'),
};

// API pour les bureaux de vote
export const bureauVoteApi = {
  getAll: (filters?: { arrondissement?: number; departement?: number }): Promise<BureauVote[]> => {
    const params = new URLSearchParams();
    if (filters?.arrondissement) params.append('arrondissement', filters.arrondissement.toString());
    if (filters?.departement) params.append('departement', filters.departement.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/bureaux-vote${queryString}`);
  },
};

// API pour les commissions
export const commissionApi = {
  getAll: (): Promise<Commission[]> => 
    apiFetch('/commission-departementale'),
};

// API pour les fonctions de commission
export const fonctionCommissionApi = {
  getAll: (): Promise<FonctionCommission[]> => 
    apiFetch('/fonction-commission'),
};

// API pour les arrondissements (communes)
export const arrondissementApi = {
  getAll: (filters?: { departement?: number; region?: number }): Promise<Arrondissement[]> => {
    const params = new URLSearchParams();
    if (filters?.departement) params.append('departement', filters.departement.toString());
    if (filters?.region) params.append('region', filters.region.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/territoriale/arrondissements${queryString}`);
  },
    
  getById: (id: number): Promise<Arrondissement> => 
    apiFetch(`/arrondissement/${id}`),
    
  create: (data: Omit<Arrondissement, 'code' | 'date_creation' | 'date_modification' | 'departement' | 'region' | 'bureauVotes' | 'pvArrondissements'>): Promise<Arrondissement> => 
    apiFetch('/arrondissement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Omit<Arrondissement, 'code' | 'date_creation' | 'date_modification' | 'departement' | 'region' | 'bureauVotes' | 'pvArrondissements'>>): Promise<Arrondissement> => 
    apiFetch(`/arrondissement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/arrondissement/${id}`, {
      method: 'DELETE',
    }),
};

// API pour les documents d'arrondissement
export const documentArrondissementApi = {
  getAll: (arrondissementCode?: number): Promise<DocumentArrondissement[]> => {
    const params = arrondissementCode ? `?arrondissement=${arrondissementCode}` : '';
    return apiFetch(`/document-arrondissement${params}`);
  },
    
  getById: (id: number): Promise<DocumentArrondissement> => 
    apiFetch(`/document-arrondissement/${id}`),
    
  create: (data: { code_arrondissement: number; libelle: string; file: File }): Promise<DocumentArrondissement> => {
    const formData = new FormData();
    formData.append('code_arrondissement', data.code_arrondissement.toString());
    formData.append('libelle', data.libelle);
    formData.append('file', data.file);
    
    return apiFormFetch('/document-arrondissement', formData, 'POST');
  },
    
  update: (id: number, data: { libelle: string; file?: File }): Promise<DocumentArrondissement> => {
    const formData = new FormData();
    formData.append('libelle', data.libelle);
    if (data.file) {
      formData.append('file', data.file);
    }
    
    return apiFormFetch(`/document-arrondissement/${id}`, formData, 'PUT');
  },
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/document-arrondissement/${id}`, {
      method: 'DELETE',
    }),

  // Helper pour générer l'URL de téléchargement
  getDownloadUrl: (document: DocumentArrondissement): string => {
    if (!document.url_pv) return '';
    return `${API_BASE_URL.replace('/api', '')}${document.url_pv}`;
  },
};
