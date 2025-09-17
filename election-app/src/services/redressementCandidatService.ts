// services/redressementCandidatService.ts
import type { RedressementCandidat } from '@/types/api';
import type { RedressementCandidatFormData } from '@/types/forms';

export class RedressementCandidatService {
  static async getByDepartment(departmentCode: number): Promise<RedressementCandidat[]> {
    try {
      const response = await fetch(`/api/redressements/candidat?department=${departmentCode}`);
      if (!response.ok) throw new Error('Failed to fetch candidat redressements');
      return response.json();
    } catch (error) {
      console.error('Error fetching candidat redressements:', error);
      return [];
    }
  }

  static async create(data: RedressementCandidatFormData): Promise<RedressementCandidat> {
    const response = await fetch('/api/redressements/candidat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create candidat redressement');
    }

    return response.json();
  }

  // Instance methods for component usage
  async getRedressements(departmentCode: number, userId: number): Promise<RedressementCandidat[]> {
    try {
      const response = await fetch(`/api/departments/${departmentCode}/redressements/candidat?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch redressements');
      return response.json();
    } catch (error) {
      console.error('Error fetching redressements:', error);
      return [];
    }
  }

  async getBureauVotes(departmentCode: number): Promise<any[]> {
    try {
      const response = await fetch(`/api/departments/${departmentCode}/bureau-votes`);
      if (!response.ok) throw new Error('Failed to fetch bureau votes');
      return response.json();
    } catch (error) {
      console.error('Error fetching bureau votes:', error);
      return [];
    }
  }

  async getParties(): Promise<any[]> {
    try {
      const response = await fetch('/api/parties');
      if (!response.ok) throw new Error('Failed to fetch parties');
      return response.json();
    } catch (error) {
      console.error('Error fetching parties:', error);
      return [];
    }
  }

  async createRedressement(data: RedressementCandidatFormData, userId: number, departmentCode: number): Promise<RedressementCandidat> {
    const response = await fetch('/api/redressements/candidat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId, departmentCode })
    });

    if (!response.ok) {
      throw new Error('Failed to create redressement');
    }

    return response.json();
  }

  async updateRedressement(id: number, data: RedressementCandidatFormData, userId: number, departmentCode: number): Promise<RedressementCandidat> {
    const response = await fetch(`/api/redressements/candidat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId, departmentCode })
    });

    if (!response.ok) {
      throw new Error('Failed to update redressement');
    }

    return response.json();
  }

  async deleteRedressement(id: number, userId: number, departmentCode: number): Promise<void> {
    const response = await fetch(`/api/redressements/candidat/${id}?userId=${userId}&departmentCode=${departmentCode}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete redressement');
    }
  }
}