// repositories/commissionRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommissionRepository {
  async getMembersByDepartment(departmentCode: number) {
    return prisma.membreCommission.findMany({
      where: {
        commission: {
          code_departement: departmentCode,
        },
      },
      include: {
        fonction: true,
        commission: true,
      },
    });
  }

  async createMember(data: {
    nom: string;
    code_fonction: number;
    contact?: string;
    email?: string;
    est_membre_secretariat?: boolean;
    code_commission: number;
  }) {
    return prisma.membreCommission.create({ data });
  }

  async updateMember(code: number, data: Partial<{
    nom: string;
    code_fonction: number;
    contact: string;
    email: string;
    est_membre_secretariat: boolean;
  }>) {
    return prisma.membreCommission.update({ where: { code }, data });
  }

  async deleteMember(code: number) {
    return prisma.membreCommission.delete({ where: { code } });
  }

  async getFunctions() {
    return prisma.fonctionCommission.findMany();
  }

  // Check user assignment (using affectation table)
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