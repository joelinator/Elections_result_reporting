// src/app/departments/[code]/participation/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ParticipationService, ValidationError } from '@/services/participationService';
import { Button } from '@/components/ui/button';
import { EnhancedFormField } from '@/components/shared/EnhancedFormField';
import { FormSection } from '@/components/shared/FormSection';
import { ValidationModal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  Save, 
  Trash2, 
  AlertCircle, 
  Users, 
  Vote, 
  CheckCircle2,
  Calculator,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ParticipationDepartement, 
  ParticipationFormData 
} from '@/types/participation';
import { ValidationResult } from '@/utils/validation';

const service = new ParticipationService();

// Updated zod schema to match the form data structure
const participationSchema = z.object({
  code: z.number().optional(),
  code_departement: z.number().optional(),
  nombre_bureau_vote: z.number().min(0, 'Must be at least 0'),
  nombre_inscrit: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_urnes: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_bulletins_differents: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_electeur_identifiable: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_enveloppes_signes: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_non_elecam: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_non_elecam: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_sans_enveloppe: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_vide: z.number().min(0, 'Must be at least 0'),
  nombre_suffrages_valable: z.number().min(0, 'Must be at least 0'),
  nombre_votant: z.number().min(0, 'Must be at least 0'),
  bulletin_nul: z.number().min(0, 'Must be at least 0'),
  suffrage_exprime: z.number().min(0, 'Must be at least 0').nullable().optional(),
  taux_participation: z.number().min(0, 'Must be at least 0').nullable().optional(),
  date_creation: z.string().nullable().optional(),
});


