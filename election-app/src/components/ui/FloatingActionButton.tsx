// components/ui/FloatingActionButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label?: string;
  color?: 'blue' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon: Icon,
  label,
  color = 'blue',
  size = 'md',
  disabled = false,
  className = ''
}: FloatingActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  return (
    <div className="group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          fixed bottom-6 right-6 ${sizeClasses[size]} ${colorClasses[color]}
          rounded-full shadow-lg text-white z-50
          focus:outline-none focus:ring-4 focus:ring-opacity-30
          transform transition-all duration-200 ease-in-out
          hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
      >
        <Icon className={`${iconSizes[size]} mx-auto`} />
      </button>
      
      {label && (
        <div className="fixed bottom-6 right-20 transform translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}