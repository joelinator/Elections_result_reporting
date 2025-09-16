// components/ui/modal.tsx
import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export function Modal({ isOpen, onClose, title, children, variant = 'default' }: ModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    default: 'bg-white border-gray-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
  };

  const iconMap = {
    default: null,
    warning: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    danger: <AlertTriangle className="h-6 w-6 text-red-600" />,
    success: <CheckCircle className="h-6 w-6 text-green-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className={`relative w-full max-w-md transform rounded-lg border p-6 shadow-xl transition-all ${variantClasses[variant]}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {iconMap[variant]}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  errors: string[];
  warnings: string[];
}

export function ValidationModal({ isOpen, onClose, onContinue, errors, warnings }: ValidationModalProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hasErrors ? t('participation.validation.errorsTitle') : t('participation.validation.title')}
      variant={hasErrors ? "danger" : "warning"}
    >
      <div className="space-y-4">
        {hasErrors && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-800">{t('participation.validation.criticalErrors')}</h4>
            <ul className="space-y-1 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasWarnings && (
          <div className="space-y-2">
            <h4 className="font-medium text-amber-800">{t('participation.validation.warnings')}</h4>
            <ul className="space-y-1 text-sm text-amber-700">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>{t('participation.validation.note').split(':')[0]}:</strong> {t('participation.validation.note').split(':')[1]}
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t('participation.validation.reviewData')}
          </Button>
          <Button
            onClick={onContinue}
            className={`flex-1 ${hasErrors ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {hasErrors ? t('participation.validation.forceSave') : t('participation.validation.continueAnyway')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}