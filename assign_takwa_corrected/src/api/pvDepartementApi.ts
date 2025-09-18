/**
 * @file API client pour la gestion des PV par département
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
export interface Departement {
  code: number;
  libelle: string;
  abbreviation?: string;
  chef_lieu?: string;
  description?: string;
  region?: {
    code: number;
    libelle: string;
    abbreviation?: string;
  };
}

export interface PvDepartement {
  code: number;
  code_departement: number;
  libelle: string;
  url_pv?: string;
  hash_file?: string;
  timestamp: string;
  departement?: Departement;
}

export interface CreatePvDepartementData {
  code_departement: number;
  libelle: string;
  file: File;
}

export interface UpdatePvDepartementData {
  libelle: string;
  file?: File;
}

// API pour les PV par département
export const pvDepartementApi = {
  getAll: (filters?: { 
    departement?: number; 
    region?: number;
  }): Promise<PvDepartement[]> => {
    const params = new URLSearchParams();
    if (filters?.departement) params.append('departement', filters.departement.toString());
    if (filters?.region) params.append('region', filters.region.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/pv-departement${queryString}`);
  },
    
  getById: (id: number): Promise<PvDepartement> => 
    apiFetch(`/pv-departement/${id}`),
    
  create: (data: CreatePvDepartementData): Promise<PvDepartement> => {
    const formData = new FormData();
    formData.append('code_departement', data.code_departement.toString());
    formData.append('libelle', data.libelle);
    formData.append('file', data.file);
    
    return apiFormFetch('/pv-departement', formData, 'POST');
  },
    
  update: (id: number, data: UpdatePvDepartementData): Promise<PvDepartement> => {
    const formData = new FormData();
    formData.append('libelle', data.libelle);
    if (data.file) {
      formData.append('file', data.file);
    }
    
    return apiFormFetch(`/pv-departement/${id}`, formData, 'PUT');
  },
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/pv-departement/${id}`, {
      method: 'DELETE',
    }),

  // Méthodes utilitaires
  getByDepartement: (codeDepartement: number): Promise<PvDepartement[]> =>
    pvDepartementApi.getAll({ departement: codeDepartement }),

  getByRegion: (codeRegion: number): Promise<PvDepartement[]> =>
    pvDepartementApi.getAll({ region: codeRegion }),

  // Helper pour générer l'URL de téléchargement
  getDownloadUrl: (pv: PvDepartement): string => {
    if (!pv.url_pv) return '';
    return `${API_BASE_URL.replace('/api', '')}${pv.url_pv}`;
  },

  // Vérifier si un fichier existe
  checkFileExists: async (pv: PvDepartement): Promise<boolean> => {
    if (!pv.url_pv) return false;
    
    try {
      const url = pvDepartementApi.getDownloadUrl(pv);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Obtenir les statistiques
  getStatistics: async (filters?: { departement?: number; region?: number }): Promise<{
    totalPv: number;
    totalDepartements: number;
    totalSize: number;
    pvList: PvDepartement[];
  }> => {
    const pvList = await pvDepartementApi.getAll(filters);
    const departements = new Set(pvList.map(pv => pv.code_departement));
    
    // Calculer la taille totale (approximative basée sur les hash)
    const totalSize = pvList.filter(pv => pv.hash_file).length * 1024; // Estimation
    
    return {
      totalPv: pvList.length,
      totalDepartements: departements.size,
      totalSize,
      pvList
    };
  }
};
