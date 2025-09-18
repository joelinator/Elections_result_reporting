// API for checking user territorial access and associations

export interface UserDepartmentAccess {
  code_departement: number;
  libelle_departement: string;
  code_region: number;
  libelle_region: string;
  date_affectation: string;
}

export interface UserArrondissementAccess {
  code_arrondissement: number;
  libelle_arrondissement: string;
  code_departement: number;
  libelle_departement: string;
  code_region: number;
  libelle_region: string;
  date_affectation: string;
}

export interface UserBureauVoteAccess {
  code_bureau_vote: number;
  designation: string;
  code_arrondissement: number;
  libelle_arrondissement: string;
  code_departement: number;
  libelle_departement: string;
  code_region: number;
  libelle_region: string;
  date_affectation: string;
}

export interface TerritorialAccess {
  departments: UserDepartmentAccess[];
  arrondissements: UserArrondissementAccess[];
  bureauVotes: UserBureauVoteAccess[];
}

// Check if user has access to a specific department
export const checkUserDepartmentAccess = async (departmentCode: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/territorial-access/department/${departmentCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check department access');
    }
    
    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Error checking department access:', error);
    return false;
  }
};

// Check if user has access to a specific arrondissement
export const checkUserArrondissementAccess = async (arrondissementCode: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/territorial-access/arrondissement/${arrondissementCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check arrondissement access');
    }
    
    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Error checking arrondissement access:', error);
    return false;
  }
};

// Check if user has access to a specific bureau de vote
export const checkUserBureauVoteAccess = async (bureauVoteCode: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/territorial-access/bureau-vote/${bureauVoteCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check bureau de vote access');
    }
    
    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Error checking bureau de vote access:', error);
    return false;
  }
};

// Get all territorial access for current user
export const getUserTerritorialAccess = async (): Promise<TerritorialAccess> => {
  try {
    const response = await fetch('/api/territorial-access/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get territorial access');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting territorial access:', error);
    return {
      departments: [],
      arrondissements: [],
      bureauVotes: []
    };
  }
};

// Check if user can edit data for a specific department
export const canEditDepartmentData = async (departmentCode: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/territorial-access/can-edit-department/${departmentCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check department edit access');
    }
    
    const data = await response.json();
    return data.canEdit;
  } catch (error) {
    console.error('Error checking department edit access:', error);
    return false;
  }
};

// Check if user can edit data for a specific arrondissement
export const canEditArrondissementData = async (arrondissementCode: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/territorial-access/can-edit-arrondissement/${arrondissementCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check arrondissement edit access');
    }
    
    const data = await response.json();
    return data.canEdit;
  } catch (error) {
    console.error('Error checking arrondissement edit access:', error);
    return false;
  }
};

// Check if user can edit data for a specific bureau de vote
export const canEditBureauVoteData = async (bureauVoteCode: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/territorial-access/can-edit-bureau-vote/${bureauVoteCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check bureau de vote edit access');
    }
    
    const data = await response.json();
    return data.canEdit;
  } catch (error) {
    console.error('Error checking bureau de vote edit access:', error);
    return false;
  }
};
