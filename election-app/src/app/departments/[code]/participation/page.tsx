// app/departments/[code]/participation/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { ParticipationForm } from '@/components/features/participation/ParticipationForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ParticipationService } from '@/services/participationService';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Save, AlertTriangle, CheckCircle } from 'lucide-react';

const service = new ParticipationService();

export default function ParticipationPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [participationData, setParticipationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!user || !departmentCode) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await service.getParticipation(Number(departmentCode), user.id);
        setParticipationData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, departmentCode]);

  const handleSave = async (formData: any) => {
    if (!user || !departmentCode) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await service.updateParticipation(
        formData, 
        Number(departmentCode), 
        user.id,
        false // forceUpdate
      );
      
      setLastSaved(new Date());
      
      // Refresh data
      const updatedData = await service.getParticipation(Number(departmentCode), user.id);
      setParticipationData(updatedData);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceUpdate = async (formData: any) => {
    if (!user || !departmentCode) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await service.updateParticipation(
        formData, 
        Number(departmentCode), 
        user.id,
        true // forceUpdate
      );
      
      setLastSaved(new Date());
      
      // Refresh data
      const updatedData = await service.getParticipation(Number(departmentCode), user.id);
      setParticipationData(updatedData);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">{t('auth.loginRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('participation.title')}
        description={t('participation.description')}
        icon={FileText}
        breadcrumbs={[
          { label: t('breadcrumbs.departments'), href: '/departments' },
          { 
            label: `${t('breadcrumbs.department')} ${departmentCode}`, 
            href: `/departments/${departmentCode}` 
          },
          { label: t('participation.title') }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                {t('common.lastSaved')}: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Participation Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <ParticipationForm
            initialData={participationData}
            onSave={handleSave}
            onForceUpdate={handleForceUpdate}
            isLoading={isSaving}
            departmentCode={Number(departmentCode)}
          />
        </div>
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {t('common.saving')}
          </div>
        </div>
      )}
    </div>
  );
}