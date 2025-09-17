// app/auth/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { AlertTriangle, Loader2, Eye, EyeOff, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const authService = new AuthService();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Login using AuthContext which handles token storage and state
      await login(formData.username,  formData.password);
      
      toast.success('Welcome back!');
      
      // Force navigation to dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const fillDemoCredentials = (role: 'admin' | 'supervisor' | 'operator') => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      supervisor: { username: 'jmballa', password: 'password123' },
      operator: { username: 'mngono', password: 'password123' }
    };

    setFormData(prev => ({
      ...prev,
      ...credentials[role]
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Elections App</h1>
          <p className="text-gray-600 mt-2">
            {t('auth.loginDescription') || 'Sign in to manage election data'}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <LanguageToggle />
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            {t('auth.signIn') || 'Sign In'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">
                {t('auth.username') || 'Username'}
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder={t('auth.usernamePlaceholder') || 'Enter your username'}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="password">
                {t('auth.password') || 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('auth.passwordPlaceholder') || 'Enter your password'}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                {t('auth.rememberMe') || 'Remember me'}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('auth.signingIn') || 'Signing in...'}
                </>
              ) : (
                t('auth.signIn') || 'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t('auth.demoCredentials') || 'Demo Credentials'}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('admin')}
                disabled={isLoading}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Administrator</div>
                  <div className="text-xs text-gray-500">admin / admin123</div>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('supervisor')}
                disabled={isLoading}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Department Supervisor</div>
                  <div className="text-xs text-gray-500">jmballa / password123</div>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('operator')}
                disabled={isLoading}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Data Entry Operator</div>
                  <div className="text-xs text-gray-500">mngono / password123</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            {t('auth.footerText') || 'Elections Result Reporting System'}
          </p>
          <p className="mt-1">
            {t('auth.version') || 'Version 1.0.0'}
          </p>
        </div>
      </div>
    </div>
  );
}