// repositories/pvArrondissementRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PvArrondissementRepository {
  async getPvByDepartment(departmentCode: number) {
    return prisma.pvArrondissement.findMany({
      where: {
        arrondissement: {
          code_departement: departmentCode,
        },
      },
      include: { arrondissement: true },
    });
  }

  async createPv(data: {
    code_arrondissement: number;
    url_pv?: string;
    hash_file?: string;
    libelle?: string;
  }) {
    return prisma.pvArrondissement.create({ data });
  }

  async updatePv(code: number, data: Partial<{
    url_pv: string;
    hash_file: string;
    libelle: string;
  }>) {
    return prisma.pvArrondissement.update({ where: { code }, data });
  }

  async deletePv(code: number) {
    return prisma.pvArrondissement.delete({ where: { code } });
  }

  async getArrondissementsByDepartment(departmentCode: number) {
    return prisma.arrondissement.findMany({
      where: { code_departement: departmentCode },
    });
  }

  // Reuse assignment check from commissionRepo or duplicate for simplicity
  async isUserAssignedToDepartment(userId: number, departmentCode: number) {
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