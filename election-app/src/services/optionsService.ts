// services/optionsService.ts
import type { 
  Department, 
  Region, 
  Arrondissement, 
  BureauVote, 
  PartiPolitique, 
  User, 
  Role, 
  Candidat 
} from '@/types/api';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
}

export class OptionsService {
  static async getDepartments(regionCode?: number): Promise<SelectOption[]> {
    try {
      const url = regionCode 
        ? `/api/departments?region=${regionCode}`
        : '/api/departments';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch departments');
      
      const departments = await response.json();
      return departments.map((dept: Department) => ({
        value: dept.code,
        label: dept.libelle,
        description: dept.region?.libelle ? `Région: ${dept.region.libelle}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  static async getRegions(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/regions');
      if (!response.ok) throw new Error('Failed to fetch regions');
      
      const regions = await response.json();
      return regions.map((region: Region) => ({
        value: region.code,
        label: region.libelle,
        description: region.chef_lieu ? `Chef-lieu: ${region.chef_lieu}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  }

  static async getArrondissements(departmentCode?: number): Promise<SelectOption[]> {
    try {
      const url = departmentCode 
        ? `/api/arrondissements?department=${departmentCode}`
        : '/api/arrondissements';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch arrondissements');
      
      const arrondissements = await response.json();
      return arrondissements.map((arr: Arrondissement) => ({
        value: arr.code,
        label: arr.libelle,
        description: arr.departement?.libelle ? `Département: ${arr.departement.libelle}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching arrondissements:', error);
      return [];
    }
  }

  static async getBureauVotes(arrondissementCode?: number): Promise<SelectOption[]> {
    try {
      const url = arrondissementCode 
        ? `/api/bureau-votes?arrondissement=${arrondissementCode}`
        : '/api/bureau-votes';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch bureau votes');
      
      const bureaux = await response.json();
      return bureaux.map((bureau: BureauVote) => ({
        value: bureau.code,
        label: bureau.designation,
        description: bureau.arrondissement?.libelle ? `Arrondissement: ${bureau.arrondissement.libelle}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching bureau votes:', error);
      return [];
    }
  }

  static async getParties(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/parties');
      if (!response.ok) throw new Error('Failed to fetch parties');
      
      const parties = await response.json();
      return parties.map((party: PartiPolitique) => ({
        value: party.code,
        label: party.designation,
        description: party.abbreviation ? `${party.abbreviation}${party.coloration_bulletin ? ` - ${party.coloration_bulletin}` : ''}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching parties:', error);
      return [];
    }
  }

  static async getUsers(roleCode?: number): Promise<SelectOption[]> {
    try {
      const url = roleCode 
        ? `/api/users?role=${roleCode}`
        : '/api/users';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const users = await response.json();
      return users.map((user: User) => ({
        value: user.code,
        label: user.noms_prenoms,
        description: user.role?.libelle ? `Rôle: ${user.role.libelle}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async getRoles(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      
      const roles = await response.json();
      return roles.map((role: Role) => ({
        value: role.code,
        label: role.libelle
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  static async getCandidates(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/candidates');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      
      const candidates = await response.json();
      return candidates.map((candidate: Candidat) => ({
        value: candidate.code,
        label: candidate.noms_prenoms,
        description: candidate.numero_candidat ? `N° ${candidate.numero_candidat}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  }
}