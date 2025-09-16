// types/user.ts
export interface User {
  id: number;
  code: number;
  noms_prenoms: string;
  email: string;
  username: string;
  contact?: string;
  adresse?: string;
  boite_postale?: string;
  code_role?: number;
  statut_vie?: number;
  last_login?: string;
  date_creation?: string;
  date_modification?: string;
}

export interface UserAssignment {
  code: number;
  code_utilisateur: number;
  type_territorial: 'region' | 'departement' | 'arrondissement';
  code_territorial: number;
  affecte_par?: number;
  date_affectation: Date;
  date_modification: Date;
  est_actif: boolean;
  notes?: string;
}