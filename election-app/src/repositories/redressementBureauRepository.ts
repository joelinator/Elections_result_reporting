// repositories/redressementBureauRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RedressementBureauRepository {
  async getByDepartment(departmentCode: number) {
    return prisma.redressementBureauVote.findMany({
      where: {
        bureauVote: {
          arrondissement: {
            code_departement: departmentCode,
          },
        },
      },
      include: { bureauVote: true },
    });
  }

  async createRedressement(data: {
    code_bureau_vote: number;
    nombre_inscrit_initial?: number;
    nombre_inscrit_redresse?: number;
    // Add all fields...
    raison_redressement?: string;
  }) {
    return prisma.redressementBureauVote.create({ data });
  }

  async updateRedressement(code: number, data: Partial<{
    nombre_inscrit_initial: number;
    // Add all...
  }>) {
    return prisma.redressementBureauVote.update({ where: { code }, data });
  }

  async deleteRedressement(code: number) {
    return prisma.redressementBureauVote.delete({ where: { code } });
  }

  async getBureauVotesByDepartment(departmentCode: number) {
    return prisma.bureauVote.findMany({
      where: {
        arrondissement: {
          code_departement: departmentCode,
        },
      },
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