// services/resultatService.ts
import { ResultatRepository } from '@/repositories/resultatRepository';

const repo = new ResultatRepository();

export class ResultatService {
  async getResults(departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.getByDepartment(departmentCode);
  }

  async createResult(data: any, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    data.code_departement = departmentCode;
    // Calculate pourcentage if needed (requires total votes from participation)
    return repo.createResult(data);
  }

  async updateResult(code: number, data: any, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.updateResult(code, data);
  }

  async deleteResult(code: number, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.deleteResult(code);
  }

  async getParties() {
    return repo.getParties();
  }
}