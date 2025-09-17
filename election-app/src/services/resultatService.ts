// services/resultatService.ts
import type { ResultatDepartement } from '@/types/api';

export interface ResultFormData {
  code_departement: number;
  code_parti: number;
  nombre_vote: number;
  pourcentage?: number;
}

export class ResultatService {
  static async getByDepartment(departmentCode: number): Promise<ResultatDepartement[]> {
    try {
      const response = await fetch(`/api/results?department=${departmentCode}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  }

  static async create(data: ResultFormData): Promise<ResultatDepartement> {
    const response = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create result');
    }

    return response.json();
  }

  // Instance methods for component usage
  async getResults(departmentCode: number): Promise<ResultatDepartement[]> {
    try {
      const response = await fetch(`/api/departments/${departmentCode}/results`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    } catch (error) {
      console.error('Error fetching results:', error);
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

  async createResult(data: ResultFormData): Promise<ResultatDepartement> {
    const response = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create result');
    }

    return response.json();
  }

  async updateResult(id: number, data: ResultFormData): Promise<ResultatDepartement> {
    const response = await fetch(`/api/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update result');
    }

    return response.json();
  }

  async deleteResult(id: number): Promise<void> {
    const response = await fetch(`/api/results/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete result');
    }
  }
}