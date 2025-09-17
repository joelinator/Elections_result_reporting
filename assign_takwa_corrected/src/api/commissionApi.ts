/**
 * @file API client pour la gestion des commissions départementales
 */

// Configuration de base - ajustez l'URL selon votre environnement
const API_BASE_URL = 'http://localhost:3000/api'; // Port du projet api-crud

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

export interface FonctionCommission {
  code: number;
  libelle: string;
  description?: string;
  date_ajout: string;
  membreCommissions?: MembreCommission[];
}

export interface CommissionDepartementale {
  code: number;
  code_departement: number;
  libelle: string;
  description?: string;
  date_creation: string;
  date_modification: string;
  departement?: Departement;
  membreCommissions?: MembreCommission[];
}

export interface MembreCommission {
  code: number;
  nom: string;
  code_fonction: number;
  code_commission?: number;
  contact?: string;
  email?: string;
  date_ajout: string;
  est_membre_secretariat: boolean;
  fonction?: FonctionCommission;
  commission?: CommissionDepartementale;
}

// API pour les départements
export const departementsApi = {
  getAll: (): Promise<Departement[]> => 
    apiFetch('/departements'),
};

// API pour les fonctions de commission
export const fonctionCommissionApi = {
  getAll: (): Promise<FonctionCommission[]> => 
    apiFetch('/fonction-commission'),
    
  getById: (id: number): Promise<FonctionCommission> => 
    apiFetch(`/fonction-commission/${id}`),
    
  create: (data: Omit<FonctionCommission, 'code' | 'date_ajout' | 'membreCommissions'>): Promise<FonctionCommission> => 
    apiFetch('/fonction-commission', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Omit<FonctionCommission, 'code' | 'date_ajout' | 'membreCommissions'>>): Promise<FonctionCommission> => 
    apiFetch(`/fonction-commission/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/fonction-commission/${id}`, {
      method: 'DELETE',
    }),
};

// API pour les commissions départementales
export const commissionDepartementaleApi = {
  getAll: (departementCode?: number): Promise<CommissionDepartementale[]> => {
    const params = departementCode ? `?departement=${departementCode}` : '';
    return apiFetch(`/commission-departementale${params}`);
  },
    
  getById: (id: number): Promise<CommissionDepartementale> => 
    apiFetch(`/commission-departementale/${id}`),
    
  create: (data: Omit<CommissionDepartementale, 'code' | 'date_creation' | 'date_modification' | 'departement' | 'membreCommissions'>): Promise<CommissionDepartementale> => 
    apiFetch('/commission-departementale', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Pick<CommissionDepartementale, 'libelle' | 'description'>>): Promise<CommissionDepartementale> => 
    apiFetch(`/commission-departementale/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/commission-departementale/${id}`, {
      method: 'DELETE',
    }),
};

// API pour les membres de commission
export const membreCommissionApi = {
  getAll: (filters?: { commission?: number; fonction?: number }): Promise<MembreCommission[]> => {
    const params = new URLSearchParams();
    if (filters?.commission) params.append('commission', filters.commission.toString());
    if (filters?.fonction) params.append('fonction', filters.fonction.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/membre-commission${queryString}`);
  },
    
  getById: (id: number): Promise<MembreCommission> => 
    apiFetch(`/membre-commission/${id}`),
    
  create: (data: Omit<MembreCommission, 'code' | 'date_ajout' | 'fonction' | 'commission'>): Promise<MembreCommission> => 
    apiFetch('/membre-commission', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<Omit<MembreCommission, 'code' | 'date_ajout' | 'fonction' | 'commission'>>): Promise<MembreCommission> => 
    apiFetch(`/membre-commission/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number): Promise<{ message: string }> => 
    apiFetch(`/membre-commission/${id}`, {
      method: 'DELETE',
    }),
};
