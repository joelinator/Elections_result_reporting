// components/form/PartySelect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SmartSelect, SelectOption } from '@/components/ui/SmartSelect';

interface Party {
  code: number;
  designation: string;
  sigle?: string;
  candidat_principal?: string;
}

interface PartySelectProps {
  value?: string | number;
  onValueChange: (value: string | number) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function PartySelect({
  value,
  onValueChange,
  label,
  error,
  required = false,
  className = ''
}: PartySelectProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual service
      const response = await fetch('/api/parties');
      const data = await response.json();
      setParties(data);
    } catch (error) {
      console.error('Failed to fetch parties:', error);
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const options: SelectOption[] = parties.map(party => ({
    value: party.code,
    label: `${party.designation}${party.sigle ? ` (${party.sigle})` : ''}`,
    description: party.candidat_principal ? `Candidate: ${party.candidat_principal}` : undefined
  }));

  return (
    <SmartSelect
      options={options}
      value={value}
      onChange={onValueChange}
      placeholder="Select political party..."
      searchPlaceholder="Search parties..."
      loading={loading}
      className={className}
      clearable
    />
  );
}