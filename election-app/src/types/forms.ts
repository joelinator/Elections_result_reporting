// types/forms.ts
export interface FormFieldProps {
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

export interface CommitteeMemberFormData {
  nom: string;
  code_fonction: number;
  contact?: string;
  email?: string;
  est_membre_secretariat: boolean;
}

export interface PvSubmissionFormData {
  code_arrondissement: number;
  libelle: string;
  url_pv: string;
  hash_file?: string;
}

export interface RedressementCandidatFormData {
  code_bureau_vote: number;
  code_parti: number;
  nombre_vote_initial: number;
  nombre_vote_redresse: number;
  raison_redressement?: string;
}

export interface RedressementBureauFormData {
  code_bureau_vote: number;
  nombre_inscrit_initial: number;
  nombre_inscrit_redresse: number;
  nombre_votant_initial: number;
  nombre_votant_redresse: number;
  raison_redressement?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}