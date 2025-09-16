// types/commission.ts
export interface CommissionMember {
  code: number;
  nom: string;
  code_fonction: number;
  contact?: string;
  email?: string;
  est_membre_secretariat?: boolean;
  code_commission: number;
  fonction?: {
    code: number;
    libelle: string;
    description?: string;
  };
}

export interface CommissionFunction {
  code: number;
  libelle: string;
  description?: string;
}

export interface CreateCommissionMemberDTO {
  nom: string;
  code_fonction: number;
  contact?: string;
  email?: string;
  est_membre_secretariat?: boolean;
  code_commission: number;
}

export interface UpdateCommissionMemberDTO {
  nom?: string;
  code_fonction?: number;
  contact?: string;
  email?: string;
  est_membre_secretariat?: boolean;
}