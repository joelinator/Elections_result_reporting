import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { checkTerritorialAssignments, type TerritorialAccess } from '../api/electionApi';

interface TerritorialAccessHook {
  territorialAccess: TerritorialAccess | undefined;
  isLoading: boolean;
  isError: boolean;
  userLevel: 'region' | 'department' | 'arrondissement' | 'bureau' | 'unknown';
  isRegionalUser: boolean;
  isDepartmentUser: boolean;
  isArrondissementUser: boolean;
  isBureauUser: boolean;
  canAccessRegion: (regionCode: number) => boolean;
  canAccessDepartment: (departmentCode: number) => boolean;
  canAccessArrondissement: (arrondissementCode: number) => boolean;
  canAccessBureau: (bureauCode: number) => boolean;
  // New: Get user's accessible region codes
  getUserRegionCodes: () => number[];
  getUserDepartmentCodes: () => number[];
  getUserArrondissementCodes: () => number[];
  getUserBureauCodes: () => number[];
}

/**
 * Custom hook to determine user's territorial access using the check-territorial-assignments endpoint
 */
export const useTerritorialAccess = (
  territorialFilters?: {
    selectedRegion?: number | null;
    selectedDepartment?: number | null;
    selectedArrondissement?: number | null;
  }
): TerritorialAccessHook => {
  const { user } = useAuth();

  // Check territorial access without parameters to determine user's base level
  const { data: baseTerritorialAccess, isLoading: isLoadingBase, isError: isErrorBase } = useQuery({
    queryKey: ['territorial-access-base', user?.code],
    queryFn: () => {
      if (!user?.code) {
        throw new Error('User not authenticated');
      }
      // Call without parameters to get base user existence check
      return checkTerritorialAssignments(user.code);
    },
    enabled: !!user?.code,
  });

  // Check current territorial access (if filters are provided)
  const { data: territorialAccess, isLoading: isLoadingAccess, isError: isErrorAccess } = useQuery({
    queryKey: ['territorial-access-filtered', user?.code, territorialFilters],
    queryFn: () => {
      if (!user?.code) {
        throw new Error('User not authenticated');
      }

      const params = {
        ...(territorialFilters?.selectedRegion && { code_region: territorialFilters.selectedRegion }),
        ...(territorialFilters?.selectedDepartment && { code_departement: territorialFilters.selectedDepartment }),
        ...(territorialFilters?.selectedArrondissement && { code_arrondissement: territorialFilters.selectedArrondissement }),
      };

      // Only check if we have filters to validate
      if (Object.keys(params).length === 0) {
        return null;
      }

      return checkTerritorialAssignments(user.code, params);
    },
    enabled: !!user?.code && territorialFilters && (
      !!territorialFilters.selectedRegion || 
      !!territorialFilters.selectedDepartment || 
      !!territorialFilters.selectedArrondissement
    ),
  });

  // For now, we'll determine user level based on role or make educated guesses
  // In a real implementation, we'd need either:
  // 1. A separate endpoint to get user assignments
  // 2. Or check multiple specific territorial codes to determine user level
  const userLevel: 'region' | 'department' | 'arrondissement' | 'bureau' | 'unknown' = (() => {
    if (!baseTerritorialAccess?.user_exists) return 'unknown';
    
    // Since we can't determine the exact level from the current endpoint,
    // we'll default to allowing full access for now
    // This should be improved with proper assignment data
    return 'region'; // Default to regional level access
  })();

  // Helper functions to check access - simplified for now
  const canAccessRegion = (_regionCode: number): boolean => {
    // For now, return true - in real implementation, this would check against user's assignments
    return true;
  };

  const canAccessDepartment = (_departmentCode: number): boolean => {
    // For now, return true - in real implementation, this would check against user's assignments
    return true;
  };

  const canAccessArrondissement = (_arrondissementCode: number): boolean => {
    // For now, return true - in real implementation, this would check against user's assignments
    return true;
  };

  const canAccessBureau = (_bureauCode: number): boolean => {
    // For now, return true - in real implementation, this would check against user's assignments
    return true;
  };

  // Get user's accessible codes - for now return all available codes
  // TODO: Replace with actual user assignments from API
  const getUserRegionCodes = (): number[] => {
    // For now, return all region codes 1-10 (Cameroon has 10 regions)
    // In real implementation, this would come from user's territorial assignments
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  };

  const getUserDepartmentCodes = (): number[] => {
    // For now, return empty - would be populated based on user level and assignments
    return [];
  };

  const getUserArrondissementCodes = (): number[] => {
    // For now, return empty - would be populated based on user level and assignments
    return [];
  };

  const getUserBureauCodes = (): number[] => {
    // For now, return empty - would be populated based on user level and assignments
    return [];
  };

  return {
    territorialAccess: territorialAccess || baseTerritorialAccess,
    isLoading: isLoadingBase || isLoadingAccess,
    isError: isErrorBase || isErrorAccess,
    userLevel,
    isRegionalUser: true, // Simplified for now
    isDepartmentUser: false,
    isArrondissementUser: false,
    isBureauUser: false,
    canAccessRegion,
    canAccessDepartment,
    canAccessArrondissement,
    canAccessBureau,
    getUserRegionCodes,
    getUserDepartmentCodes,
    getUserArrondissementCodes,
    getUserBureauCodes,
  };
};

/**
 * Hook to get current user's code_utilisateur
 * Checks localStorage first, then falls back to context
 */
export const useCurrentUser = () => {
  const { user } = useAuth();
  
  // Try localStorage first
  const getCodeUtilisateur = (): number | null => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.code || null;
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
    
    // Fall back to context
    return user?.code || null;
  };

  return {
    codeUtilisateur: getCodeUtilisateur(),
    user: user || null,
    isAuthenticated: !!user,
  };
};