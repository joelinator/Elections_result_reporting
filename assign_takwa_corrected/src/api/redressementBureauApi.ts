const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev';

export interface RedressementBureau {
  code: number;
  code_bureau_vote: number;
  nombre_inscrit_initial: number;
  nombre_inscrit_redresse: number;
  nombre_votant_initial: number;
  nombre_votant_redresse: number;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    code: number;
    designation: string;
    arrondissement?: {
      code: number;
      libelle: string;
      departement?: {
        code: number;
        libelle: string;
      };
    };
  };
}

export interface RedressementBureauInput {
  code_bureau_vote: number;
  nombre_inscrit_initial: number;
  nombre_inscrit_redresse: number;
  nombre_votant_initial: number;
  nombre_votant_redresse: number;
  raison_redressement?: string;
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

// Get all redressements bureau
export const getAllRedressementsBureau = async (): Promise<RedressementBureau[]> => {
  try {
    return await apiCall('/api/redressement-bureau');
  } catch (error) {
    console.error('Error fetching redressements bureau:', error);
    return [];
  }
};

// Get redressement by ID
export const getRedressementBureauById = async (id: number): Promise<RedressementBureau | null> => {
  try {
    return await apiCall(`/api/redressement-bureau/${id}`);
  } catch (error) {
    console.error('Error fetching redressement bureau:', error);
    return null;
  }
};

// Create new redressement bureau
export const createRedressementBureau = async (redressementData: RedressementBureauInput): Promise<RedressementBureau> => {
  try {
    return await apiCall('/api/redressement-bureau', {
      method: 'POST',
      body: JSON.stringify(redressementData),
    });
  } catch (error) {
    console.error('Error creating redressement bureau:', error);
    throw error;
  }
};

// Update redressement bureau
export const updateRedressementBureau = async (id: number, redressementData: Partial<RedressementBureauInput>): Promise<RedressementBureau> => {
  try {
    return await apiCall(`/api/redressement-bureau/${id}`, {
      method: 'PUT',
      body: JSON.stringify(redressementData),
    });
  } catch (error) {
    console.error('Error updating redressement bureau:', error);
    throw error;
  }
};

// Delete redressement bureau
export const deleteRedressementBureau = async (id: number): Promise<void> => {
  try {
    await apiCall(`/api/redressement-bureau/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting redressement bureau:', error);
    throw error;
  }
};
