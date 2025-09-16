// repositories/redressementCandidatRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RedressementCandidatRepository {
  async getByDepartment(departmentCode: number) {
    return prisma.redressementCandidat.findMany({
      where: {
        bureauVote: {
          arrondissement: {
            code_departement: departmentCode,
          },
        },
      },
      include: { bureauVote: true, parti: true },
    });
  }

  async createRedressement(data: {
    code_bureau_vote: number;
    code_parti: number;
    nombre_vote_initial: number;
    nombre_vote_redresse: number;
    raison_redressement?: string;
  }) {
    return prisma.redressementCandidat.create({ data });
  }

  async updateRedressement(code: number, data: Partial<{
    nombre_vote_initial: number;
    nombre_vote_redresse: number;
    raison_redressement: string;
  }>) {
    return prisma.redressementCandidat.update({ where: { code }, data });
  }

  async deleteRedressement(code: number) {
    return prisma.redressementCandidat.delete({ where: { code } });
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