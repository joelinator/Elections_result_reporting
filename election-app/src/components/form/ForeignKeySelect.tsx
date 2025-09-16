// components/form/ForeignKeySelect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SmartSelect, SelectOption } from '@/components/ui/SmartSelect';
import { OptionsService } from '@/services/optionsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

type EntityType = 'department' | 'region' | 'arrondissement' | 'bureauVote' | 'party' | 'user' | 'role' | 'candidate';

interface ForeignKeySelectProps {
  entityType: EntityType;
  value?: string | number;
  onChange: (value: string | number | null, option?: SelectOption) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  // Context filters for intelligent filtering
  departmentCode?: number;
  arrondissementCode?: number;
  roleCode?: number;
}

export function ForeignKeySelect({
  entityType,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  clearable = true,
  className = '',
  departmentCode,
  arrondissementCode,
  roleCode
}: ForeignKeySelectProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const optionsService = new OptionsService();

  // Get user's assigned department for intelligent filtering
  const getUserDepartmentCode = (): number | undefined => {
    // This would come from user context or API
    // For now, we'll use the provided departmentCode
    return departmentCode;
  };

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      let fetchedOptions: SelectOption[] = [];
      
      switch (entityType) {
        case 'department':
          fetchedOptions = await optionsService.getDepartmentOptions();
          break;
        case 'region':
          fetchedOptions = await optionsService.getRegionOptions();
          break;
        case 'arrondissement':
          // Intelligently filter by user's department or provided department
          const deptCode = getUserDepartmentCode();
          fetchedOptions = await optionsService.getArrondissementOptions(deptCode);
          break;
        case 'bureauVote':
          // Intelligently filter by arrondissement or department
          if (arrondissementCode) {
            fetchedOptions = await optionsService.getBureauVoteOptions(arrondissementCode);
          } else {
            const deptCode = getUserDepartmentCode();
            fetchedOptions = await optionsService.getBureauVoteOptions(undefined, deptCode);
          }
          break;
        case 'party':
          fetchedOptions = await optionsService.getPartiOptions();
          break;
        case 'user':
          fetchedOptions = await optionsService.getUserOptions(roleCode);
          break;
        case 'role':
          fetchedOptions = await optionsService.getRoleOptions();
          break;
        case 'candidate':
          fetchedOptions = await optionsService.getCandidatOptions();
          break;
        default:
          console.warn(`Unknown entity type: ${entityType}`);
      }
      
      setOptions(fetchedOptions);
    } catch (error) {
      console.error(`Error fetching options for ${entityType}:`, error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [entityType, departmentCode, arrondissementCode, roleCode]);

  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    const placeholders = {
      department: t('select.placeholder.department') || 'Select a department...',
      region: t('select.placeholder.region') || 'Select a region...',
      arrondissement: t('select.placeholder.arrondissement') || 'Select an arrondissement...',
      bureauVote: t('select.placeholder.bureauVote') || 'Select a voting bureau...',
      party: t('select.placeholder.party') || 'Select a political party...',
      user: t('select.placeholder.user') || 'Select a user...',
      role: t('select.placeholder.role') || 'Select a role...',
      candidate: t('select.placeholder.candidate') || 'Select a candidate...'
    };
    
    return placeholders[entityType] || t('select.placeholder');
  };

  const getEmptyMessage = (): string => {
    const messages = {
      department: t('select.empty.department') || 'No departments available',
      region: t('select.empty.region') || 'No regions available',
      arrondissement: t('select.empty.arrondissement') || 'No arrondissements available for this department',
      bureauVote: t('select.empty.bureauVote') || 'No voting bureaus available for this area',
      party: t('select.empty.party') || 'No political parties available',
      user: t('select.empty.user') || 'No users available',
      role: t('select.empty.role') || 'No roles available',
      candidate: t('select.empty.candidate') || 'No candidates available'
    };
    
    return messages[entityType] || t('select.noOptions');
  };

  const renderOption = (option: SelectOption) => (
    <div>
      <div className="font-medium text-gray-900">{option.label}</div>
      {option.description && (
        <div className="text-sm text-gray-500 mt-1">{option.description}</div>
      )}
    </div>
  );

  return (
    <SmartSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={getPlaceholder()}
      searchPlaceholder={t('select.searchPlaceholder')}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      clearable={clearable}
      className={className}
      renderOption={renderOption}
      emptyMessage={getEmptyMessage()}
    />
  );
}