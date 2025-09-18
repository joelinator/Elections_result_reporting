/**
 * @file API client pour la gestion des participations d'arrondissement
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface ParticipationArrondissement {
  code: number;
  code_arrondissement: number;
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
  suffrage_exprime?: number;
  taux_participation?: number;
  date_creation?: string;
  arrondissement?: {
    code: number;
    libelle: string;
    abbreviation?: string;
    departement?: {
      code: number;
      libelle: string;
      abbreviation?: string;
      chef_lieu?: string;
      region?: {
        code: number;
        libelle: string;
        abbreviation?: string;
      };
    };
  };
}

export interface ParticipationArrondissementInput {
  code_arrondissement: number;
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
  suffrage_exprime?: number;
  taux_participation?: number;
}

export interface ParticipationArrondissementFilters {
  arrondissement?: number;
  departement?: number;
  region?: number;
}

class ParticipationArrondissementApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAll(filters: ParticipationArrondissementFilters = {}): Promise<ParticipationArrondissement[]> {
    const searchParams = new URLSearchParams();
    
    if (filters.arrondissement) {
      searchParams.append('arrondissement', filters.arrondissement.toString());
    }
    if (filters.departement) {
      searchParams.append('departement', filters.departement.toString());
    }
    if (filters.region) {
      searchParams.append('region', filters.region.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/participation-arrondissement?${queryString}` : '/participation-arrondissement';
    
    return this.request<ParticipationArrondissement[]>(endpoint);
  }

  async getById(id: number): Promise<ParticipationArrondissement> {
    return this.request<ParticipationArrondissement>(`/participation-arrondissement/${id}`);
  }

  async create(data: ParticipationArrondissementInput): Promise<ParticipationArrondissement> {
    return this.request<ParticipationArrondissement>('/participation-arrondissement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: Partial<ParticipationArrondissementInput>): Promise<ParticipationArrondissement> {
    return this.request<ParticipationArrondissement>(`/participation-arrondissement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    await this.request(`/participation-arrondissement/${id}`, {
      method: 'DELETE',
    });
  }

  // Fonctions utilitaires pour les calculs
  calculateTauxParticipation(nombreVotant: number, nombreInscrit: number): number {
    if (nombreInscrit === 0) return 0;
    return (nombreVotant / nombreInscrit) * 100;
  }

  calculateSuffrageExprime(nombreSuffragesValables: number, nombreVotant: number): number {
    if (nombreVotant === 0) return 0;
    return (nombreSuffragesValables / nombreVotant) * 100;
  }

  // Validation des données
  validateData(data: ParticipationArrondissementInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.code_arrondissement) {
      errors.push('Le code arrondissement est requis');
    }

    if (data.nombre_inscrit < 0) {
      errors.push('Le nombre d\'inscrits ne peut pas être négatif');
    }

    if (data.nombre_votant < 0) {
      errors.push('Le nombre de votants ne peut pas être négatif');
    }

    if (data.nombre_votant && data.nombre_inscrit && data.nombre_votant > data.nombre_inscrit) {
      errors.push('Le nombre de votants ne peut pas être supérieur au nombre d\'inscrits');
    }

    if (data.nombre_suffrages_valable && data.nombre_votant && data.nombre_suffrages_valable > data.nombre_votant) {
      errors.push('Le nombre de suffrages valables ne peut pas être supérieur au nombre de votants');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const participationArrondissementApi = new ParticipationArrondissementApi();
