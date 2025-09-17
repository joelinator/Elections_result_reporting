/**
 * @file Ce fichier gère les appels à l'API backend pour les données électorales.
 */

//const BASE_URL = 'http://api.voteflow.cm/api';
 const BASE_URL = 'https://turbo-barnacle-7pqj6gpp75jhrpww-3000.app.github.dev/api';



// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper pour les appels fetch
const apiFetch = async (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  try {
    //console.log(`API CALL: Fetching from ${url}...`);
    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur inconnue du serveur'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Échec de la récupération pour ${url}:`, error);
    throw error; // Re-throw l'erreur pour que React Query puisse la gérer
  }
};

// Helper pour les appels POST/PUT/PATCH
const apiMutate = async (endpoint: string, method: 'POST' | 'PUT' | 'PATCH' = 'POST', data?: any) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  try {
    console.log(`API CALL: ${method} to ${url}...`);
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur inconnue du serveur'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Échec de la ${method} pour ${url}:`, error);
    throw error;
  }
};


/**
 * Endpoint 1: Récupère les statistiques nationales globales.
 * GET /api/stats
 */
export const getNationalStats = async (validationStatus: number = 1) => {
  return apiFetch(`/stats?validation_status=${validationStatus}`);
};

/**
 * Endpoint 2: Récupère les données détaillées pour toutes les régions.
 * GET /api/regions
 */
export const getRegionsData = async (validationStatus: number = 1) => {
  return apiFetch(`/regions?validation_status=${validationStatus}&include_party_details=true`);
};

/**
 * Endpoint 3: Récupère les résultats nationaux par parti.
 * GET /api/results/national
 */
export const getNationalResults = async (validationStatus: number = 1) => {
  return apiFetch(`/results/national?validation_status=${validationStatus}&include_party_details=true`);
};

 

/**
 * Endpoint 5: Récupère les résultats des bureaux de vote en attente de validation.
 * GET /api/election/resultats?statut_validation=0&user_id={userId}
 */
export const getPollingStationResults = async (validationStatus: number = 0, userId?: number) => {
  const userParam = userId ? `&user_id=${userId}` : '';
  return apiFetch(`/election/resultats?statut_validation=${validationStatus}${userParam}`);
};

/**
 * Endpoint 6: Valide un résultat d'un bureau de vote.
 * PUT /api/election/resultats/{code}/validate?user_id={userId}
 */
export const validatePollingStationResult = async (resultCode: number, userId?: number) => {
  const userParam = userId ? `?user_id=${userId}` : '';
  return apiMutate(`/election/resultats/${resultCode}/validate${userParam}`, 'PUT', { statut_validation: 1 });
};

/**
 * Endpoint 7: Valide plusieurs résultats en lot.
 * PUT /api/election/resultats/validate/bulk?user_id={userId}
 */
export const validateMultipleResults = async (resultCodes: number[], userId?: number) => {
  const userParam = userId ? `?user_id=${userId}` : '';
  return apiMutate(`/election/resultats/validate/bulk${userParam}`, 'PUT', { codes: resultCodes });
};

/**
 * Endpoint 8: Récupère les détails d'un résultat spécifique.
 * GET /api/election/resultats/{code}
 */
export const getPollingStationResultDetails = async (resultCode: number) => {
  return apiFetch(`/election/resultats/${resultCode}`);
};

/**
 * Endpoint 9: Met à jour un résultat d'un bureau de vote.
 * PATCH /api/election/resultats/{code}
 */
export const updatePollingStationResult = async (resultCode: number, data: { nombre_vote: number }) => {
  return apiMutate(`/election/resultats/${resultCode}`, 'PATCH', data);
};



// REPORTS
export const getComprehensiveReports = async (reportType: string) => {
  const url = `/election/report/${reportType}`;
  return apiFetch(url);
};

export const getRegionReports = async (reportType: string, regionId:number) => {
  const url = `/region-report/${reportType}/${regionId}`;
  return apiFetch(url);
};

