// types/results.ts
export interface ResultatDepartement {
  code: number;
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage: number;
  date_creation: string;
  parti?: {
    code: number;
    designation: string;
    abbreviation: string;
  };
}

export interface CreateResultatDTO {
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
}

export interface UpdateResultatDTO {
  nombre_vote?: number;
  pourcentage?: number;
}

export interface PartiPolitique {
  code: number;
  designation: string;
  abbreviation: string;
  description?: string;
  coloration_bulletin?: string;
  image?: string;
  code_candidat?: number;
}