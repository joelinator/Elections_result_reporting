// types/redressement.ts
export interface RedressementCandidat {
  code: number;
  code_bureau_vote: number;
  code_parti: number;
  nombre_vote_initial: number;
  nombre_vote_redresse: number;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    code: number;
    designation: string;
  };
  parti?: {
    code: number;
    designation: string;
    abbreviation: string;
  };
}

export interface RedressementBureau {
  code: number;
  code_bureau_vote: number;
  nombre_inscrit_initial?: number;
  nombre_inscrit_redresse?: number;
  nombre_votant_initial?: number;
  nombre_votant_redresse?: number;
  taux_participation_initial?: number;
  taux_participation_redresse?: number;
  raison_redressement?: string;
  date_redressement: string;
  bureauVote?: {
    code: number;
    designation: string;
  };
}

export interface CreateRedressementCandidatDTO {
  code_bureau_vote: number;
  code_parti: number;
  nombre_vote_initial: number;
  nombre_vote_redresse: number;
  raison_redressement?: string;
}

export interface CreateRedressementBureauDTO {
  code_bureau_vote: number;
  nombre_inscrit_initial?: number;
  nombre_inscrit_redresse?: number;
  nombre_votant_initial?: number;
  nombre_votant_redresse?: number;
  taux_participation_initial?: number;
  taux_participation_redresse?: number;
  raison_redressement?: string;
}

export interface BureauVote {
  code: number;
  designation: string;
  description?: string;
  code_arrondissement: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  effectif?: number;
}