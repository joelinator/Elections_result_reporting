// types/api.ts
export interface Department {
  code: number;
  libelle: string;
  abbreviation?: string;
  region?: {
    libelle: string;
  };
}

export interface Region {
  code: number;
  libelle: string;
  abbreviation?: string;
  chef_lieu?: string;
}

export interface Arrondissement {
  code: number;
  libelle: string;
  departement?: {
    libelle: string;
  };
}

export interface BureauVote {
  code: number;
  designation: string;
  arrondissement?: {
    libelle: string;
    departement?: {
      libelle: string;
    };
  };
}

export interface PartiPolitique {
  code: number;
  designation: string;
  abbreviation?: string;
  coloration_bulletin?: string;
}

export interface User {
  code: number;
  noms_prenoms: string;
  username: string;
  email: string;
  role?: {
    libelle: string;
  };
}

export interface Role {
  code: number;
  libelle: string;
}

export interface Candidat {
  code: number;
  noms_prenoms: string;
  numero_candidat?: number;
}

export interface Commission {
  code: number;
  libelle: string;
  description?: string;
  departement?: {
    libelle: string;
  };
}

export interface FonctionCommission {
  code: number;
  libelle: string;
  description?: string;
}

export interface MembreCommission {
  code: number;
  nom: string;
  contact?: string;
  email?: string;
  est_membre_secretariat: boolean;
  fonction?: {
    libelle: string;
  };
}

export interface PvArrondissement {
  code: number;
  libelle: string;
  url_pv: string;
  arrondissement?: {
    libelle: string;
  };
}

export interface RedressementCandidat {
  code: number;
  nombre_vote_initial: number;
  nombre_vote_redresse: number;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    designation: string;
  };
  parti?: {
    designation: string;
  };
}

export interface RedressementBureauVote {
  code: number;
  nombre_inscrit_initial: number;
  nombre_inscrit_redresse: number;
  nombre_votant_initial: number;
  nombre_votant_redresse: number;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    designation: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}