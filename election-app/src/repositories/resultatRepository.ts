// repositories/resultatRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ResultatRepository {
  async getByDepartment(departmentCode: number) {
    return prisma.resultatDepartement.findMany({
      where: { code_departement: departmentCode },
      include: { parti: true },
    });
  }

  async createResult(data: {
    code_departement: number;
    code_parti: number;
    nombre_vote: number;
    pourcentage?: number;
  }) {
    return prisma.resultatDepartement.create({ data });
  }

  async updateResult(code: number, data: Partial<{
    nombre_vote: number;
    pourcentage: number;
  }>) {
    return prisma.resultatDepartement.update({ where: { code }, data });
  }

  async deleteResult(code: number) {
    return prisma.resultatDepartement.delete({ where: { code } });
  }

  async getParties() {
    return prisma.partiPolitique.findMany();
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