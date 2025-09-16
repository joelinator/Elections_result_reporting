// types/pv.ts
export interface PvArrondissement {
  code: number;
  code_arrondissement: number;
  url_pv?: string;
  hash_file?: string;
  libelle?: string;
  timestamp?: string;
  arrondissement?: {
    code: number;
    libelle: string;
    abbreviation: string;
  };
}

export interface CreatePvDTO {
  code_arrondissement: number;
  url_pv?: string;
  hash_file?: string;
  libelle?: string;
}

export interface UpdatePvDTO {
  url_pv?: string;
  hash_file?: string;
  libelle?: string;
}

export interface Arrondissement {
  code: number;
  libelle: string;
  abbreviation: string;
  code_departement: number;
  code_region: number;
  description?: string;
}