// services/redressementBureauService.ts
import { RedressementBureauRepository } from '@/repositories/redressementBureauRepository';

const repo = new RedressementBureauRepository();

export class RedressementBureauService {
  async getRedressements(departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.getByDepartment(departmentCode);
  }

  async createRedressement(data: any, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    const bureaus = await repo.getBureauVotesByDepartment(departmentCode);
    if (!bureaus.some(b => b.code === data.code_bureau_vote)) throw new Error('Invalid bureau');
    return repo.createRedressement(data);
  }

  // Similar for update/delete
  async updateRedressement(code: number, data: any, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.updateRedressement(code, data);
  }

  async deleteRedressement(code: number, userId: number, departmentCode: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.deleteRedressement(code);
  }

  async getBureauVotes(departmentCode: number) {
    return repo.getBureauVotesByDepartment(departmentCode);
  }
}