export const getArrondissementReports = async (reportType: string, arrondissementID: number) => {
  const url = `/arrondissement-report/${reportType}/${arrondissementID}`;
  return apiFetch(url);
};

export const getDepartementReports = async (reportType: string, departementId: number) => {
  const url = `/departement-report/${reportType}/${departementId}`;
  return apiFetch(url);
};


/**
 * Endpoint 1: Récupère les statistiques nationales globales.
 * GET /api/stats
 */


export const getDepartements = async () => {
  return apiFetch('/territoriale/departements')
}

export const getArrondissements = async () => {
  return apiFetch('/territoriale/arrondissements')
}

export const getRegions = async () => {
  return apiFetch('/territoriale/regions')
}

// Authentication types
export interface LoginCredentials {
  login: string;
  password: string;
}

export interface Role {
  code: number;
  libelle: string;
}

export interface User {
  code: number;
  username: string;
  email: string;
  noms_prenoms: string;
  role?: Role; // Single role (legacy support)
  roles?: Role[]; // Multiple roles (new structure)
  arrondissementCode: number;
  arrondissements: Array<{
    code: number;
    code_departement: number;
    code_region: number;
    abbreviation: string;
    libelle: string;
    description?: string | null;
    code_createur?: number | null;
    code_modificateur?: number | null;
    date_creation?: string | null;
    date_modification?: string | null;
  }>;
}

export interface TerritorialAccess {
  user_exists: boolean;
  is_utilisateur_region: boolean;
  is_utilisateur_departement: boolean;
  is_utilisateur_arrondissement: boolean;
  is_utilisateur_bureau_vote: boolean;
}

