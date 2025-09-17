// types/auth.ts
export interface UserRole {
  code: number;
  libelle: string;
  permissions?: string[];
}

export interface UserDepartment {
  code: number;
  libelle: string;
  region?: {
    code: number;
    libelle: string;
  };
}

export interface UserSession {
  id: number;
  code: number;
  username: string;
  noms_prenoms: string;
  email: string;
  role: UserRole;
  contact?: string;
  departements?: UserDepartment[];
  permissions?: string[];
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: UserSession;
  token: string;
  message?: string;
}

export interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: UserSession; token: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string, context?: { departmentCode?: number; regionCode?: number; userId?: number }) => boolean;
  canAccessDepartment: (departmentCode: number) => boolean;
  refreshUser?: () => Promise<void>;
}

export interface PermissionContext {
  departmentCode?: number;
  regionCode?: number;
  userId?: number;
}

// Permission constants
export const PERMISSIONS = {
  // System admin permissions
  SYSTEM_ADMIN: 'system.admin',
  
  // User management
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Department data
  DATA_VIEW_DEPARTMENT: 'data.view_department',
  DATA_EDIT_DEPARTMENT: 'data.edit_department',
  
  // Participation
  PARTICIPATION_VIEW: 'participation.view',
  PARTICIPATION_EDIT: 'participation.edit',
  PARTICIPATION_MANAGE: 'participation.manage',
  
  // Results
  RESULTS_VIEW: 'results.view',
  RESULTS_EDIT: 'results.edit',
  RESULTS_MANAGE: 'results.manage',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  // Redressements (corrections)
  REDRESSEMENTS_VIEW: 'redressements.view',
  REDRESSEMENTS_MANAGE: 'redressements.manage',
  
  // PV submissions
  PV_VIEW: 'pv.view',
  PV_MANAGE: 'pv.manage',
  
  // Committee management
  COMMITTEE_VIEW: 'committee.view',
  COMMITTEE_MANAGE: 'committee.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];