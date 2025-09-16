// components/shared/FormSection.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className = '', 
  collapsible = false,
  defaultExpanded = true,
  icon
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpansion = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <div 
        className={`border-b border-gray-200 p-6 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={toggleExpansion}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 bg-blue-50 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>
          
          {collapsible && (
            <div className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
      }`}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}