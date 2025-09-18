import { API_BASE_URL } from './config';

export interface ResultatDepartement {
  code: number;
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
  date_creation?: string;
  departement: {
    code: number;
    libelle: string;
    code_region: number;
    region: {
      code: number;
      libelle: string;
    };
  };
  parti: {
    code: number;
    designation: string;
    abbreviation: string;
  };
}

export interface Departement {
  code: number;
  libelle: string;
  abbreviation?: string;
  code_region: number;
  region: {
    code: number;
    libelle: string;
  };
}

export interface ResultatDepartementFilters {
  departement?: number;
  parti?: number;
  userId?: number;
}

// Get all resultat departement data with optional filtering
export const getResultatsDepartement = async (filters: ResultatDepartementFilters = {}): Promise<ResultatDepartement[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.departement) {
      params.append('departement', filters.departement.toString());
    }
    if (filters.parti) {
      params.append('parti', filters.parti.toString());
    }
    if (filters.userId) {
      params.append('userId', filters.userId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/resultat-departement?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching resultats departement:', error);
    throw error;
  }
};

// Get accessible departments for a user
export const getAccessibleDepartements = async (userId: number): Promise<Departement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departements/accessible?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching accessible departments:', error);
    throw error;
  }
};

// Create new resultat departement
export const createResultatDepartement = async (data: {
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
}): Promise<ResultatDepartement> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resultat-departement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating resultat departement:', error);
    throw error;
  }
};

// Update resultat departement
export const updateResultatDepartement = async (id: number, data: {
  code_departement?: number;
  code_parti?: number;
  nombre_vote?: number;
  pourcentage?: number;
}): Promise<ResultatDepartement> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resultat-departement/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating resultat departement:', error);
    throw error;
  }
};

// Delete resultat departement
export const deleteResultatDepartement = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resultat-departement/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting resultat departement:', error);
    throw error;
  }
};