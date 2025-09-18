import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserTerritorialAccess, 
  checkUserDepartmentAccess, 
  checkUserArrondissementAccess, 
  checkUserBureauVoteAccess,
  canEditDepartmentData,
  canEditArrondissementData,
  canEditBureauVoteData,
  type TerritorialAccess 
} from '../api/territorialAccessApi';

export const useTerritorialAccessControl = () => {
  const { user } = useAuth();
  const [territorialAccess, setTerritorialAccess] = useState<TerritorialAccess>({
    departments: [],
    arrondissements: [],
    bureauVotes: []
  });
  const [loading, setLoading] = useState(true);

  // Load territorial access on mount
  useEffect(() => {
    const loadTerritorialAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const access = await getUserTerritorialAccess();
        setTerritorialAccess(access);
      } catch (error) {
        console.error('Error loading territorial access:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTerritorialAccess();
  }, [user]);

  // Check if user has access to a department
  const hasDepartmentAccess = async (departmentCode: number): Promise<boolean> => {
    if (!user) return false;
    
    // Admin has access to everything
    const roleNames = getUserRoleNames();
    if (roleNames.includes('administrateur')) return true;
    
    // Check if user is assigned to this department
    const hasDirectAccess = territorialAccess.departments.some(
      dept => dept.code_departement === departmentCode
    );
    
    if (hasDirectAccess) return true;
    
    // Check via API for real-time verification
    return await checkUserDepartmentAccess(departmentCode);
  };

  // Check if user has access to an arrondissement
  const hasArrondissementAccess = async (arrondissementCode: number): Promise<boolean> => {
    if (!user) return false;
    
    // Admin has access to everything
    const roleNames = getUserRoleNames();
    if (roleNames.includes('administrateur')) return true;
    
    // Check if user is assigned to this arrondissement
    const hasDirectAccess = territorialAccess.arrondissements.some(
      arr => arr.code_arrondissement === arrondissementCode
    );
    
    if (hasDirectAccess) return true;
    
    // Check via API for real-time verification
    return await checkUserArrondissementAccess(arrondissementCode);
  };

  // Check if user has access to a bureau de vote
  const hasBureauVoteAccess = async (bureauVoteCode: number): Promise<boolean> => {
    if (!user) return false;
    
    // Admin has access to everything
    const roleNames = getUserRoleNames();
    if (roleNames.includes('administrateur')) return true;
    
    // Check if user is assigned to this bureau de vote
    const hasDirectAccess = territorialAccess.bureauVotes.some(
      bv => bv.code_bureau_vote === bureauVoteCode
    );
    
    if (hasDirectAccess) return true;
    
    // Check via API for real-time verification
    return await checkUserBureauVoteAccess(bureauVoteCode);
  };

  // Check if user can edit data for a department
  const canEditDepartment = async (departmentCode: number): Promise<boolean> => {
    if (!user) return false;
    
    const roleNames = getUserRoleNames();
    
    // Admin can edit everything
    if (roleNames.includes('administrateur')) return true;
    
    // Only specific roles can edit
    const canEditRoles = ['superviseur-departementale', 'superviseur-regionale', 'scrutateur', 'validateur'];
    const hasEditRole = canEditRoles.some(role => roleNames.includes(role));
    
    if (!hasEditRole) return false;
    
    // Check territorial access
    const hasAccess = await hasDepartmentAccess(departmentCode);
    if (!hasAccess) return false;
    
    // Check via API for real-time verification
    return await canEditDepartmentData(departmentCode);
  };

  // Check if user can edit data for an arrondissement
  const canEditArrondissement = async (arrondissementCode: number): Promise<boolean> => {
    if (!user) return false;
    
    const roleNames = getUserRoleNames();
    
    // Admin can edit everything
    if (roleNames.includes('administrateur')) return true;
    
    // Only specific roles can edit
    const canEditRoles = ['superviseur-departementale', 'superviseur-regionale', 'scrutateur', 'validateur'];
    const hasEditRole = canEditRoles.some(role => roleNames.includes(role));
    
    if (!hasEditRole) return false;
    
    // Check territorial access
    const hasAccess = await hasArrondissementAccess(arrondissementCode);
    if (!hasAccess) return false;
    
    // Check via API for real-time verification
    return await canEditArrondissementData(arrondissementCode);
  };

  // Check if user can edit data for a bureau de vote
  const canEditBureauVote = async (bureauVoteCode: number): Promise<boolean> => {
    if (!user) return false;
    
    const roleNames = getUserRoleNames();
    
    // Admin can edit everything
    if (roleNames.includes('administrateur')) return true;
    
    // Only specific roles can edit
    const canEditRoles = ['superviseur-departementale', 'superviseur-regionale', 'scrutateur', 'validateur'];
    const hasEditRole = canEditRoles.some(role => roleNames.includes(role));
    
    if (!hasEditRole) return false;
    
    // Check territorial access
    const hasAccess = await hasBureauVoteAccess(bureauVoteCode);
    if (!hasAccess) return false;
    
    // Check via API for real-time verification
    return await canEditBureauVoteData(bureauVoteCode);
  };

  // Check if user can view data (read-only access)
  const canViewData = (): boolean => {
    if (!user) return false;
    
    const roleNames = getUserRoleNames();
    
    // All specified roles can view
    const canViewRoles = [
      'administrateur', 
      'superviseur-departementale', 
      'superviseur-regionale', 
      'scrutateur', 
      'validateur',
      'observateur-local',
      'observateur'
    ];
    
    return canViewRoles.some(role => roleNames.includes(role));
  };

  // Get user role names helper
  const getUserRoleNames = (): string[] => {
    const normalize = (s: string) => s?.toString().trim().toLowerCase();
    if (!user) return [];
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.map(r => normalize(r.libelle));
    }
    if (user.role) {
      return [normalize(user.role.libelle)];
    }
    return [];
  };

  return {
    territorialAccess,
    loading,
    hasDepartmentAccess,
    hasArrondissementAccess,
    hasBureauVoteAccess,
    canEditDepartment,
    canEditArrondissement,
    canEditBureauVote,
    canViewData,
    getUserRoleNames
  };
};
