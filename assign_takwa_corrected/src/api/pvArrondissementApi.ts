const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev';

export interface PvArrondissement {
  code: number;
  code_arrondissement: number;
  url_pv?: string;
  hash_file?: string;
  libelle?: string;
  timestamp: string;
  arrondissement?: {
    code: number;
    libelle: string;
    abbreviation?: string;
    departement?: {
      code: number;
      libelle: string;
      region?: {
        code: number;
        libelle: string;
      };
    };
  };
}

export interface PvArrondissementInput {
  code_arrondissement: number;
  libelle: string;
  file?: File;
}

// Helper function to handle API calls
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Helper function to handle form data API calls
const apiFormCall = async (endpoint: string, formData: FormData, method: string = 'POST'): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Get all PV arrondissement
export const getAllPvs = async (arrondissementCode?: number): Promise<PvArrondissement[]> => {
  try {
    const params = arrondissementCode ? `?arrondissement=${arrondissementCode}` : '';
    return await apiCall(`/pv-arrondissement${params}`);
  } catch (error) {
    console.error('Error fetching PV arrondissement:', error);
    throw error;
  }
};

// Get PV by ID
export const getPvById = async (id: number): Promise<PvArrondissement> => {
  try {
    return await apiCall(`/pv-arrondissement/${id}`);
  } catch (error) {
    console.error('Error fetching PV arrondissement:', error);
    throw error;
  }
};

// Create new PV
export const createPv = async (pvData: PvArrondissementInput): Promise<PvArrondissement> => {
  try {
    const formData = new FormData();
    formData.append('code_arrondissement', pvData.code_arrondissement.toString());
    formData.append('libelle', pvData.libelle);
    if (pvData.file) formData.append('file', pvData.file);

    return await apiFormCall('/pv-arrondissement', formData, 'POST');
  } catch (error) {
    console.error('Error creating PV arrondissement:', error);
    throw error;
  }
};

// Update PV
export const updatePv = async (id: number, pvData: Partial<PvArrondissementInput>): Promise<PvArrondissement> => {
  try {
    const formData = new FormData();
    if (pvData.code_arrondissement) formData.append('code_arrondissement', pvData.code_arrondissement.toString());
    if (pvData.libelle) formData.append('libelle', pvData.libelle);
    if (pvData.file) formData.append('file', pvData.file);

    return await apiFormCall(`/pv-arrondissement/${id}`, formData, 'PUT');
  } catch (error) {
    console.error('Error updating PV arrondissement:', error);
    throw error;
  }
};

// Delete PV
export const deletePv = async (id: number): Promise<void> => {
  try {
    await apiCall(`/pv-arrondissement/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting PV arrondissement:', error);
    throw error;
  }
};
