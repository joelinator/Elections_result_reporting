const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev';

export interface PvDepartement {
  code: number;
  code_departement: number;
  numero_pv: string;
  date_etablissement: string;
  url_pv?: string;
  statut: string;
  date_creation: string;
  date_modification: string;
  departement?: {
    code: number;
    libelle: string;
    region?: {
      code: number;
      libelle: string;
    };
  };
}

export interface PvDepartementInput {
  code_departement: number;
  libelle: string;
  file?: File;
}

// Helper function to handle API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
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

// Helper function to handle file uploads
const apiFormCall = async (endpoint: string, formData: FormData, method: string = 'POST') => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Get all PVs
export const getAllPvs = async (): Promise<PvDepartement[]> => {
  try {
    return await apiCall('/api/pv-departement');
  } catch (error) {
    console.error('Error fetching PVs:', error);
    return [];
  }
};

// Get PV by ID
export const getPvById = async (id: number): Promise<PvDepartement | null> => {
  try {
    return await apiCall(`/api/pv-departement/${id}`);
  } catch (error) {
    console.error('Error fetching PV:', error);
    return null;
  }
};

// Create new PV
export const createPv = async (pvData: PvDepartementInput): Promise<PvDepartement> => {
  try {
    const formData = new FormData();
    formData.append('code_departement', pvData.code_departement.toString());
    formData.append('libelle', pvData.libelle);
    if (pvData.file) formData.append('file', pvData.file);

    return await apiFormCall('/api/pv-departement', formData, 'POST');
  } catch (error) {
    console.error('Error creating PV:', error);
    throw error;
  }
};

// Update PV
export const updatePv = async (id: number, pvData: Partial<PvDepartementInput>): Promise<PvDepartement> => {
  try {
    const formData = new FormData();
    if (pvData.code_departement) formData.append('code_departement', pvData.code_departement.toString());
    if (pvData.libelle) formData.append('libelle', pvData.libelle);
    if (pvData.file) formData.append('file', pvData.file);

    return await apiFormCall(`/api/pv-departement/${id}`, formData, 'PUT');
  } catch (error) {
    console.error('Error updating PV:', error);
    throw error;
  }
};

// Delete PV
export const deletePv = async (id: number): Promise<void> => {
  try {
    await apiCall(`/api/pv-departement/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting PV:', error);
    throw error;
  }
};
