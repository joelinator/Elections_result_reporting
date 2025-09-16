// components/shared/EnhancedFormField.tsx
'use client';

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle, Info } from 'lucide-react';
import { ForeignKeySelect } from '@/components/form/ForeignKeySelect';
import { SelectOption } from '@/components/ui/SmartSelect';

type EntityType = 'department' | 'region' | 'arrondissement' | 'bureauVote' | 'party' | 'user' | 'role' | 'candidate';

interface EnhancedFormFieldProps {
  label: string;
  id: string;
  type?: string;
  register?: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
  step?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  // Foreign key select props
  foreignKey?: {
    entityType: EntityType;
    value?: string | number;
    onChange: (value: string | number | null, option?: SelectOption) => void;
    departmentCode?: number;
    arrondissementCode?: number;
    roleCode?: number;
  };
}

export function EnhancedFormField({ 
  label, 
  id, 
  type = 'text', 
  register, 
  error, 
  placeholder,
  step,
  helpText,
  required = false,
  className = '',
  foreignKey
}: EnhancedFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {foreignKey ? (
          <ForeignKeySelect
            entityType={foreignKey.entityType}
            value={foreignKey.value}
            onChange={foreignKey.onChange}
            error={error?.message}
            departmentCode={foreignKey.departmentCode}
            arrondissementCode={foreignKey.arrondissementCode}
            roleCode={foreignKey.roleCode}
            placeholder={placeholder}
          />
        ) : (
          <>
            <input
              {...(register || {})}
              id={id}
              type={type}
              step={step}
              placeholder={placeholder}
              className={`
                w-full px-3 py-2 border rounded-lg shadow-sm text-sm
                focus:outline-none focus:ring-2 focus:border-transparent
                transition-colors duration-200
                ${error 
                  ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
                }
              `}
            />
            
            {error && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </>
        )}
      </div>
      
      {error && !foreignKey && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error.message}</span>
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <Info className="h-3 w-3" />
          <span>{helpText}</span>
        </p>
      )}
    </div>
  );
}