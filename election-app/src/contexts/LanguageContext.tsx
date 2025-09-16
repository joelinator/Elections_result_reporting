// contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'navigation.dashboard': 'Dashboard',
    'navigation.departments': 'Departments',
    'navigation.participation': 'Participation',
    'navigation.results': 'Results',
    'navigation.users': 'Users',
    'navigation.settings': 'Settings',
    'navigation.signOut': 'Sign out',

    // Common
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.noResults': 'No results found',
    'common.selectOption': 'Select an option',
    'common.tryAgain': 'Try Again',
    'common.continue': 'Continue',
    'common.review': 'Review',
    'common.refresh': 'Refresh',

    // Dashboard
    'dashboard.description': 'Overview of election data collection and reporting across all departments',
    'dashboard.exportReport': 'Export Report',
    'dashboard.dataProgress': 'Data Collection Progress',
    'dashboard.overallCompletion': 'Overall Completion',
    'dashboard.participationData': 'Participation Data',
    'dashboard.resultsData': 'Results Data',
    'dashboard.validation': 'Validation',
    'dashboard.pendingValidations': 'items pending validation',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.viewAll': 'View All',

    // Departments
    'departments.title': 'Departments Overview',
    'departments.description': 'Manage and monitor election data collection across all departments',
    'departments.totalDepartments': 'Total Departments',
    'departments.dataComplete': 'Data Complete',
    'departments.registeredVoters': 'Registered Voters',
    'departments.avgParticipation': 'Avg. Participation',
    'departments.searchPlaceholder': 'Search departments...',
    'departments.allStatus': 'All Status',
    'departments.complete': 'Complete',
    'departments.partial': 'Partial',
    'departments.pending': 'Pending',
    'departments.enterData': 'Enter Data',
    'departments.viewResults': 'View Results',
    'departments.lastUpdated': 'Last updated',
    'departments.noDataFound': 'No departments found',
    'departments.adjustCriteria': 'Try adjusting your search or filter criteria.',

    // Participation
    'participation.title': 'Participation Data Entry',
    'participation.description': 'Enter participation data for Department',
    'participation.instructions': 'Data Entry Instructions',
    'participation.instructionsText': 'Please enter the participation data exactly as recorded in your departmental PV (procès-verbal). The system will validate the data and alert you to any inconsistencies. If the physical document contains discrepancies, you may proceed after reviewing the warnings.',
    'participation.basicInfo': 'Basic Registration & Voting Data',
    'participation.basicInfoDesc': 'Enter the fundamental registration and voting data from your PV',
    'participation.irregularities': 'Ballot Irregularities & Issues',
    'participation.irregularitiesDesc': 'Record various types of ballot irregularities found during counting',
    'participation.results': 'Final Results & Calculations',
    'participation.resultsDesc': 'Final vote counts and automatically calculated values',
    'participation.showSummary': 'Show Summary',
    'participation.hideSummary': 'Hide Summary',
    'participation.participationRate': 'Participation Rate',
    'participation.totalVoters': 'Total Voters',
    'participation.invalidBallots': 'Invalid Ballots',
    'participation.participationOverview': 'Participation Overview',
    'participation.voterTurnout': 'Voter Turnout',
    'participation.dataCompleteness': 'Data Completeness',
    'participation.saveData': 'Save Participation Data',
    'participation.deleteData': 'Delete Data',
    'participation.resetForm': 'Reset Form',
    'participation.savingData': 'Saving Data...',

    // Form Fields
    'fields.votingBureaus': 'Number of Voting Bureaus',
    'fields.votingBureaus.help': 'Total number of voting stations in the department',
    'fields.registeredVoters': 'Registered Voters',
    'fields.registeredVoters.help': 'Total number of registered voters',
    'fields.numberOfVoters': 'Number of Voters',
    'fields.numberOfVoters.help': 'Actual number of people who voted',
    'fields.envelopesInBoxes': 'Envelopes in Ballot Boxes',
    'fields.envelopesInBoxes.help': 'Total envelopes found in ballot boxes',
    'fields.participationRate': 'Participation Rate (%)',
    'fields.participationRate.help': 'Percentage of registered voters who participated',

    // Validation
    'validation.required': 'This field is required',
    'validation.minValue': 'Must be at least 0',
    'validation.errors': 'Validation Errors Detected',
    'validation.warnings': 'Data Validation Warnings',
    'validation.criticalErrors': 'Critical Errors:',
    'validation.warningsTitle': 'Warnings:',
    'validation.note': 'Note:',
    'validation.noteText': 'This application is designed to gather information from your departmental PV. If the physical document contains discrepancies, you may proceed with the current values.',
    'validation.reviewData': 'Review Data',
    'validation.continueAnyway': 'Continue Anyway',
    'validation.forceSave': 'Force Save',

    // Select Component
    'select.placeholder': 'Select an option...',
    'select.searchPlaceholder': 'Search...',
    'select.noOptions': 'No options available',
    'select.loading': 'Loading options...',
    'select.createNew': 'Create new',
    'select.clearSelection': 'Clear selection',
  },
  fr: {
    // Navigation
    'navigation.dashboard': 'Tableau de bord',
    'navigation.departments': 'Départements',
    'navigation.participation': 'Participation',
    'navigation.results': 'Résultats',
    'navigation.users': 'Utilisateurs',
    'navigation.settings': 'Paramètres',
    'navigation.signOut': 'Se déconnecter',

    // Common
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.noResults': 'Aucun résultat trouvé',
    'common.selectOption': 'Sélectionner une option',
    'common.tryAgain': 'Réessayer',
    'common.continue': 'Continuer',
    'common.review': 'Réviser',
    'common.refresh': 'Actualiser',

    // Dashboard
    'dashboard.description': 'Aperçu de la collecte et du reporting des données électorales dans tous les départements',
    'dashboard.exportReport': 'Exporter Rapport',
    'dashboard.dataProgress': 'Progrès de Collecte des Données',
    'dashboard.overallCompletion': 'Achèvement Global',
    'dashboard.participationData': 'Données de Participation',
    'dashboard.resultsData': 'Données de Résultats',
    'dashboard.validation': 'Validation',
    'dashboard.pendingValidations': 'éléments en attente de validation',
    'dashboard.quickActions': 'Actions Rapides',
    'dashboard.recentActivity': 'Activité Récente',
    'dashboard.viewAll': 'Voir Tout',

    // Departments
    'departments.title': 'Aperçu des Départements',
    'departments.description': 'Gérer et surveiller la collecte de données électorales dans tous les départements',
    'departments.totalDepartments': 'Total Départements',
    'departments.dataComplete': 'Données Complètes',
    'departments.registeredVoters': 'Électeurs Inscrits',
    'departments.avgParticipation': 'Participation Moy.',
    'departments.searchPlaceholder': 'Rechercher des départements...',
    'departments.allStatus': 'Tous les statuts',
    'departments.complete': 'Complet',
    'departments.partial': 'Partiel',
    'departments.pending': 'En attente',
    'departments.enterData': 'Saisir Données',
    'departments.viewResults': 'Voir Résultats',
    'departments.lastUpdated': 'Dernière mise à jour',
    'departments.noDataFound': 'Aucun département trouvé',
    'departments.adjustCriteria': 'Essayez d\'ajuster vos critères de recherche ou de filtre.',

    // Participation
    'participation.title': 'Saisie des Données de Participation',
    'participation.description': 'Saisir les données de participation pour le Département',
    'participation.instructions': 'Instructions de Saisie des Données',
    'participation.instructionsText': 'Veuillez saisir les données de participation exactement telles qu\'enregistrées dans votre PV départemental (procès-verbal). Le système validera les données et vous alertera de toute incohérence. Si le document physique contient des divergences, vous pouvez procéder après avoir examiné les avertissements.',
    'participation.basicInfo': 'Données d\'Inscription et de Vote de Base',
    'participation.basicInfoDesc': 'Saisir les données fondamentales d\'inscription et de vote de votre PV',
    'participation.irregularities': 'Irrégularités et Problèmes de Bulletins',
    'participation.irregularitiesDesc': 'Enregistrer les différents types d\'irrégularités de bulletins trouvées lors du dépouillement',
    'participation.results': 'Résultats Finaux et Calculs',
    'participation.resultsDesc': 'Nombres de votes finaux et valeurs calculées automatiquement',
    'participation.showSummary': 'Afficher Résumé',
    'participation.hideSummary': 'Masquer Résumé',
    'participation.participationRate': 'Taux de Participation',
    'participation.totalVoters': 'Total Votants',
    'participation.invalidBallots': 'Bulletins Invalides',
    'participation.participationOverview': 'Aperçu de la Participation',
    'participation.voterTurnout': 'Taux de Participation',
    'participation.dataCompleteness': 'Complétude des Données',
    'participation.saveData': 'Enregistrer Données de Participation',
    'participation.deleteData': 'Supprimer Données',
    'participation.resetForm': 'Réinitialiser Formulaire',
    'participation.savingData': 'Enregistrement des données...',

    // Form Fields
    'fields.votingBureaus': 'Nombre de Bureaux de Vote',
    'fields.votingBureaus.help': 'Nombre total de bureaux de vote dans le département',
    'fields.registeredVoters': 'Électeurs Inscrits',
    'fields.registeredVoters.help': 'Nombre total d\'électeurs inscrits',
    'fields.numberOfVoters': 'Nombre de Votants',
    'fields.numberOfVoters.help': 'Nombre réel de personnes qui ont voté',
    'fields.envelopesInBoxes': 'Enveloppes dans les Urnes',
    'fields.envelopesInBoxes.help': 'Total des enveloppes trouvées dans les urnes',
    'fields.participationRate': 'Taux de Participation (%)',
    'fields.participationRate.help': 'Pourcentage d\'électeurs inscrits qui ont participé',

    // Validation
    'validation.required': 'Ce champ est requis',
    'validation.minValue': 'Doit être au moins 0',
    'validation.errors': 'Erreurs de Validation Détectées',
    'validation.warnings': 'Avertissements de Validation des Données',
    'validation.criticalErrors': 'Erreurs Critiques :',
    'validation.warningsTitle': 'Avertissements :',
    'validation.note': 'Note :',
    'validation.noteText': 'Cette application est conçue pour recueillir des informations de votre PV départemental. Si le document physique contient des divergences, vous pouvez procéder avec les valeurs actuelles.',
    'validation.reviewData': 'Réviser Données',
    'validation.continueAnyway': 'Continuer Quand Même',
    'validation.forceSave': 'Forcer l\'Enregistrement',

    // Select Component
    'select.placeholder': 'Sélectionner une option...',
    'select.searchPlaceholder': 'Rechercher...',
    'select.noOptions': 'Aucune option disponible',
    'select.loading': 'Chargement des options...',
    'select.createNew': 'Créer nouveau',
    'select.clearSelection': 'Effacer sélection',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr'); // Default to French for Cameroon

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key; // Fallback to key if translation not found
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}