export interface UserTerritorialAssignments {
  regions: Array<{ code: number; libelle: string }>;
  departements: Array<{ code: number; libelle: string }>;
  arrondissements: Array<{ code: number; libelle: string }>;
  bureaux_vote: Array<{ code: number; libelle: string }>;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/**
 * Authentication: Login user
 * POST /api/auth/login
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const url = `${BASE_URL}/auth/login`;
  try {
    console.log(`API CALL: POST to ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Identifiants invalides. Vérifiez votre email et mot de passe.');
      }
      if (response.status === 403) {
        throw new Error('Accès refusé. Contactez votre administrateur.');
      }
      if (response.status === 429) {
        throw new Error('Trop de tentatives de connexion. Veuillez patienter avant de réessayer.');
      }
      if (response.status >= 500) {
        throw new Error('Erreur du serveur. Veuillez réessayer plus tard.');
      }
      
      // Fallback for other errors
      const message = errorData.message || errorData.error || 'Erreur de connexion inconnue';
      throw new Error(message);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Échec de la connexion pour ${url}:`, error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    }
    
    throw error;
  }
};

/**
 * Authentication: Refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = async (refresh: string): Promise<{ accessToken: string; expiresIn: number }> => {
  const url = `${BASE_URL}/auth/refresh`;
  try {
    console.log(`API CALL: POST to ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Erreur ${response.status}: ${errorData.message || 'Impossible de renouveler la session'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Échec du renouvellement pour ${url}:`, error);
    throw error;
  }
};

// PV (Procès-Verbal) types
export interface PV {
  code: number;
  code_bureau_vote: number;
  url_pv: string;
  hash_file: string;
  timestamp: string;
}

/**
 * Get PV (Procès-Verbal) for a specific bureau de vote
 * GET /api/election/proces-verbaux/bureau/{codeBureauVote}
 */
export const getPVForBureau = async (codeBureauVote: number): Promise<PV[]> => {
  return apiFetch(`/election/proces-verbaux/bureau/${codeBureauVote}`);
};

// Territorial Results API Functions

/**
 * Get all regions (unfiltered - shows all regions in system)
 * GET /api/territoriale/regions
 */
export const getAllRegions = async () => {
  return apiFetch('/territoriale/regions');
};

/**
 * Get user-assigned regions only (JWT-secured)
 * Uses synthesis data to determine accessible regions, then gets proper region details
 */
export const getUserAssignedRegions = async () => {
  try {
    // First, try to get the user's regional synthesis data (already JWT-filtered)
    const synthesisData = await apiFetch('/election/synthese/regionales');
    
    console.log('🔍 [REGION DEBUG] Raw synthesis data sample (first 3 items):', synthesisData.slice(0, 3));
    console.log('🔍 [REGION DEBUG] Total synthesis records:', synthesisData.length);
    
    // Check what regions are represented in the synthesis data
    const regionsInData = new Set();
    synthesisData.forEach((item: any) => {
      const regionCode = item.code_region || item.codeRegion || item.region_code;
      if (regionCode) regionsInData.add(regionCode);
    });
    console.log('🔍 [REGION DEBUG] Regions found in synthesis data:', Array.from(regionsInData));
    console.log('🔍 [REGION DEBUG] Total regions found:', regionsInData.size);
    
    if (!synthesisData || synthesisData.length === 0) {
      console.warn('No synthesis data available, falling back to all regions');
      return getAllRegions();
    }
    
    // Extract unique region codes from synthesis data
    const userRegionCodes = new Set();
    
    console.log('🔍 [REGION DEBUG] Analyzing synthesis data for region codes...');
    
    // Debug: Show sample of synthesis data for troubleshooting
    console.log('🔍 [REGION DEBUG] Sample synthesis data items:', synthesisData.slice(0, 2));
    
    synthesisData.forEach((item: any) => {
      // Try different possible field names for region code
      const regionCode = item.code_region || item.codeRegion || item.region_code;
      
      if (regionCode) {
        userRegionCodes.add(regionCode);
      }
    });
    
    console.log('🔍 [REGION DEBUG] Final extracted region codes:', Array.from(userRegionCodes));
    
    // Allow users to see all regions they have access to
    console.log('🔍 [REGION DEBUG] User has access to regions:', Array.from(userRegionCodes));
    
    if (userRegionCodes.size === 0) {
      console.warn('No region codes extracted from synthesis data, falling back to all regions');
      return getAllRegions();
    }
    
    // Now get all regions and filter to only user's regions
    const allRegions = await getAllRegions();
    const userRegions = allRegions.filter((region: any) => 
      userRegionCodes.has(region.code)
    );
    
    console.log('🔍 [REGION DEBUG] Filtered user regions:', userRegions.map((r: any) => ({ code: r.code, libelle: r.libelle })));
    
    return userRegions;
    
  } catch (error) {
    console.error('Failed to get user assigned regions:', error);
    // Fallback to all regions if synthesis fails
    return getAllRegions();
  }
};

/**
 * Get departments by region
 * GET /api/territoriale/departements/region/{codeRegion}
 */
export const getDepartementsByRegion = async (codeRegion: number) => {
  return apiFetch(`/territoriale/departements/region/${codeRegion}`);
};

/**
 * Get user-assigned departments only (JWT-secured)
 * Extracts departments from user's synthesis data
 */
export const getUserAssignedDepartments = async () => {
  try {
    const synthesisData = await apiFetch('/election/synthese/departements');
    
    // Extract unique departments from synthesis data
    const uniqueDepartments = new Map();
    synthesisData.forEach((item: any) => {
      if (item.code_departement && item.libelle_departement) {
        uniqueDepartments.set(item.code_departement, {
          code: item.code_departement,
          libelle: item.libelle_departement,
          code_region: item.code_region // Include region for filtering
        });
      }
    });
    
    return Array.from(uniqueDepartments.values());
  } catch (error) {
    console.error('Failed to get user assigned departments:', error);
    return [];
  }
};

/**
 * Get arrondissements by department
 * GET /api/territoriale/arrondissements/departement/{codeDepartement}
 */
export const getArrondissementsByDepartement = async (codeDepartement: number) => {
  return apiFetch(`/territoriale/arrondissements/departement/${codeDepartement}`);
};

/**
 * Get user-assigned arrondissements only (JWT-secured)
 * Extracts arrondissements from user's synthesis data
 */
export const getUserAssignedArrondissements = async () => {
  try {
    const synthesisData = await apiFetch('/election/synthese/arrondissements');
    
    // Extract unique arrondissements from synthesis data
    const uniqueArrondissements = new Map();
    synthesisData.forEach((item: any) => {
      if (item.code_arrondissement && item.libelle_arrondissement) {
        uniqueArrondissements.set(item.code_arrondissement, {
          code: item.code_arrondissement,
          libelle: item.libelle_arrondissement,
          code_departement: item.code_departement, // Include department for filtering
          code_region: item.code_region // Include region for filtering
        });
      }
    });
    
    return Array.from(uniqueArrondissements.values());
  } catch (error) {
    console.error('Failed to get user assigned arrondissements:', error);
    return [];
  }
};

/**
 * Get bureaux de vote by arrondissement
 * GET /api/territoriale/bureaux-vote/arrondissement/{codeArrondissement}
 */
export const getBureauxVoteByArrondissement = async (codeArrondissement: string) => {
  return apiFetch(`/territoriale/bureaux-vote/arrondissement/${codeArrondissement}`);
};

/**
 * Get results by region
 * GET /api/election/resultats/region/{codeRegion}
 */
export const getResultsByRegion = async (codeRegion: number) => {
  return apiFetch(`/election/resultats/region/${codeRegion}`);
};

/**
 * Get results by department
 * GET /api/election/resultats/departement/{codeDepartement}
 */
export const getResultsByDepartement = async (codeDepartement: number) => {
  return apiFetch(`/election/resultats/departement/${codeDepartement}`);
};

/**
 * Get results by arrondissement
 * GET /api/election/resultats/arrondissement/{codeArrondissement}
 */
export const getResultsByArrondissement = async (codeArrondissement: number) => {
  return apiFetch(`/election/resultats/arrondissement/${codeArrondissement}`);
};

/**
 * Get results by bureau de vote
 * GET /api/election/resultats/bureau/{codeBureau}
 */
export const getResultsByBureau = async (codeBureau: number) => {
  return apiFetch(`/election/resultats/bureau/${codeBureau}`);
};

/**
 * Get all results by regions
 * GET /api/election/resultats/regions/all
 */
export const getAllResultsByRegions = async () => {
  return apiFetch('/election/resultats/regions/all');
};

/**
 * Get all results by departments
 * GET /api/election/resultats/departements/all
 */
export const getAllResultsByDepartements = async () => {
  return apiFetch('/election/resultats/departements/all');
};

/**
 * Get all results by arrondissements
 * GET /api/election/resultats/arrondissements/all
 */
export const getAllResultsByArrondissements = async () => {
  return apiFetch('/election/resultats/arrondissements/all');
};

// Synthesis API Functions

/**
 * Get arrondissement synthesis data filtered by user's territorial access (via JWT)
 * GET /api/election/synthese/arrondissements (JWT-secured)
 */
export const getAllArrondissementSynthesis = async (arrondissementCodes?: number[]) => {
  if (arrondissementCodes && arrondissementCodes.length > 0) {
    const codeArrondissementParam = arrondissementCodes.join(',');
    return apiFetch(`/election/synthese/arrondissements?code_arrondissements=${codeArrondissementParam}&include_party_details=true`);
  }
  
  // Get all arrondissement data for user (server filters by JWT user's territorial access)
  return apiFetch('/election/synthese/arrondissements?include_party_details=true');
};

/**
 * Get synthesis for specific arrondissement
 * GET /api/election/synthese/arrondissement/{codeArrondissement}
 */
export const getArrondissementSynthesis = async (codeArrondissement: number) => {
  return apiFetch(`/election/synthese/arrondissement/${codeArrondissement}`);
};



export const handleConfirmGenerate = async (format: string, selectedId: number, reportType: string) => {

  try {
    let endpoint = '';
    switch (reportType) {
      case 'comprehensive':
        endpoint = `${BASE_URL}/general-report/${format}`;
        break;
      case 'national':
        endpoint = `${BASE_URL}/national-report/${format}`;
        break;
      case 'regional':
        endpoint = `${BASE_URL}/region-report/${format}/${selectedId}`;
        break;
      case 'departement':
        endpoint = `${BASE_URL}/departement-report/${format}/${selectedId}`;
        break;
      case 'arrondissement':
        endpoint = `${BASE_URL}/arrondissement-report/${format}/${selectedId}`;
        break;
    }

    const response = await fetch(`${endpoint}`);

    if (!response.ok) throw new Error('Erreur lors de la génération du rapport');

    // We expect a blob (binary file) response
    const blob = await response.blob();

    // Create URL for download
    const fileURL = URL.createObjectURL(blob);

    // Attempt to extract filename from content-disposition header
    let filename = `report-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.${format}`;

    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[9];
    }

    const link = document.createElement('a');
    link.href = fileURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    URL.revokeObjectURL(fileURL);
    // Save info to state to show download button
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erreur inattendue');
  } finally {
  }
};


