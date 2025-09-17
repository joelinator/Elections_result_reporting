// components/features/participation/ParticipationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { useLanguage } from '@/contexts/LanguageContext';
import { ParticipationCalculations } from '@/utils/calculations';
import { AlertTriangle, Save, Calculator } from 'lucide-react';

interface ParticipationFormData {
  nombre_bureau_vote?: number;
  nombre_inscrit: number;
  nombre_enveloppe_urnes: number;
  nombre_enveloppe_bulletins_differents: number;
  nombre_bulletin_electeur_identifiable: number;
  nombre_bulletin_enveloppes_signes: number;
  nombre_enveloppe_non_elecam: number;
  nombre_bulletin_non_elecam: number;
  nombre_bulletin_sans_enveloppe: number;
  nombre_enveloppe_vide: number;
  nombre_suffrages_valable: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime?: number;
  taux_participation?: number;
}

interface ParticipationFormProps {
  initialData?: ParticipationFormData | null;
  onSave: (data: ParticipationFormData) => Promise<void>;
  onForceUpdate: (data: ParticipationFormData) => Promise<void>;
  isLoading?: boolean;
  departmentCode: number;
}

export function ParticipationForm({
  initialData,
  onSave,
  onForceUpdate,
  isLoading = false,
  departmentCode
}: ParticipationFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ParticipationFormData>({
    nombre_inscrit: 0,
    nombre_enveloppe_urnes: 0,
    nombre_enveloppe_bulletins_differents: 0,
    nombre_bulletin_electeur_identifiable: 0,
    nombre_bulletin_enveloppes_signes: 0,
    nombre_enveloppe_non_elecam: 0,
    nombre_bulletin_non_elecam: 0,
    nombre_bulletin_sans_enveloppe: 0,
    nombre_enveloppe_vide: 0,
    nombre_suffrages_valable: 0,
    nombre_votant: 0,
    bulletin_nul: 0
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showCalculated, setShowCalculated] = useState(false);

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Auto-calculate derived fields
  useEffect(() => {
    const derived = ParticipationCalculations.calculateDerivedFields(formData);
    if (derived.taux_participation !== formData.taux_participation || 
        derived.suffrage_exprime !== formData.suffrage_exprime) {
      setFormData(prev => ({ ...prev, ...derived }));
    }
  }, [formData.nombre_votant, formData.nombre_inscrit, formData.bulletin_nul]);

  // Validate data consistency
  useEffect(() => {
    const validationErrors = ParticipationCalculations.validateConsistency(formData);
    setErrors(validationErrors);
  }, [formData]);

  const handleFieldChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    if (errors.length > 0) {
      alert(t('participation.hasErrors') || 'Please fix validation errors before saving');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving participation data:', error);
    }
  };

  const handleForceUpdate = async () => {
    try {
      await onForceUpdate(formData);
    } catch (error) {
      console.error('Error force updating participation data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('participation.formTitle') || 'Participation Data Entry'}
        </h3>
        <Button
          variant="outline"
          onClick={() => setShowCalculated(!showCalculated)}
          className="flex items-center space-x-2"
        >
          <Calculator className="h-4 w-4" />
          <span>{showCalculated ? 'Hide' : 'Show'} Calculations</span>
        </Button>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">
                {t('validation.errors') || 'Validation Errors'}
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{t('participation.basicStats') || 'Basic Statistics'}</h4>
          
          <FormField
            label={t('participation.nombreInscrit') || 'Registered Voters'}
            name="nombre_inscrit"
            type="number"
            value={formData.nombre_inscrit}
            onChange={(value) => handleFieldChange('nombre_inscrit', value)}
            required
          />

          <FormField
            label={t('participation.nombreVotant') || 'Total Voters'}
            name="nombre_votant"
            type="number"
            value={formData.nombre_votant}
            onChange={(value) => handleFieldChange('nombre_votant', value)}
            required
          />

          <FormField
            label={t('participation.bulletinNul') || 'Invalid Ballots'}
            name="bulletin_nul"
            type="number"
            value={formData.bulletin_nul}
            onChange={(value) => handleFieldChange('bulletin_nul', value)}
            required
          />
        </div>

        {/* Detailed Counts */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{t('participation.detailedCounts') || 'Detailed Counts'}</h4>
          
          <FormField
            label={t('participation.nombreEnveloppeUrnes') || 'Envelopes in Ballot Boxes'}
            name="nombre_enveloppe_urnes"
            type="number"
            value={formData.nombre_enveloppe_urnes}
            onChange={(value) => handleFieldChange('nombre_enveloppe_urnes', value)}
          />

          <FormField
            label={t('participation.nombreEnveloppeBulletinsDifferents') || 'Envelopes with Different Ballots'}
            name="nombre_enveloppe_bulletins_differents"
            type="number"
            value={formData.nombre_enveloppe_bulletins_differents}
            onChange={(value) => handleFieldChange('nombre_enveloppe_bulletins_differents', value)}
          />

          <FormField
            label={t('participation.nombreBulletinElecteurIdentifiable') || 'Identifiable Voter Ballots'}
            name="nombre_bulletin_electeur_identifiable"
            type="number"
            value={formData.nombre_bulletin_electeur_identifiable}
            onChange={(value) => handleFieldChange('nombre_bulletin_electeur_identifiable', value)}
          />
        </div>

        {/* Additional Counts */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{t('participation.additionalCounts') || 'Additional Counts'}</h4>
          
          <FormField
            label={t('participation.nombreBulletinEnveloppesSignes') || 'Signed Envelope Ballots'}
            name="nombre_bulletin_enveloppes_signes"
            type="number"
            value={formData.nombre_bulletin_enveloppes_signes}
            onChange={(value) => handleFieldChange('nombre_bulletin_enveloppes_signes', value)}
          />

          <FormField
            label={t('participation.nombreEnveloppeNonElecam') || 'Non-ELECAM Envelopes'}
            name="nombre_enveloppe_non_elecam"
            type="number"
            value={formData.nombre_enveloppe_non_elecam}
            onChange={(value) => handleFieldChange('nombre_enveloppe_non_elecam', value)}
          />

          <FormField
            label={t('participation.nombreBulletinNonElecam') || 'Non-ELECAM Ballots'}
            name="nombre_bulletin_non_elecam"
            type="number"
            value={formData.nombre_bulletin_non_elecam}
            onChange={(value) => handleFieldChange('nombre_bulletin_non_elecam', value)}
          />
        </div>

        {/* Final Counts */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{t('participation.finalCounts') || 'Final Counts'}</h4>
          
          <FormField
            label={t('participation.nombreBulletinSansEnveloppe') || 'Ballots Without Envelope'}
            name="nombre_bulletin_sans_enveloppe"
            type="number"
            value={formData.nombre_bulletin_sans_enveloppe}
            onChange={(value) => handleFieldChange('nombre_bulletin_sans_enveloppe', value)}
          />

          <FormField
            label={t('participation.nombreEnveloppeVide') || 'Empty Envelopes'}
            name="nombre_enveloppe_vide"
            type="number"
            value={formData.nombre_enveloppe_vide}
            onChange={(value) => handleFieldChange('nombre_enveloppe_vide', value)}
          />

          <FormField
            label={t('participation.nombreSuffragesValable') || 'Valid Votes'}
            name="nombre_suffrages_valable"
            type="number"
            value={formData.nombre_suffrages_valable}
            onChange={(value) => handleFieldChange('nombre_suffrages_valable', value)}
          />
        </div>
      </div>

      {/* Calculated Fields */}
      {showCalculated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-4">
            {t('participation.calculatedFields') || 'Calculated Fields'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800">
                {t('participation.tauxParticipation') || 'Participation Rate'}
              </label>
              <div className="text-lg font-semibold text-blue-900">
                {formData.taux_participation?.toFixed(2)}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800">
                {t('participation.suffrageExprime') || 'Expressed Votes'}
              </label>
              <div className="text-lg font-semibold text-blue-900">
                {formData.suffrage_exprime?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {t('participation.autoSaveNote') || 'Data is automatically validated as you type'}
        </div>
        
        <div className="flex items-center space-x-3">
          {errors.length > 0 && (
            <Button
              onClick={handleForceUpdate}
              disabled={isLoading}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t('common.forceUpdate') || 'Force Update'}
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={isLoading || errors.length > 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save')}
          </Button>
        </div>
      </div>
    </div>
  );
}