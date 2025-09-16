// components/form/BureauVoteSelect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { useLanguage } from '@/contexts/LanguageContext';

interface BureauVote {
  code: number;
  designation: string;
  arrondissement?: string;
  commune?: string;
  centre_vote?: string;
}

interface BureauVoteSelectProps {
  value?: string | number;
  onValueChange: (value: string | number) => void;
  departmentCode?: number;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function BureauVoteSelect({
  value,
  onValueChange,
  departmentCode,
  label,
  error,
  required = false,
  className = ''
}: BureauVoteSelectProps) {
  const [bureaus, setBureaus] = useState<BureauVote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBureauVotes = async () => {
    if (!departmentCode) return;
    
    try {
      setLoading(true);
      // Mock API call - replace with actual service
      const response = await fetch(`/api/departments/${departmentCode}/bureau-votes`);
      const data = await response.json();
      setBureaus(data);
    } catch (error) {
      console.error('Failed to fetch bureau votes:', error);
      setBureaus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departmentCode) {
      fetchBureauVotes();
    }
  }, [departmentCode]);

  const options: SelectOption[] = bureaus.map(bureau => ({
    value: bureau.code,
    label: bureau.designation,
    description: [bureau.arrondissement, bureau.commune, bureau.centre_vote]
      .filter(Boolean)
      .join(' - ')
  }));

  return (
    <SearchableSelect
      options={options}
      value={value}
      onValueChange={onValueChange}
      label={label || 'Bureau de Vote'}
      placeholder="Select voting bureau..."
      searchPlaceholder="Search voting bureaus..."
      error={error}
      loading={loading}
      required={required}
      className={className}
      clearable
    />
  );
}