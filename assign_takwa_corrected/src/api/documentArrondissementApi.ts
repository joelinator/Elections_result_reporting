const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev';

export interface DocumentArrondissement {
  code: number;
  code_arrondissement: number;
  type_document: string;
  titre: string;
  description?: string;
  url_document?: string;
  statut: string;
  date_creation: string;
  date_modification: string;
  arrondissement?: {
    code: number;
    libelle: string;
    departement?: {
      code: number;
      libelle: string;
    };
  };
}

export interface DocumentArrondissementInput {
  code_arrondissement: number;
  type_document: string;
  titre: string;
  description?: string;
  url_document?: string;
  statut?: string;
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

// Get all documents
export const getAllDocuments = async (): Promise<DocumentArrondissement[]> => {
  try {
    return await apiCall('/api/document-arrondissement');
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Get document by ID
export const getDocumentById = async (id: number): Promise<DocumentArrondissement | null> => {
  try {
    return await apiCall(`/api/document-arrondissement/${id}`);
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

// Create new document
export const createDocument = async (documentData: DocumentArrondissementInput): Promise<DocumentArrondissement> => {
  try {
    const formData = new FormData();
    formData.append('code_arrondissement', documentData.code_arrondissement.toString());
    formData.append('type_document', documentData.type_document);
    formData.append('titre', documentData.titre);
    if (documentData.description) formData.append('description', documentData.description);
    if (documentData.statut) formData.append('statut', documentData.statut);
    if (documentData.file) formData.append('file', documentData.file);

    return await apiFormCall('/api/document-arrondissement', formData, 'POST');
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

// Update document
export const updateDocument = async (id: number, documentData: Partial<DocumentArrondissementInput>): Promise<DocumentArrondissement> => {
  try {
    const formData = new FormData();
    if (documentData.code_arrondissement) formData.append('code_arrondissement', documentData.code_arrondissement.toString());
    if (documentData.type_document) formData.append('type_document', documentData.type_document);
    if (documentData.titre) formData.append('titre', documentData.titre);
    if (documentData.description) formData.append('description', documentData.description);
    if (documentData.statut) formData.append('statut', documentData.statut);
    if (documentData.file) formData.append('file', documentData.file);

    return await apiFormCall(`/api/document-arrondissement/${id}`, formData, 'PUT');
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (id: number): Promise<void> => {
  try {
    await apiCall(`/api/document-arrondissement/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};
