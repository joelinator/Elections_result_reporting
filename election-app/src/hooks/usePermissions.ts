// hooks/usePermissions.ts
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export interface PermissionContext {
  departmentCode?: number;
  regionCode?: number;
  userId?: number;
}

export function usePermissions() {
  const { user, hasPermission, canAccessDepartment } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return user.permissions;
  }, [user]);

  const checkPermission = (permission: string, context?: PermissionContext): boolean => {
    return hasPermission(permission, context);
  };

  const checkMultiplePermissions = (permissionList: string[], context?: PermissionContext, requireAll = false): boolean => {
    if (requireAll) {
      return permissionList.every(permission => hasPermission(permission, context));
    } else {
      return permissionList.some(permission => hasPermission(permission, context));
    }
  };

  const checkRole = (role: string): boolean => {
    return user?.role.libelle === role;
  };

  const checkAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role.libelle);
  };

  const isAdmin = (): boolean => {
    return checkRole('Administrateur Système');
  };

  const isSupervisor = (): boolean => {
    return checkAnyRole(['Superviseur National', 'Responsable Régional', 'Responsable Départemental']);
  };

  const canManageUsers = (): boolean => {
    return checkPermission('users.manage') || isAdmin();
  };

  const canViewReports = (): boolean => {
    return checkPermission('reports.generate') || checkPermission('reports.view');
  };

  const canManageData = (departmentCode?: number): boolean => {
    const context = departmentCode ? { departmentCode } : undefined;
    return checkMultiplePermissions([
      'data.edit_all',
      'data.edit_department',
      'data.edit_region'
    ], context);
  };

  const canViewData = (departmentCode?: number): boolean => {
    const context = departmentCode ? { departmentCode } : undefined;
    return checkMultiplePermissions([
      'data.view_all',
      'data.view_department',
      'data.view_region',
      'data.view_assigned'
    ], context);
  };

  const canAccessDepartmentData = (departmentCode: number): boolean => {
    if (isAdmin()) return true;
    
    return canAccessDepartment(departmentCode) && 
           canViewData(departmentCode);
  };

  const getUserDepartments = () => {
    return user?.departements || [];
  };

  const getAssignedDepartmentCodes = (): number[] => {
    return getUserDepartments().map(d => d.code);
  };

  const hasAnyDepartmentAccess = (): boolean => {
    return isAdmin() || getUserDepartments().length > 0;
  };

  // Participation specific permissions
  const canEditParticipation = (departmentCode?: number): boolean => {
    const context = departmentCode ? { departmentCode } : undefined;
    return checkMultiplePermissions([
      'participation.manage',
      'participation.edit'
    ], context);
  };

  const canManageResults = (departmentCode?: number): boolean => {
    const context = departmentCode ? { departmentCode } : undefined;
    return checkMultiplePermissions([
      'results.manage',
      'results.edit'
    ], context);
  };

  const canManageRedressements = (departmentCode?: number): boolean => {
    const context = departmentCode ? { departmentCode } : undefined;
    return checkPermission('redressements.manage', context);
  };

  return {
    // Raw permissions
    permissions,
    user,
    
    // Permission checking functions
    checkPermission,
    checkMultiplePermissions,
    checkRole,
    checkAnyRole,
    
    // Role checks
    isAdmin,
    isSupervisor,
    
    // Feature permissions
    canManageUsers,
    canViewReports,
    canManageData,
    canViewData,
    canAccessDepartmentData,
    canEditParticipation,
    canManageResults,
    canManageRedressements,
    
    // Department access
    canAccessDepartment,
    getUserDepartments,
    getAssignedDepartmentCodes,
    hasAnyDepartmentAccess
  };
}