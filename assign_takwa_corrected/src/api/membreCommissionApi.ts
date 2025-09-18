const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev';

export interface MembreCommission {
  code: number;
  noms_prenoms: string;
  contact: string;
  email: string;
  code_commission: number;
  code_fonction: number;
  date_creation: string;
  date_modification: string;
  commission?: {
    code: number;
    libelle: string;
    departement?: {
      code: number;
      libelle: string;
    };
  };
  fonction?: {
    code: number;
    libelle: string;
  };
}

export interface MembreCommissionInput {
  noms_prenoms: string;
  contact: string;
  email: string;
  code_commission: number;
  code_fonction: number;
}

// Helper function to handle API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Get all members
export const getAllMembres = async (): Promise<MembreCommission[]> => {
  try {
    return await apiCall('/api/membre-commission');
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

// Get member by ID
export const getMembreById = async (id: number): Promise<MembreCommission | null> => {
  try {
    return await apiCall(`/api/membre-commission/${id}`);
  } catch (error) {
    console.error('Error fetching member:', error);
    return null;
  }
};

// Create new member
export const createMembre = async (membreData: MembreCommissionInput): Promise<MembreCommission> => {
  try {
    return await apiCall('/api/membre-commission', {
      method: 'POST',
      body: JSON.stringify(membreData),
    });
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
};

// Update member
export const updateMembre = async (id: number, membreData: Partial<MembreCommissionInput>): Promise<MembreCommission> => {
  try {
    return await apiCall(`/api/membre-commission/${id}`, {
      method: 'PUT',
      body: JSON.stringify(membreData),
    });
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

// Delete member
export const deleteMembre = async (id: number): Promise<void> => {
  try {
    await apiCall(`/api/membre-commission/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};
