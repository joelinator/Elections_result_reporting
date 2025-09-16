// src/services/pvArrondissementService.ts
import { PvArrondissementRepository } from '@/repositories/pvArrondissementRepository';

const repo = new PvArrondissementRepository();

export class PvArrondissementService {
  async getPvs(departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.getPvByDepartment(departmentCode);
  }

  async createPv(data: any, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    const arr = await repo.getArrondissementsByDepartment(departmentCode);
    if (!arr.some((a) => a.code === data.code_arrondissement)) throw new Error('Invalid arrondissement');
    return repo.createPv(data); // Expects { code_arrondissement, url_pv, hash_file, libelle }
  }

  async updatePv(code: number, data: any, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.updatePv(code, data);
  }

  async deletePv(code: number, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.deletePv(code);
  }

  async getArrondissements(departmentCode: number) {
    return repo.getArrondissementsByDepartment(departmentCode);
  }
}