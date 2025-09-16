// services/participationService.ts
import { ParticipationRepository } from '@/repositories/participationRepository';

const repo = new ParticipationRepository();

export class ParticipationService {
  async getParticipation(departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.getByDepartment(departmentCode);
  }

  async updateParticipation(data: any, departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    // Business logic: Calculate taux_participation = (nombre_votant / nombre_inscrit) * 100, etc.
    if (data.nombre_inscrit > 0) {
      data.taux_participation = (data.nombre_votant / data.nombre_inscrit) * 100;
    }
    return repo.createOrUpdate(data, departmentCode);
  }

  async deleteParticipation(departmentCode: number, userId: number) {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized');
    return repo.deleteByDepartment(departmentCode);
  }
}