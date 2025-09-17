// src/components/shared/FormField.tsx
'use client';

import React from 'react';
import { ForeignKeySelect } from '@/components/form/ForeignKeySelect';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'foreignkey';
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  options?: Array<{ value: string | number; label: string }>;
  entity?: string;
  filterContext?: Record<string, unknown>;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  options = [],
  entity,
  filterContext,
  className = ''
}: FormFieldProps) {
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${error 
      ? 'border-red-300 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400'
    }
    ${disabled 
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
      : 'text-gray-900'
    }
  `;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (onChange) {
      const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
      onChange(newValue);
    }
  };

  const handleForeignKeyChange = (selectedValue: string | number) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={4}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'foreignkey':
        return (
          <ForeignKeySelect
            entityType={entity as any}
            value={value}
            onChange={handleForeignKeyChange}
            placeholder={placeholder}
            error={error}
            disabled={disabled}
            className={className}
            {...filterContext}
          />
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input */}
      {renderInput()}

      {/* Help Text */}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}