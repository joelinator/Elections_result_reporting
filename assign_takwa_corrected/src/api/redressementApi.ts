/**
 * @file API client pour la gestion des redressements
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
export interface BureauVote {
  code: number;
  designation: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  effectif?: bigint;
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

export interface PartiPolitique {
  code: number;
  designation: string;
  abbreviation?: string;
  coloration_bulletin?: string;
  image?: string;
  candidat?: {
    code: number;
    noms_prenoms: string;
    photo?: string;
  };
}

export interface RedressementCandidat {
  code: number;
  code_bureau_vote?: number;
  code_parti?: number;
  nombre_vote_initial?: number;
  nombre_vote_redresse?: number;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    code: number;
    designation: string;
    arrondissement?: {
      code: number;
      libelle: string;
      abbreviation?: string;
      departement?: {
        code: number;
        libelle: string;
        abbreviation?: string;
      };
    };
  };
  parti?: {
    code: number;
    designation: string;
    abbreviation?: string;
    coloration_bulletin?: string;
    candidat?: {
      code: number;
      noms_prenoms: string;
    };
  };
}

export interface RedressementBureauVote {
  code: number;
  code_bureau_vote?: number;
  nombre_inscrit_initial?: number;
  nombre_inscrit_redresse?: number;
  nombre_votant_initial?: number;
  nombre_votant_redresse?: number;
  taux_participation_initial?: number;
  taux_participation_redresse?: number;
  bulletin_nul_initial?: number;
  bulletin_nul_redresse?: number;
  suffrage_exprime_valables_initial?: number;
  suffrage_exprime_valables_redresse?: number;
  erreurs_materielles_initiales?: string;
  erreurs_materielles_initiales_redresse?: string;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    code: number;
    designation: string;
    description?: string;
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
  };
}

// Types pour la création/modification
export type RedressementCandidatInput = Omit<RedressementCandidat, 'code' | 'date_redressement' | 'bureauVote' | 'parti'>;
export type RedressementBureauVoteInput = Omit<RedressementBureauVote, 'code' | 'date_redressement' | 'bureauVote'>;

// API pour les bureaux de vote
export const bureauxVoteApi = {
  getAll: (filters?: { arrondissement?: number; departement?: number }): Promise<BureauVote[]> => {
    const params = new URLSearchParams();
    if (filters?.arrondissement) params.append('arrondissement', filters.arrondissement.toString());
    if (filters?.departement) params.append('departement', filters.departement.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/bureaux-vote${queryString}`);
  },
};

// API pour les partis politiques
export const partisPolitiquesApi = {
  getAll: (): Promise<PartiPolitique[]> => 
    apiFetch('/partis-politiques'),
};

// API pour les redressements candidat
export const redressementCandidatApi = {
  getAll: (filters?: { bureau_vote?: number; parti?: number; arrondissement?: number }): Promise<RedressementCandidat[]> => {
    const params = new URLSearchParams();
    if (filters?.bureau_vote) params.append('bureau_vote', filters.bureau_vote.toString());
    if (filters?.parti) params.append('parti', filters.parti.toString());
    if (filters?.arrondissement) params.append('arrondissement', filters.arrondissement.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/redressement-candidat${queryString}`);
  },
    
  getById: (id: number): Promise<RedressementCandidat> => 
    apiFetch(`/redressement-candidat/${id}`),
    
  create: (data: RedressementCandidatInput): Promise<RedressementCandidat> => 
    apiFetch('/redressement-candidat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Omit<RedressementCandidatInput, 'code_bureau_vote' | 'code_parti'>>): Promise<RedressementCandidat> => 
    apiFetch(`/redressement-candidat/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/redressement-candidat/${id}`, {
      method: 'DELETE',
    }),

  // Calculer la différence de votes
  calculateDifference: (initial?: number, redresse?: number): number => {
    if (initial === undefined || redresse === undefined) return 0;
    return redresse - initial;
  },

  // Calculer le pourcentage de changement
  calculatePercentageChange: (initial?: number, redresse?: number): number => {
    if (!initial || initial === 0) return 0;
    if (redresse === undefined) return 0;
    return ((redresse - initial) / initial) * 100;
  }
};

// API pour les redressements bureau de vote
export const redressementBureauVoteApi = {
  getAll: (filters?: { bureau_vote?: number; arrondissement?: number; departement?: number }): Promise<RedressementBureauVote[]> => {
    const params = new URLSearchParams();
    if (filters?.bureau_vote) params.append('bureau_vote', filters.bureau_vote.toString());
    if (filters?.arrondissement) params.append('arrondissement', filters.arrondissement.toString());
    if (filters?.departement) params.append('departement', filters.departement.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/redressement-bureau-vote${queryString}`);
  },
    
  getById: (id: number): Promise<RedressementBureauVote> => 
    apiFetch(`/redressement-bureau-vote/${id}`),
    
  create: (data: RedressementBureauVoteInput): Promise<RedressementBureauVote> => 
    apiFetch('/redressement-bureau-vote', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Omit<RedressementBureauVoteInput, 'code_bureau_vote'>>): Promise<RedressementBureauVote> => 
    apiFetch(`/redressement-bureau-vote/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/redressement-bureau-vote/${id}`, {
      method: 'DELETE',
    }),

  // Calculer le taux de participation
  calculateTauxParticipation: (votants?: number, inscrits?: number): number => {
    if (!inscrits || inscrits === 0) return 0;
    if (votants === undefined) return 0;
    return Math.round((votants / inscrits) * 10000) / 100; // 2 décimales
  },

  // Calculer la différence entre initial et redressé
  calculateDifference: (initial?: number, redresse?: number): number => {
    if (initial === undefined || redresse === undefined) return 0;
    return redresse - initial;
  },

  // Calculer le pourcentage de changement
  calculatePercentageChange: (initial?: number, redresse?: number): number => {
    if (!initial || initial === 0) return 0;
    if (redresse === undefined) return 0;
    return ((redresse - initial) / initial) * 100;
  },

  // Validation des données
  validateData: (data: Partial<RedressementBureauVoteInput>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Vérifications de cohérence pour les données initiales
    if (data.nombre_votant_initial && data.nombre_inscrit_initial && 
        data.nombre_votant_initial > data.nombre_inscrit_initial) {
      errors.push('Le nombre de votants initial ne peut pas être supérieur au nombre d\'inscrits initial');
    }

    // Vérifications de cohérence pour les données redressées
    if (data.nombre_votant_redresse && data.nombre_inscrit_redresse && 
        data.nombre_votant_redresse > data.nombre_inscrit_redresse) {
      errors.push('Le nombre de votants redressé ne peut pas être supérieur au nombre d\'inscrits redressé');
    }

    // Vérifications pour les suffrages valables
    if (data.suffrage_exprime_valables_initial && data.nombre_votant_initial && 
        data.suffrage_exprime_valables_initial > data.nombre_votant_initial) {
      errors.push('Les suffrages valables initiaux ne peuvent pas être supérieurs au nombre de votants initial');
    }

    if (data.suffrage_exprime_valables_redresse && data.nombre_votant_redresse && 
        data.suffrage_exprime_valables_redresse > data.nombre_votant_redresse) {
      errors.push('Les suffrages valables redressés ne peuvent pas être supérieurs au nombre de votants redressé');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
