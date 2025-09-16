// components/form/ArrondissementSelect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { useLanguage } from '@/contexts/LanguageContext';

interface Arrondissement {
  code: number;
  libelle: string;
  departement?: string;
  chef_lieu?: string;
}

interface ArrondissementSelectProps {
  value?: string | number;
  onValueChange: (value: string | number) => void;
  departmentCode?: number;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function ArrondissementSelect({
  value,
  onValueChange,
  departmentCode,
  label,
  error,
  required = false,
  className = ''
}: ArrondissementSelectProps) {
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArrondissements = async () => {
    if (!departmentCode) return;
    
    try {
      setLoading(true);
      // Mock API call - replace with actual service
      const response = await fetch(`/api/departments/${departmentCode}/arrondissements`);
      const data = await response.json();
      setArrondissements(data);
    } catch (error) {
      console.error('Failed to fetch arrondissements:', error);
      setArrondissements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departmentCode) {
      fetchArrondissements();
    }
  }, [departmentCode]);

  const options: SelectOption[] = arrondissements.map(arr => ({
    value: arr.code,
    label: arr.libelle,
    description: arr.chef_lieu ? `Chef-lieu: ${arr.chef_lieu}` : undefined
  }));

  return (
    <SearchableSelect
      options={options}
      value={value}
      onValueChange={onValueChange}
      label={label || 'Arrondissement'}
      placeholder="Select arrondissement..."
      searchPlaceholder="Search arrondissements..."
      error={error}
      loading={loading}
      required={required}
      className={className}
      clearable
    />
  );
}