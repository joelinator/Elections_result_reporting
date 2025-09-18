// API client for managing ParticipationCommune (arrondissement participation data)


const API_BASE_URL = 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev/api';

// Helper function to safely parse JSON response
const parseJsonResponse = async (response: Response): Promise<any> => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Invalid JSON response from server');
  }
};

export interface ParticipationCommune {
  code: number;
  codeCommune: number;
  nombreBureaux?: number;
  nombreInscrits?: number;
  nombreVotants?: number;
  tauxParticipation?: number;
  bulletinsNuls?: number;
  suffragesValables?: number;
  tauxAbstention?: number;
  dateCreation: string;
  dateModification: string;
  commune?: {
    code: number;
    libelle: string;
    codeDepartement: number;
    departement?: {
      code: number;
      libelle: string;
    };
  };
}

export interface ParticipationCommuneInput {
  codeCommune: number;
  nombreBureaux?: number;
  nombreInscrits?: number;
  nombreVotants?: number;
  tauxParticipation?: number;
  bulletinsNuls?: number;
  suffragesValables?: number;
  tauxAbstention?: number;
}

export interface ParticipationCommuneUpdate extends Partial<ParticipationCommuneInput> {
  code: number;
}

// Get all participation commune data
export const getAllParticipationCommune = async (): Promise<ParticipationCommune[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch participation commune data');
    }

    return await parseJsonResponse(response);
  } catch (error) {
    console.error('Error fetching participation commune data:', error);
    throw error;
  }
};

// Get participation commune data for a specific arrondissement
export const getParticipationCommuneByArrondissement = async (arrondissementCode: number): Promise<ParticipationCommune[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/arrondissement/${arrondissementCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch participation commune data for arrondissement');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching participation commune data for arrondissement:', error);
    throw error;
  }
};

// Get participation commune data for user's assigned arrondissements
export const getParticipationCommuneForUser = async (): Promise<ParticipationCommune[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user participation commune data');
    }

    return await parseJsonResponse(response);
  } catch (error) {
    console.error('Error fetching user participation commune data:', error);
    throw error;
  }
};

// Get participation commune by ID
export const getParticipationCommuneById = async (id: number): Promise<ParticipationCommune> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching participation commune data:', error);
    throw error;
  }
};

// Create new participation commune data
export const createParticipationCommune = async (data: ParticipationCommuneInput): Promise<ParticipationCommune> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating participation commune data:', error);
    throw error;
  }
};

// Update participation commune data
export const updateParticipationCommune = async (id: number, data: ParticipationCommuneUpdate): Promise<ParticipationCommune> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating participation commune data:', error);
    throw error;
  }
};

// Delete participation commune data
export const deleteParticipationCommune = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete participation commune data');
    }
  } catch (error) {
    console.error('Error deleting participation commune data:', error);
    throw error;
  }
};

// Validate participation commune data
export const validateParticipationCommune = async (id: number): Promise<ParticipationCommune> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/${id}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to validate participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating participation commune data:', error);
    throw error;
  }
};

// Approve participation commune data
export const approveParticipationCommune = async (id: number): Promise<ParticipationCommune> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error approving participation commune data:', error);
    throw error;
  }
};

// Reject participation commune data
export const rejectParticipationCommune = async (id: number, reason?: string): Promise<ParticipationCommune> => {
  try {
    const response = await fetch(`${API_BASE_URL}/participation-commune/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting participation commune data:', error);
    throw error;
  }
};

// Bulk operations
export const bulkValidateParticipationCommune = async (ids: number[]): Promise<ParticipationCommune[]> => {
  try {
    const response = await fetch('/api/participation-commune/bulk/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ ids })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to bulk validate participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error bulk validating participation commune data:', error);
    throw error;
  }
};

export const bulkApproveParticipationCommune = async (ids: number[]): Promise<ParticipationCommune[]> => {
  try {
    const response = await fetch('/api/participation-commune/bulk/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ ids })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to bulk approve participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error bulk approving participation commune data:', error);
    throw error;
  }
};

export const bulkRejectParticipationCommune = async (ids: number[], reason?: string): Promise<ParticipationCommune[]> => {
  try {
    const response = await fetch('/api/participation-commune/bulk/reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ ids, reason })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to bulk reject participation commune data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error bulk rejecting participation commune data:', error);
    throw error;
  }
};

// Utility functions
export const calculateParticipationRate = (inscrits: number, votants: number): number => {
  if (inscrits === 0) return 0;
  return Number(((votants / inscrits) * 100).toFixed(2));
};

export const calculateAbstentionRate = (inscrits: number, votants: number): number => {
  if (inscrits === 0) return 0;
  return Number((((inscrits - votants) / inscrits) * 100).toFixed(2));
};

export const validateParticipationData = (data: ParticipationCommuneInput): string[] => {
  const errors: string[] = [];

  if (!data.codeCommune || data.codeCommune <= 0) {
    errors.push('Code commune est requis');
  }

  if (data.nombreInscrits !== undefined && data.nombreInscrits < 0) {
    errors.push('Le nombre d\'inscrits ne peut pas être négatif');
  }

  if (data.nombreVotants !== undefined && data.nombreVotants < 0) {
    errors.push('Le nombre de votants ne peut pas être négatif');
  }

  if (data.nombreBureaux !== undefined && data.nombreBureaux < 0) {
    errors.push('Le nombre de bureaux ne peut pas être négatif');
  }

  if (data.bulletinsNuls !== undefined && data.bulletinsNuls < 0) {
    errors.push('Le nombre de bulletins nuls ne peut pas être négatif');
  }

  if (data.suffragesValables !== undefined && data.suffragesValables < 0) {
    errors.push('Le nombre de suffrages valables ne peut pas être négatif');
  }

  if (data.nombreInscrits && data.nombreVotants && data.nombreVotants > data.nombreInscrits) {
    errors.push('Le nombre de votants ne peut pas dépasser le nombre d\'inscrits');
  }

  if (data.nombreVotants && data.bulletinsNuls && data.suffragesValables) {
    const total = data.bulletinsNuls + data.suffragesValables;
    if (total > data.nombreVotants) {
      errors.push('La somme des bulletins nuls et suffrages valables ne peut pas dépasser le nombre de votants');
    }
  }

  return errors;
};

export const generateParticipationReport = (data: ParticipationCommune[]): {
  totalArrondissements: number;
  totalInscrits: number;
  totalVotants: number;
  totalBureaux: number;
  averageParticipationRate: number;
  averageAbstentionRate: number;
} => {
  const totalArrondissements = data.length;
  const totalInscrits = data.reduce((sum, item) => sum + (item.nombreInscrits || 0), 0);
  const totalVotants = data.reduce((sum, item) => sum + (item.nombreVotants || 0), 0);
  const totalBureaux = data.reduce((sum, item) => sum + (item.nombreBureaux || 0), 0);
  
  const participationRates = data
    .filter(item => item.nombreInscrits && item.nombreVotants)
    .map(item => calculateParticipationRate(item.nombreInscrits!, item.nombreVotants!));
  
  const averageParticipationRate = participationRates.length > 0 
    ? Number((participationRates.reduce((sum, rate) => sum + rate, 0) / participationRates.length).toFixed(2))
    : 0;
  
  const averageAbstentionRate = 100 - averageParticipationRate;

  return {
    totalArrondissements,
    totalInscrits,
    totalVotants,
    totalBureaux,
    averageParticipationRate,
    averageAbstentionRate
  };
};
