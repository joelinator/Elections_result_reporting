// components/form/DepartmentSelect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { useLanguage } from '@/contexts/LanguageContext';

interface Department {
  code: number;
  nom: string;
  region?: string;
}

interface DepartmentSelectProps {
  value?: string | number;
  onValueChange: (value: string | number) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  userRestrictedOnly?: boolean; // Only show departments assigned to user
  userId?: number;
}

export function DepartmentSelect({
  value,
  onValueChange,
  label,
  error,
  required = false,
  className = '',
  userRestrictedOnly = false,
  userId
}: DepartmentSelectProps) {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual service
      const response = userRestrictedOnly && userId 
        ? await fetch(`/api/users/${userId}/departments`)
        : await fetch('/api/departments');
      
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [userRestrictedOnly, userId]);

  const options: SelectOption[] = departments.map(dept => ({
    value: dept.code,
    label: dept.nom,
    description: dept.region ? `Region: ${dept.region}` : undefined
  }));

  return (
    <SearchableSelect
      options={options}
      value={value}
      onValueChange={onValueChange}
      label={label || t('departments.title')}
      placeholder={t('departments.searchPlaceholder')}
      searchPlaceholder={t('departments.searchPlaceholder')}
      error={error}
      loading={loading}
      required={required}
      className={className}
      clearable
    />
  );
}