// Cache for user regions to avoid repeated lookups
let _cachedUserRegions: any[] | null = null;
let _cachedUserRegionsTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get departement synthesis data filtered by user's territorial access (via JWT)
 * Includes all user-accessible departments, even those with zero votes
 * GET /api/election/synthese/departements (JWT-secured)
 */
export const getAllDepartementSynthesis = async (departementCodes?: number[]) => {
  try {
    // Get synthesis data (only departments with data)
    let synthesisData;
    if (departementCodes && departementCodes.length > 0) {
      const codeDepartementParam = departementCodes.join(',');
      synthesisData = await apiFetch(`/election/synthese/departements?code_departements=${codeDepartementParam}&include_party_details=true`);
    } else {
      synthesisData = await apiFetch('/election/synthese/departements?include_party_details=true');
    }
    
    console.log('🔍 [DEPT DEBUG] Raw department synthesis data length:', synthesisData?.length);
    
    // Try to get user's regions first to determine all accessible departments
    try {
      // Use cached regions if available and fresh
      let userRegions = _cachedUserRegions;
      const now = Date.now();
      
      if (!userRegions || (now - _cachedUserRegionsTimestamp) > CACHE_DURATION) {
        console.log('🔍 [DEPT DEBUG] Fetching fresh user regions...');
        userRegions = await getUserAssignedRegions();
        _cachedUserRegions = userRegions;
        _cachedUserRegionsTimestamp = now;
      } else {
        console.log('🔍 [DEPT DEBUG] Using cached user regions...');
      }
      
      console.log('🔍 [DEPT DEBUG] User regions:', userRegions?.map((r: any) => ({ code: r.code, libelle: r.libelle })));
      
      if (userRegions && userRegions.length > 0) {
        // Get all departments for user's regions
        const allUserDepartments = [];
        
        for (const region of userRegions) {
          try {
            const regionDepartments = await getDepartementsByRegion(region.code);
            allUserDepartments.push(...regionDepartments);
          } catch (error) {
            console.warn(`Failed to get departments for region ${region.code}:`, error);
          }
        }
        
        console.log('🔍 [DEPT DEBUG] All user departments:', allUserDepartments);
        
        // Merge synthesis data with all departments
        const synthesisMap = new Map();
        synthesisData.forEach((item: any) => {
          const key = `${item.code_departement}-${item.code_parti}`;
          synthesisMap.set(key, item);
        });
        
        // Get all political parties from synthesis data
        const allParties = new Set<string>();
        synthesisData.forEach((item: any) => {
          if (item.parti) {
            allParties.add(JSON.stringify(item.parti));
          }
        });
        
        const partiesArray = Array.from(allParties).map((p: string) => JSON.parse(p));
        console.log('🔍 [DEPT DEBUG] All parties:', partiesArray);
        
        // Create complete dataset - every department x every party
        const completeData: any[] = [];
        
        allUserDepartments.forEach((dept: any) => {
          partiesArray.forEach((party: any) => {
            const key = `${dept.code}-${party.code}`;
            const existingData = synthesisMap.get(key);
            
            if (existingData) {
              // Use existing synthesis data
              completeData.push(existingData);
            } else {
              // Create zero-data entry for missing combinations
              completeData.push({
                code: null,
                code_departement: dept.code,
                departement: {
                  code: dept.code,
                  libelle: dept.libelle
                },
                code_parti: party.code,
                parti: party,
                nombre_vote: 0,
                nombre_inscrit: 0,
                nombre_votant: 0,
                bulletin_nul: 0,
                code_createur: null,
                code_modificateur: null,
                date_creation: null,
                date_modification: null
              });
            }
          });
        });
        
        console.log('🔍 [DEPT DEBUG] Complete department data summary:', {
          totalRecords: completeData.length,
          departments: Array.from(new Set(completeData.map((item: any) => item.code_departement))).sort(),
          parties: Array.from(new Set(completeData.map((item: any) => item.code_parti))).sort(),
          sampleRecord: completeData[0]
        });
        return completeData;
      }
    } catch (error) {
      console.warn('Failed to enhance department data with zeros:', error);
    }
    
    // Fallback to original synthesis data
    return synthesisData;
    
  } catch (error) {
    console.error('Failed to get department synthesis:', error);
    throw error;
  }
};

