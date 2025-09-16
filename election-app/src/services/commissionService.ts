// services/commissionService.ts
import { BaseService } from './baseService';
import { CommissionMember, CommissionFunction, CreateCommissionMemberDTO, UpdateCommissionMemberDTO } from '@/types/commission';

export class CommissionService extends BaseService {
  constructor() {
    super('/commission');
  }

  async getMembers(departmentCode: number, userId: number): Promise<CommissionMember[]> {
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
    // Mock implementation
    console.log('Updating member:', code, data, 'User:', userId);
    return { code, ...data } as CommissionMember;
  }

  async deleteMember(code: number, userId: number): Promise<void> {
    // Mock implementation
    console.log('Deleting member:', code, 'User:', userId);
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