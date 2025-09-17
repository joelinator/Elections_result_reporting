// hooks/useTranslation.ts
import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: any;
}

let currentLanguage = 'en';
let translations: Translations = {};

export function useTranslation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, []);

  const loadTranslations = async (language: string) => {
    try {
      const response = await fetch(`/locales/${language}.json`);
      if (response.ok) {
        translations = await response.json();
        currentLanguage = language;
        forceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to English
      if (language !== 'en') {
        loadTranslations('en');
      }
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue || key;
  };

  const changeLanguage = (language: string) => {
    loadTranslations(language);
  };

  return {
    t,
    changeLanguage,
    currentLanguage,
    isLoading: Object.keys(translations).length === 0
  };
}