/**
 * Get synthesis for specific departement
 * GET /api/election/synthese/departement/{codeDepartement}
 */
export const getDepartementSynthesis = async (codeDepartement: number) => {
  return apiFetch(`/election/synthese/departement/${codeDepartement}`);
};

/**
 * Get regional synthesis data filtered by user's assigned regions (via JWT)
 * Server extracts user ID from JWT token and automatically filters regions
 * GET /api/election/synthese/regionales (all user's regions)
 * GET /api/election/synthese/regionales?code_regions=1,2,3 (specific regions, filtered by user access)
 */
export const getAllRegionalSynthesis = async (regionCodes?: number[]) => {
  if (regionCodes && regionCodes.length > 0) {
    const codeRegionsParam = regionCodes.join(',');
    return apiFetch(`/election/synthese/regionales?code_regions=${codeRegionsParam}&include_party_details=true`);
  }
  
  // Get all regional data for user (server filters by JWT user's assigned regions)
  return apiFetch('/election/synthese/regionales?include_party_details=true');
};


/**
 * Get synthesis for specific region
 * GET /api/election/synthese/region/{codeRegion}
 */
export const getRegionalSynthesis = async (codeRegion: number) => {
  return apiFetch(`/election/synthese/region/${codeRegion}`);
};

/**
 * Get bureau vote synthesis data filtered by user's territorial access (via JWT)
 * GET /api/election/synthese/bureau-votes (JWT-secured)
 *
 * @param bureauCodes - Optional array of bureau codes to filter by
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 100, max: 1000)
 * @param includePartyDetails - Whether to include party details (default: true)
 */
