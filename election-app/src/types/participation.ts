// types/participation.ts
export interface ParticipationDepartement {
  code?: number;
  code_departement: number;
  nombre_bureau_vote: number;
  nombre_inscrit: number;
  nombre_enveloppe_urnes: number;
  nombre_enveloppe_bulletins_differents: number;
  nombre_bulletin_electeur_identifiable: number;
  nombre_bulletin_enveloppes_signes: number;
  nombre_enveloppe_non_elecam: number;
  nombre_bulletin_non_elecam: number;
  nombre_bulletin_sans_enveloppe: number;
  nombre_enveloppe_vide: number;
  nombre_suffrages_valable: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime?: number | null;
  taux_participation?: number | null;
  date_creation?: string | null;
}

export interface CreateParticipationDTO {
  code_departement: number;
  nombre_bureau_vote: number;
  nombre_inscrit: number;
  nombre_enveloppe_urnes: number;
  nombre_enveloppe_bulletins_differents?: number;
  nombre_bulletin_electeur_identifiable?: number;
  nombre_bulletin_enveloppes_signes?: number;
  nombre_enveloppe_non_elecam?: number;
  nombre_bulletin_non_elecam?: number;
  nombre_bulletin_sans_enveloppe?: number;
  nombre_enveloppe_vide?: number;
  nombre_suffrages_valable: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime?: number | null;
  taux_participation?: number | null;
}

export interface UpdateParticipationDTO {
  nombre_bureau_vote?: number;
  nombre_inscrit?: number;
  nombre_enveloppe_urnes?: number;
  nombre_enveloppe_bulletins_differents?: number;
  nombre_bulletin_electeur_identifiable?: number;
  nombre_bulletin_enveloppes_signes?: number;
  nombre_enveloppe_non_elecam?: number;
  nombre_bulletin_non_elecam?: number;
  nombre_bulletin_sans_enveloppe?: number;
  nombre_enveloppe_vide?: number;
  nombre_suffrages_valable?: number;
  nombre_votant?: number;
  bulletin_nul?: number;
  suffrage_exprime?: number | null;
  taux_participation?: number | null;
}

export interface ParticipationFormData {
  code?: number;
  code_departement?: number;
  nombre_bureau_vote?: number;
  nombre_inscrit?: number;
  nombre_enveloppe_urnes?: number;
  nombre_enveloppe_bulletins_differents?: number;
  nombre_bulletin_electeur_identifiable?: number;
  nombre_bulletin_enveloppes_signes?: number;
  nombre_enveloppe_non_elecam?: number;
  nombre_bulletin_non_elecam?: number;
  nombre_bulletin_sans_enveloppe?: number;
  nombre_enveloppe_vide?: number;
  nombre_suffrages_valable?: number;
  nombre_votant?: number;
  bulletin_nul?: number;
  suffrage_exprime?: number | null;
  taux_participation?: number | null;
  date_creation?: string | null;
}
