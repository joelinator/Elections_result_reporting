// services/commissionService.ts
import { CommissionRepository } from '@/repositories/commissionRepository';

const repo = new CommissionRepository();

export class CommissionService {
  async getMembers(departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) {
      throw new Error('Unauthorized access to department');
    }
    return repo.getMembersByDepartment(departmentCode);
  }

  async createMember(data: any, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, data.code_commission /* derive department from commission */);
    if (!isAssigned) throw new Error('Unauthorized');
    // Add validation logic here (e.g., limit reps per type)
    // Example: Check for max 3 admin reps, etc. (business rule)
    return repo.createMember(data);
  }

  // Similar for update/delete
  async updateMember(code: number, data: any, userId: number) {
    // Get member to derive department, check assignment
    const member = await repo.getMembersByDepartment(0); // Placeholder, fetch actual
    // ...
    return repo.updateMember(code, data);
  }

  async deleteMember(code: number, userId: number) {
    // Check assignment
    return repo.deleteMember(code);
  }

  async getFunctions() {
    return repo.getFunctions();
  }
}