export const getAllBureauVoteSynthesis = async (
  bureauCodes?: number[],
  page: number = 1,
  limit: number = 100,
  includePartyDetails: boolean = true
) => {
  const params = new URLSearchParams();

  // Add pagination parameters
  params.append('page', page.toString());
  params.append('limit', Math.min(limit, 1000).toString()); // Ensure limit doesn't exceed 1000

  // Add party details parameter
  params.append('include_party_details', includePartyDetails.toString());

  // Add bureau codes if provided
  if (bureauCodes && bureauCodes.length > 0) {
    params.append('code_bureaux', bureauCodes.join(','));
  }

  return apiFetch(`/election/synthese/bureau-votes?${params.toString()}`);
};

/**
 * Get synthesis for specific bureau de vote
 * GET /api/election/synthese/bureau/{codeBureau}
 */
export const getBureauVoteSynthesis = async (codeBureau: number) => {
  return apiFetch(`/election/synthese/bureau/${codeBureau}`);
};

/**
 * Trigger full aggregation
 * PUT /api/election/synthese/aggregate
 */
export const triggerSynthesisAggregation = async () => {
  return apiMutate('/election/synthese/aggregate', 'PUT');
};

// Participation types
export interface Participation {
  code: number;
  code_bureau_vote: number;
  nombre_inscrit: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime: number;
  taux_participation: number;
  code_createur: number;
  code_modificateur: number;
  date_creation: string;
  date_modification: string;
  bureau_vote?: {
    code: number;
    designation: string;
    code_arrondissement: number;
    // ... other bureau_vote fields
  };
}

