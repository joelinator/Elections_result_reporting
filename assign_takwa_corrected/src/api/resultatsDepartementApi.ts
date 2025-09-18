/**
 * @file API client pour la gestion des résultats par département
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

// Types TypeScript
export interface PartiPolitique {
  code: number;
  designation: string;
  abbreviation?: string;
  description?: string;
  coloration_bulletin?: string;
  image?: string;
}

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

export interface ResultatDepartement {
  code: number;
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
  date_creation?: string;
  departement?: Departement;
  parti?: PartiPolitique;
}

export interface CreateResultatDepartementData {
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
}

export interface UpdateResultatDepartementData {
  code_departement?: number;
  code_parti?: number;
  nombre_vote?: number;
  pourcentage?: number;
}

// API pour les résultats par département
export const resultatsDepartementApi = {
  getAll: (filters?: { 
    departement?: number; 
    parti?: number; 
    region?: number;
  }): Promise<ResultatDepartement[]> => {
    const params = new URLSearchParams();
    if (filters?.departement) params.append('departement', filters.departement.toString());
    if (filters?.parti) params.append('parti', filters.parti.toString());
    if (filters?.region) params.append('region', filters.region.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/resultats-departement${queryString}`);
  },
    
  getById: (id: number): Promise<ResultatDepartement> => 
    apiFetch(`/resultats-departement/${id}`),
    
  create: (data: CreateResultatDepartementData): Promise<ResultatDepartement> => 
    apiFetch('/resultats-departement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: UpdateResultatDepartementData): Promise<ResultatDepartement> => 
    apiFetch(`/resultats-departement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/resultats-departement/${id}`, {
      method: 'DELETE',
    }),

  // Méthodes utilitaires
  getByDepartement: (codeDepartement: number): Promise<ResultatDepartement[]> =>
    resultatsDepartementApi.getAll({ departement: codeDepartement }),

  getByParti: (codeParti: number): Promise<ResultatDepartement[]> =>
    resultatsDepartementApi.getAll({ parti: codeParti }),

  getByRegion: (codeRegion: number): Promise<ResultatDepartement[]> =>
    resultatsDepartementApi.getAll({ region: codeRegion }),

  // Calculer les pourcentages pour un département
  calculatePercentages: async (codeDepartement: number): Promise<ResultatDepartement[]> => {
    const resultats = await resultatsDepartementApi.getByDepartement(codeDepartement);
    const totalVotes = resultats.reduce((sum, resultat) => sum + resultat.nombre_vote, 0);
    
    return resultats.map(resultat => ({
      ...resultat,
      pourcentage: totalVotes > 0 ? (resultat.nombre_vote / totalVotes) * 100 : 0
    }));
  },

  // Obtenir les statistiques globales
  getStatistics: async (filters?: { departement?: number; region?: number }): Promise<{
    totalVotes: number;
    totalDepartements: number;
    totalPartis: number;
    resultats: ResultatDepartement[];
  }> => {
    const resultats = await resultatsDepartementApi.getAll(filters);
    const totalVotes = resultats.reduce((sum, resultat) => sum + resultat.nombre_vote, 0);
    const departements = new Set(resultats.map(r => r.code_departement));
    const partis = new Set(resultats.map(r => r.code_parti));
    
    return {
      totalVotes,
      totalDepartements: departements.size,
      totalPartis: partis.size,
      resultats
    };
  }
};
