// components/auth/ProtectedRoute.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertTriangle, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  departmentCode?: number;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  departmentCode,
  fallbackPath = '/auth/login',
  showUnauthorized = true
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasPermission, canAccessDepartment } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath);
    }
  }, [isLoading, isAuthenticated, router, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null; // Router will redirect
  }

  // Check role requirement
  if (requiredRole && user.role.libelle !== requiredRole) {
    if (showUnauthorized) {
      return <UnauthorizedView reason="role" required={requiredRole} />;
    }
    router.push('/dashboard');
    return null;
  }

  // Check permission requirement
  if (requiredPermission) {
    const context = departmentCode ? { departmentCode } : undefined;
    if (!hasPermission(requiredPermission, context)) {
      if (showUnauthorized) {
        return <UnauthorizedView reason="permission" required={requiredPermission} />;
      }
      router.push('/dashboard');
      return null;
    }
  }

  // Check department access
  if (departmentCode && !canAccessDepartment(departmentCode)) {
    if (showUnauthorized) {
      return <UnauthorizedView reason="department" required={`Department ${departmentCode}`} />;
    }
    router.push('/departments');
    return null;
  }

  return <>{children}</>;
}

interface UnauthorizedViewProps {
  reason: 'role' | 'permission' | 'department';
  required: string;
}

function UnauthorizedView({ reason, required }: UnauthorizedViewProps) {
  const router = useRouter();
  const { user } = useAuth();

  const getMessage = () => {
    switch (reason) {
      case 'role':
        return `This page requires the role: ${required}. Your current role is: ${user?.role.libelle}`;
      case 'permission':
        return `You don't have the required permission: ${required}`;
      case 'department':
        return `You don't have access to ${required}`;
      default:
        return 'You are not authorized to view this page';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">
                {getMessage()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>

          {user && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{user.noms_prenoms}</span>
              </p>
              <p className="text-sm text-gray-600">
                Role: <span className="font-medium">{user.role.libelle}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}