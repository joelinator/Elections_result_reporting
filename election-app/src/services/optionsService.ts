// services/optionsService.ts
import { SelectOption } from '@/components/ui/SmartSelect';

export class OptionsService {
  // Get departments for select options
  async getDepartmentOptions(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/options/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      
      const departments = await response.json();
      return departments.map((dept: any) => ({
        value: dept.code,
        label: dept.libelle || `Department ${dept.code}`,
        description: `${dept.abbreviation ? `${dept.abbreviation} - ` : ''}${dept.region?.libelle || ''}`
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Get regions for select options
  async getRegionOptions(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/options/regions');
      if (!response.ok) throw new Error('Failed to fetch regions');
      
      const regions = await response.json();
      return regions.map((region: any) => ({
        value: region.code,
        label: region.libelle || `Region ${region.code}`,
        description: `${region.abbreviation ? `${region.abbreviation} - ` : ''}Chef-lieu: ${region.chef_lieu || 'N/A'}`
      }));
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  }

  // Get arrondissements for a specific department
  async getArrondissementOptions(departmentCode?: number): Promise<SelectOption[]> {
    try {
      const url = departmentCode 
        ? `/api/options/arrondissements?departmentCode=${departmentCode}`
        : '/api/options/arrondissements';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch arrondissements');
      
      const arrondissements = await response.json();
      return arrondissements.map((arr: any) => ({
        value: arr.code,
        label: arr.libelle || `Arrondissement ${arr.code}`,
        description: `Department: ${arr.departement?.libelle || 'N/A'}`
      }));
    } catch (error) {
      console.error('Error fetching arrondissements:', error);
      return [];
    }
  }

  // Get bureau de votes for a specific arrondissement or department
  async getBureauVoteOptions(arrondissementCode?: number, departmentCode?: number): Promise<SelectOption[]> {
    try {
      const params = new URLSearchParams();
      if (arrondissementCode) params.append('arrondissementCode', arrondissementCode.toString());
      if (departmentCode && !arrondissementCode) params.append('departmentCode', departmentCode.toString());
      
      const url = `/api/options/bureau-votes${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch bureau votes');
      
      const bureaux = await response.json();
      return bureaux.map((bureau: any) => ({
        value: bureau.code,
        label: bureau.designation || `Bureau ${bureau.code}`,
        description: `${bureau.arrondissement?.libelle || 'N/A'} - ${bureau.arrondissement?.departement?.libelle || 'N/A'}`
      }));
    } catch (error) {
      console.error('Error fetching bureau votes:', error);
      return [];
    }
  }

  // Get political parties
  async getPartiOptions(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/options/parties');
      if (!response.ok) throw new Error('Failed to fetch parties');
      
      const parties = await response.json();
      return parties.map((parti: any) => ({
        value: parti.code,
        label: parti.designation || `Party ${parti.code}`,
        description: `${parti.abbreviation ? `${parti.abbreviation}` : ''}${parti.coloration_bulletin ? ` - ${parti.coloration_bulletin}` : ''}`
      }));
    } catch (error) {
      console.error('Error fetching parties:', error);
      return [];
    }
  }

  // Get users with optional role filter
  async getUserOptions(roleCode?: number): Promise<SelectOption[]> {
    try {
      const url = roleCode 
        ? `/api/options/users?roleCode=${roleCode}`
        : '/api/options/users';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const users = await response.json();
      return users.map((user: any) => ({
        value: user.code,
        label: user.noms_prenoms,
        description: `${user.username} - ${user.role?.libelle || 'No role'} - ${user.email}`
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get roles
  async getRoleOptions(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/options/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      
      const roles = await response.json();
      return roles.map((role: any) => ({
        value: role.code,
        label: role.libelle || `Role ${role.code}`
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  // Get candidates
  async getCandidatOptions(): Promise<SelectOption[]> {
    try {
      const response = await fetch('/api/options/candidates');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      
      const candidats = await response.json();
      return candidats.map((candidat: any) => ({
        value: candidat.code,
        label: candidat.noms_prenoms || `Candidate ${candidat.code}`,
        description: `Numéro: ${candidat.numero_candidat || 'N/A'}`
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  }
}