export default function ParticipationPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [participation, setParticipation] = useState<ParticipationDepartement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [pendingFormData, setPendingFormData] = useState<ParticipationFormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate stats for dashboard cards
  const stats = {
    participationRate: participation ? 
      ((participation.nombre_votant / participation.nombre_inscrit) * 100).toFixed(2) : '0',
    totalVoters: participation?.nombre_votant || 0,
    totalRegistered: participation?.nombre_inscrit || 0,
    invalidBallots: participation?.bulletin_nul || 0,
  };

  const form = useForm<ParticipationFormData>({
    resolver: zodResolver(participationSchema),
    // CORRECTED: Ensure all fields from the schema are present in defaultValues.
    defaultValues: {
      nombre_bureau_vote: 0,
      nombre_inscrit: 0,
      nombre_enveloppe_urnes: 0,
      // Add all new fields from the Prisma schema
      nombre_enveloppe_bulletins_differents: 0,
      nombre_bulletin_electeur_identifiable: 0,
      nombre_bulletin_enveloppes_signes: 0,
      nombre_enveloppe_non_elecam: 0,
      nombre_bulletin_non_elecam: 0,
      nombre_bulletin_sans_enveloppe: 0,
      nombre_enveloppe_vide: 0,
      nombre_suffrages_valable: 0,
      nombre_votant: 0,
      bulletin_nul: 0,
      suffrage_exprime: 0,
      taux_participation: 0,
    },
  });

  useEffect(() => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = await service.getParticipation(Number(departmentCode), user.id);
        // data will be of type 'Participation | null' from the service.
        setParticipation(data);
        if (data) {
          form.reset(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load participation data');
        toast.error(err.message || 'Failed to load participation data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, departmentCode, form]);

  const handleSubmit = async (data: ParticipationFormData) => {
    if (!user) {
      toast.error(t('participation.messages.userNotAuthenticated'));
      return;
    }
    try {
      const updated = await service.updateParticipation(data, Number(departmentCode), user.id);
      setParticipation(updated);
      toast.success(t('participation.messages.saveSuccess'));
    } catch (err: any) {
      if (err instanceof ValidationError) {
        // Show validation modal
        setValidationResult(err.validationResult);
        setPendingFormData(data);
        setShowValidationModal(true);
      } else {
        toast.error(err.message || t('participation.messages.saveError'));
        console.error(err);
      }
    }
  };

  const handleForceSubmit = async () => {
    if (!user || !pendingFormData) return;
    
    try {
      const updated = await service.updateParticipation(
        pendingFormData, 
        Number(departmentCode), 
        user.id, 
        true // Force update
      );
      setParticipation(updated);
      setShowValidationModal(false);
      setPendingFormData(null);
      setValidationResult(null);
      toast.success(t('participation.messages.saveSuccessWithWarnings'));
    } catch (err: any) {
      toast.error(err.message || t('participation.messages.saveError'));
      console.error(err);
    }
  };

  const handleValidationModalClose = () => {
    setShowValidationModal(false);
    setPendingFormData(null);
    setValidationResult(null);
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    try {
      await service.deleteParticipation(Number(departmentCode), user.id);
      setParticipation(null);
      form.reset();
      toast.success('Participation data deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete participation data');
      console.error(err);
    }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Loading participation data</p>
          <p className="text-gray-600">Please wait while we fetch the latest information...</p>
        </div>
      </div>
    </DashboardLayout>
  );
  
  if (error) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title={t('participation.title')}
          description={t('participation.description', { departmentCode })}
          icon={FileText}
          breadcrumbs={[
            { label: t('breadcrumbs.departments'), href: '/departments' },
            { label: t('breadcrumbs.department', { code: departmentCode }), href: `/departments/${departmentCode}` },
            { label: t('breadcrumbs.participation') },
          ]}
          actions={
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? t('participation.actions.hideSummary') : t('participation.actions.showSummary')}</span>
              </Button>
            </div>
          }
        />

        {/* Stats Overview */}
        {participation && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300 ${
            showPreview ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4 h-0 overflow-hidden'
          }`}>
            <StatsCard
              title={t('participation.stats.participationRate')}
              value={`${stats.participationRate}%`}
              icon={Calculator}
              color="blue"
              change={
                parseFloat(stats.participationRate) > 70 
                  ? { value: 5, type: 'increase' } 
                  : { value: 2, type: 'decrease' }
              }
            />
            <StatsCard
              title={t('participation.stats.totalVoters')}
              value={stats.totalVoters}
              icon={Vote}
              color="green"
            />
            <StatsCard
              title={t('participation.stats.totalRegistered')}
              value={stats.totalRegistered}
              icon={Users}
              color="purple"
            />
            <StatsCard
              title={t('participation.stats.invalidBallots')}
              value={stats.invalidBallots}
              icon={AlertCircle}
              color="red"
            />
          </div>
        )}

        {/* Progress Overview */}
        {participation && (
          <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 ${
            showPreview ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4 h-0 overflow-hidden'
          }`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('participation.overview.title')}</h3>
            <div className="space-y-4">
              <ProgressBar
                label={t('participation.overview.voterTurnout')}
                value={parseFloat(stats.participationRate)}
                color="blue"
                size="lg"
              />
              <ProgressBar
                label={t('participation.overview.dataCompleteness')}
                value={85}
                color="green"
                size="md"
              />
            </div>
          </div>
        )}

        {/* Instruction Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('participation.instructions.title')}</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {t('participation.instructions.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-8">
            {/* Basic Information */}
            <FormSection 
              title="Basic Registration & Voting Data" 
              description="Enter the fundamental registration and voting data from your PV"
              icon={<Users className="h-5 w-5 text-blue-600" />}
            >
              <EnhancedFormField
                label="Number of Voting Bureaus"
                id="nombre_bureau_vote"
                type="number"
                register={form.register('nombre_bureau_vote', { valueAsNumber: true })}
                error={form.formState.errors.nombre_bureau_vote}
                helpText="Total number of voting stations in the department"
              />
              <EnhancedFormField
                label="Registered Voters"
                id="nombre_inscrit"
                type="number"
                register={form.register('nombre_inscrit', { valueAsNumber: true })}
                error={form.formState.errors.nombre_inscrit}
                helpText="Total number of registered voters"
                required
              />
              <EnhancedFormField
                label="Number of Voters"
                id="nombre_votant"
                type="number"
                register={form.register('nombre_votant', { valueAsNumber: true })}
                error={form.formState.errors.nombre_votant}
                helpText="Actual number of people who voted"
                required
              />
              <EnhancedFormField
                label="Envelopes in Ballot Boxes"
                id="nombre_enveloppe_urnes"
                type="number"
                register={form.register('nombre_enveloppe_urnes', { valueAsNumber: true })}
                error={form.formState.errors.nombre_enveloppe_urnes}
                helpText="Total envelopes found in ballot boxes"
              />
            </FormSection>

            {/* Ballot Irregularities */}
            <FormSection 
              title="Ballot Irregularities & Issues" 
              description="Record various types of ballot irregularities found during counting"
              icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
              collapsible
              defaultExpanded={false}
            >
              <EnhancedFormField
                label="Envelopes w/ Different Ballots"
                id="nombre_enveloppe_bulletins_differents"
                type="number"
                register={form.register('nombre_enveloppe_bulletins_differents', { valueAsNumber: true })}
                error={form.formState.errors.nombre_enveloppe_bulletins_differents}
                helpText="Envelopes containing different ballot types"
              />
              <EnhancedFormField
                label="Ballots w/ Identifiable Voters"
                id="nombre_bulletin_electeur_identifiable"
                type="number"
                register={form.register('nombre_bulletin_electeur_identifiable', { valueAsNumber: true })}
                error={form.formState.errors.nombre_bulletin_electeur_identifiable}
                helpText="Ballots that allow voter identification"
              />
              <EnhancedFormField
                label="Signed Envelopes"
                id="nombre_bulletin_enveloppes_signes"
                type="number"
                register={form.register('nombre_bulletin_enveloppes_signes', { valueAsNumber: true })}
                error={form.formState.errors.nombre_bulletin_enveloppes_signes}
                helpText="Envelopes that were signed by voters"
              />
              <EnhancedFormField
                label="Non-Elecam Envelopes"
                id="nombre_enveloppe_non_elecam"
                type="number"
                register={form.register('nombre_enveloppe_non_elecam', { valueAsNumber: true })}
                error={form.formState.errors.nombre_enveloppe_non_elecam}
                helpText="Envelopes not provided by ELECAM"
              />
              <EnhancedFormField
                label="Non-Elecam Ballots"
                id="nombre_bulletin_non_elecam"
                type="number"
                register={form.register('nombre_bulletin_non_elecam', { valueAsNumber: true })}
                error={form.formState.errors.nombre_bulletin_non_elecam}
                helpText="Ballots not provided by ELECAM"
              />
              <EnhancedFormField
                label="Ballots w/o Envelopes"
                id="nombre_bulletin_sans_enveloppe"
                type="number"
                register={form.register('nombre_bulletin_sans_enveloppe', { valueAsNumber: true })}
                error={form.formState.errors.nombre_bulletin_sans_enveloppe}
                helpText="Ballots found without envelopes"
              />
              <EnhancedFormField
                label="Empty Envelopes"
                id="nombre_enveloppe_vide"
                type="number"
                register={form.register('nombre_enveloppe_vide', { valueAsNumber: true })}
                error={form.formState.errors.nombre_enveloppe_vide}
                helpText="Envelopes containing no ballots"
              />
            </FormSection>

            {/* Results Summary */}
            <FormSection 
              title="Final Results & Calculations" 
              description="Final vote counts and automatically calculated values"
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            >
              <EnhancedFormField
                label="Valid Suffrages"
                id="nombre_suffrages_valable"
                type="number"
                register={form.register('nombre_suffrages_valable', { valueAsNumber: true })}
                error={form.formState.errors.nombre_suffrages_valable}
                helpText="Total valid votes counted"
                required
              />
              <EnhancedFormField
                label="Invalid Ballots"
                id="bulletin_nul"
                type="number"
                register={form.register('bulletin_nul', { valueAsNumber: true })}
                error={form.formState.errors.bulletin_nul}
                helpText="Number of invalid/null ballots"
              />
              <EnhancedFormField
                label="Expressed Votes"
                id="suffrage_exprime"
                type="number"
                register={form.register('suffrage_exprime', { valueAsNumber: true })}
                error={form.formState.errors.suffrage_exprime}
                helpText="Total votes expressed (auto-calculated if empty)"
              />
              <EnhancedFormField
                label="Participation Rate (%)"
                id="taux_participation"
                type="number"
                step="0.01"
                register={form.register('taux_participation', { valueAsNumber: true })}
                error={form.formState.errors.taux_participation}
                helpText="Percentage of registered voters who participated"
              />
            </FormSection>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
              >
                <Save className="h-5 w-5" />
                <span>{form.formState.isSubmitting ? 'Saving Data...' : 'Save Participation Data'}</span>
              </Button>
              
              {participation && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={form.formState.isSubmitting}
                  className="flex items-center justify-center space-x-2 font-medium py-3 px-6 rounded-lg shadow-sm transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Data</span>
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={form.formState.isSubmitting}
                className="flex items-center justify-center space-x-2 font-medium py-3 px-6 rounded-lg shadow-sm transition-all duration-200"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Reset Form</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Validation Modal */}
        {validationResult && (
          <ValidationModal
            isOpen={showValidationModal}
            onClose={handleValidationModalClose}
            onContinue={handleForceSubmit}
            errors={validationResult.errors}
            warnings={validationResult.warnings}
          />
        )}
      </div>
    </DashboardLayout>
  );
}