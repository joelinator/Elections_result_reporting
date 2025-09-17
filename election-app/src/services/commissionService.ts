// services/commissionService.ts
import { BaseService } from './baseService';
import type { MembreCommission } from '@/types/api';
import type { CommitteeMemberFormData } from '@/types/forms';

export interface CommissionMember {
  code: number;
  nom: string;
  code_fonction: number;
  contact?: string;
  email?: string;
  est_membre_secretariat: boolean;
}

export interface CommissionFunction {
  code: number;
  libelle: string;
  description?: string;
}

export class CommissionService extends BaseService {
  constructor() {
    super('/commission');
  }

  async getMembers(departmentCode: number): Promise<CommissionMember[]> {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch(`${this.baseUrl}/departments/${departmentCode}/members`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching commission members:', error);
      return [];
    }
  }

  static async createMember(data: CommitteeMemberFormData): Promise<MembreCommission> {
    const response = await fetch('/api/commission-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create commission member');
    }

    return response.json();
  }

  static async updateMember(id: number, data: CommitteeMemberFormData): Promise<MembreCommission> {
    const response = await fetch(`/api/commission-members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update commission member');
    }

    return response.json();
  }

  async deleteMember(code: number): Promise<void> {
    // Mock implementation
    console.log('Deleting member:', code);
  }

  async getFunctions(): Promise<CommissionFunction[]> {
    // Mock implementation
    return [
      { code: 1, libelle: 'Président', description: 'Président de la commission' },
      { code: 2, libelle: 'Vice-Président', description: 'Vice-président de la commission' },
      { code: 3, libelle: 'Secrétaire', description: 'Secrétaire de la commission' },
      { code: 4, libelle: 'Rapporteur', description: 'Rapporteur de la commission' },
      { code: 5, libelle: 'Membre', description: 'Membre ordinaire de la commission' },
    ];
  }
}