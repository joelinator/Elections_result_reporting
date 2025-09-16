// repositories/participationRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ParticipationRepository {
  async getByDepartment(departmentCode: number) {
    return prisma.participationDepartement.findUnique({
      where: { code_departement: departmentCode },
    });
  }

  async createOrUpdate(data: any, departmentCode: number) {
    return prisma.participationDepartement.upsert({
      where: { code_departement: departmentCode },
      update: data,
      create: { ...data, code_departement: departmentCode },
    });
  }

  async deleteByDepartment(departmentCode: number) {
    return prisma.participationDepartement.delete({
      where: { code_departement: departmentCode },
    });
  }

  async isUserAssignedToDepartment(userId: number, departmentCode: number) {
    // Same as above
    const assignment = await prisma.utilisateurAffectationTerritoriale.findFirst({
      where: {
        code_utilisateur: userId,
        type_territorial: 'departement',
        code_territorial: departmentCode,
        est_actif: true,
      },
    });
    return !!assignment;
  }
}