// components/ui/SmartSelect.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  metadata?: any;
}

interface SmartSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number | null, option?: SelectOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption) => React.ReactNode;
  emptyMessage?: string;
}

export function SmartSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  isLoading = false,
  error,
  disabled = false,
  clearable = true,
  className = '',
  onSearch,
  renderOption,
  emptyMessage
}: SmartSelectProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedOption = options.find(option => option.value === value);
  
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  useEffect(() => {
    if (onSearch) {
      const debounceTimeout = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
      
      return () => clearTimeout(debounceTimeout);
    }
  }, [searchQuery, onSearch]);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value, option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery('');
  };

  const defaultRenderOption = (option: SelectOption) => (
    <div>
      <div className="font-medium">{option.label}</div>
      {option.description && (
        <div className="text-sm text-gray-500">{option.description}</div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {selectedOption ? (
              <div className="truncate">
                {renderOption ? renderOption(selectedOption) : defaultRenderOption(selectedOption)}
              </div>
            ) : (
              <span className="text-gray-500">
                {placeholder || t('select.placeholder')}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder || t('select.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                  <span className="text-gray-500">{t('select.loading')}</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  {emptyMessage || t('select.noOptions')}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      ${selectedOption?.value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {renderOption ? renderOption(option) : defaultRenderOption(option)}
                      </div>
                      {selectedOption?.value === option.value && (
                        <Check className="h-4 w-4 text-blue-600 ml-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}