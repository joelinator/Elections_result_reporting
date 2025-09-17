/**
 * @file API client pour la gestion des participations départementales
 */

// Configuration de base
const API_BASE_URL = 'http://localhost:3000/api';

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
export interface ParticipationDepartement {
  code: number;
  code_departement: number;
  nombre_bureau_vote: number;
  nombre_inscrit: number;
  nombre_enveloppe_urnes: number;
  nombre_enveloppe_bulletins_differents: number;
  nombre_bulletin_electeur_identifiable: number;
  nombre_bulletin_enveloppes_signes: number;
  nombre_enveloppe_non_elecam: number;
  nombre_bulletin_non_elecam: number;
  nombre_bulletin_sans_enveloppe: number;
  nombre_enveloppe_vide: number;
  nombre_suffrages_valable: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime?: number;
  taux_participation?: number;
  date_creation?: string;
  departement?: {
    code: number;
    libelle: string;
    abbreviation?: string;
    chef_lieu?: string;
    region?: {
      code: number;
      libelle: string;
      abbreviation?: string;
    };
  };
}

// Type pour la création/modification (sans les champs calculés et relations)
export type ParticipationDepartementInput = Omit<ParticipationDepartement, 'code' | 'date_creation' | 'departement'>;

// API pour les participations départementales
export const participationDepartementApi = {
  getAll: (filters?: { departement?: number; region?: number }): Promise<ParticipationDepartement[]> => {
    const params = new URLSearchParams();
    if (filters?.departement) params.append('departement', filters.departement.toString());
    if (filters?.region) params.append('region', filters.region.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/participation-departement${queryString}`);
  },
    
  getById: (id: number): Promise<ParticipationDepartement> => 
    apiFetch(`/participation-departement/${id}`),
    
  create: (data: ParticipationDepartementInput): Promise<ParticipationDepartement> => 
    apiFetch('/participation-departement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Omit<ParticipationDepartementInput, 'code_departement'>>): Promise<ParticipationDepartement> => 
    apiFetch(`/participation-departement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/participation-departement/${id}`, {
      method: 'DELETE',
    }),

  // Fonctions utilitaires pour les calculs
  calculateTauxParticipation: (nombreVotant: number, nombreInscrit: number): number => {
    if (nombreInscrit === 0) return 0;
    return Math.round((nombreVotant / nombreInscrit) * 10000) / 100; // 2 décimales
  },

  calculateSuffrageExprime: (nombreSuffragesValable: number, nombreVotant: number): number => {
    if (nombreVotant === 0) return 0;
    return Math.round((nombreSuffragesValable / nombreVotant) * 10000) / 100; // 2 décimales
  },

  // Validation des données
  validateData: (data: Partial<ParticipationDepartementInput>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Vérifications de cohérence
    if (data.nombre_votant && data.nombre_inscrit && data.nombre_votant > data.nombre_inscrit) {
      errors.push('Le nombre de votants ne peut pas être supérieur au nombre d\'inscrits');
    }

    if (data.nombre_suffrages_valable && data.nombre_votant && data.nombre_suffrages_valable > data.nombre_votant) {
      errors.push('Le nombre de suffrages valables ne peut pas être supérieur au nombre de votants');
    }

    if (data.bulletin_nul && data.nombre_votant && data.bulletin_nul > data.nombre_votant) {
      errors.push('Le nombre de bulletins nuls ne peut pas être supérieur au nombre de votants');
    }

    // Vérification de la somme des bulletins
    if (data.nombre_suffrages_valable && data.bulletin_nul && data.nombre_votant) {
      const totalBulletins = data.nombre_suffrages_valable + data.bulletin_nul;
      if (totalBulletins > data.nombre_votant) {
        errors.push('La somme des suffrages valables et bulletins nuls ne peut pas être supérieure au nombre de votants');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
