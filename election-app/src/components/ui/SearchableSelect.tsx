// components/ui/SearchableSelect.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  required?: boolean;
}

export function SearchableSelect({
  options = [],
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  label,
  error,
  loading = false,
  disabled = false,
  clearable = false,
  className = '',
  required = false
}: SearchableSelectProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string | number) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border rounded-lg px-3 py-2 text-left cursor-default
            focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200
            ${error 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <span className="flex items-center justify-between">
            <span className="block truncate">
              {loading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500">{t('common.loading')}</span>
                </span>
              ) : selectedOption ? (
                <span className="flex flex-col">
                  <span className="text-gray-900">{selectedOption.label}</span>
                  {selectedOption.description && (
                    <span className="text-xs text-gray-500">{selectedOption.description}</span>
                  )}
                </span>
              ) : (
                <span className="text-gray-500">{placeholder || t('common.search')}</span>
              )}
            </span>
            
            <span className="flex items-center space-x-1">
              {clearable && selectedOption && !disabled && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} />
            </span>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={searchPlaceholder || t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-gray-500 text-sm">
                  {loading ? t('common.loading') : 'No options found'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                      transition-colors duration-150 border-b border-gray-100 last:border-b-0
                      ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                      ${value === option.value ? 'bg-blue-50 text-blue-700' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
                        )}
                      </div>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
          <X className="h-3 w-3" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}