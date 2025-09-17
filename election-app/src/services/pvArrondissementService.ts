// src/services/pvArrondissementService.ts
import type { PvArrondissement, CreatePvDTO, UpdatePvDTO, Arrondissement } from '@/types/pv';

export class PvArrondissementService {
  static async getByArrondissement(arrondissementCode: number): Promise<PvArrondissement[]> {
    try {
      const response = await fetch(`/api/pv-arrondissement?arrondissement=${arrondissementCode}`);
      if (!response.ok) throw new Error('Failed to fetch PV data');
      return response.json();
    } catch (error) {
      console.error('Error fetching PV data:', error);
      return [];
    }
  }

  static async create(data: CreatePvDTO): Promise<PvArrondissement> {
    const response = await fetch('/api/pv-arrondissement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create PV submission');
    }

    return response.json();
  }

    // Instance methods for component usage
  async getPvs(departmentCode: number, userId: number): Promise<PvArrondissement[]> {
    try {
      const response = await fetch(`/api/pv-arrondissement?department=${departmentCode}&user=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch PVs');
      return response.json();
    } catch (error) {
      console.error('Error fetching PVs:', error);
      return [];
    }
  }

  async getArrondissements(departmentCode: number): Promise<Arrondissement[]> {
    try {
      const response = await fetch(`/api/arrondissements?department=${departmentCode}`);
      if (!response.ok) throw new Error('Failed to fetch arrondissements');
      return response.json();
    } catch (error) {
      console.error('Error fetching arrondissements:', error);
      return [];
    }
  }

  async createPv(data: CreatePvDTO, userId: number, departmentCode: number): Promise<PvArrondissement> {
    const response = await fetch('/api/pv-arrondissement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId, departmentCode })
    });

    if (!response.ok) {
      throw new Error('Failed to create PV');
    }

    return response.json();
  }

  async updatePv(id: number, data: UpdatePvDTO, userId: number, departmentCode: number): Promise<PvArrondissement> {
    const response = await fetch(`/api/pv-arrondissement/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId, departmentCode })
    });

    if (!response.ok) {
      throw new Error('Failed to update PV');
    }

    return response.json();
  }

  async deletePv(id: number, userId: number, departmentCode: number): Promise<void> {
    const response = await fetch(`/api/pv-arrondissement/${id}?userId=${userId}&departmentCode=${departmentCode}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete PV');
    }
  }
}