export interface UpdateParticipationDto {
  nombre_inscrit?: number;
  nombre_votant?: number;
  bulletin_nul?: number;
  suffrage_exprime?: number;
  taux_participation?: number;
  code_modificateur: number;
}

// Participation API Functions

/**
 * Get all participations
 * GET /api/election/participations
 */
export const getAllParticipations = async (): Promise<Participation[]> => {
  return apiFetch('/election/participations');
};

/**
 * Get participation by bureau de vote
 * GET /api/election/participations/bureau/{codeBureauVote}
 */
export const getParticipationByBureau = async (codeBureauVote: number): Promise<Participation> => {
  return apiFetch(`/election/participations/bureau/${codeBureauVote}`);
};

/**
 * Update participation for a bureau de vote
 * PATCH /api/election/participations/bureau/{codeBureauVote}
 */
export const updateParticipation = async (codeBureauVote: number, data: UpdateParticipationDto): Promise<Participation> => {
  return apiMutate(`/election/participations/bureau/${codeBureauVote}`, 'PATCH', data);
};

/**
 * Get user's territorial assignments by checking all possible assignments
 * Uses the check-territorial-assignments endpoint without parameters to get all assignments
 */
export const getUserTerritorialAssignments = async (_codeUtilisateur: number): Promise<UserTerritorialAssignments> => {
  // For now, return empty assignments - this would need to be implemented differently
  // or we need a separate endpoint to get user's actual assignments
  return {
    regions: [],
    departements: [],
    arrondissements: [],
    bureaux_vote: []
  };
};

/**
 * Check user's territorial assignments
 * GET /api/users/check-territorial-assignments/{code_utilisateur}
 */
export const checkTerritorialAssignments = async (
  codeUtilisateur: number,
  params?: {
    code_region?: number;
    code_departement?: number;
    code_arrondissement?: number;
    code_bureau_vote?: number;
  }
): Promise<TerritorialAccess> => {
  const queryParams = new URLSearchParams();
  if (params?.code_region) queryParams.append('code_region', params.code_region.toString());
  if (params?.code_departement) queryParams.append('code_departement', params.code_departement.toString());
  if (params?.code_arrondissement) queryParams.append('code_arrondissement', params.code_arrondissement.toString());
  if (params?.code_bureau_vote) queryParams.append('code_bureau_vote', params.code_bureau_vote.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/users/check-territorial-assignments/${codeUtilisateur}${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch(endpoint);
};

/**
 * Get user department results
 * GET /api/user-department-results
 * Returns election results for departments assigned to the authenticated user
 */
export const getUserDepartmentResults = async () => {
  return apiFetch('/user-department-results');
};

/**
 * Get user arrondissement results
 * GET /api/user-arrondissement-results
 * Returns election results for arrondissements assigned to the authenticated user
 */
export const getUserArrondissementResults = async () => {
  return apiFetch('/user-arrondissement-results');
};

/**
 * Progress tracking API functions
 * These APIs track the progress of polling station submissions
 */

/**
 * Get progress overview for all regions assigned to authenticated user
 * GET /api/progress
 */
export const getProgressOverview = async () => {
  return apiFetch('/progress');
};

/**
 * Get progress for departments within a specific region
 * GET /api/progress/region/:regionId
 */
export const getRegionProgress = async (regionId: number) => {
  return apiFetch(`/progress/region/${regionId}`);
};

/**
 * Get progress for arrondissements within a specific department
 * GET /api/progress/region/:regionId/department/:departmentId
 */
export const getDepartmentProgress = async (regionId: number, departmentId: number) => {
  return apiFetch(`/progress/region/${regionId}/department/${departmentId}`);
}; 