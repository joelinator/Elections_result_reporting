// services/redressementBureauService.ts
import type { RedressementBureauVote, BureauVote } from '@/types/api';

export interface CreateRedressementBureauDTO {
  code_bureau_vote: number;
  nombre_inscrit_initial: number;
  nombre_inscrit_redresse: number;
  nombre_votant_initial: number;
  nombre_votant_redresse: number;
  raison_redressement?: string;
}

export class RedressementBureauService {
  static async getByDepartment(departmentCode: number): Promise<RedressementBureauVote[]> {
    try {
      const response = await fetch(`/api/redressement-bureau?department=${departmentCode}`);
      if (!response.ok) throw new Error('Failed to fetch redressements');
      return response.json();
    } catch (error) {
      console.error('Error fetching redressements:', error);
      return [];
    }
  }

  static async create(data: CreateRedressementBureauDTO): Promise<RedressementBureauVote> {
    const response = await fetch('/api/redressement-bureau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create redressement');
    }

    return response.json();
  }

  // Instance methods for component usage
  async getRedressements(departmentCode: number, userId: number): Promise<RedressementBureauVote[]> {
    try {
      const response = await fetch(`/api/redressement-bureau?department=${departmentCode}&user=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch redressements');
      return response.json();
    } catch (error) {
      console.error('Error fetching redressements:', error);
      return [];
    }
  }

  async getBureauVotes(departmentCode: number): Promise<BureauVote[]> {
    try {
      const response = await fetch(`/api/bureau-votes?department=${departmentCode}`);
      if (!response.ok) throw new Error('Failed to fetch bureau votes');
      return response.json();
    } catch (error) {
      console.error('Error fetching bureau votes:', error);
      return [];
    }
  }

  async createRedressement(data: CreateRedressementBureauDTO, userId: number, departmentCode: number): Promise<RedressementBureauVote> {
    const response = await fetch('/api/redressement-bureau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId, departmentCode })
    });

    if (!response.ok) {
      throw new Error('Failed to create redressement');
    }

    return response.json();
  }

  async updateRedressement(id: number, data: CreateRedressementBureauDTO, userId: number, departmentCode: number): Promise<RedressementBureauVote> {
    const response = await fetch(`/api/redressement-bureau/${id}`, {
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
    const response = await fetch(`/api/redressement-bureau/${id}?userId=${userId}&departmentCode=${departmentCode}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete redressement');
    }
  }
}