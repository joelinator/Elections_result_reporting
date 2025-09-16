// repositories/participationRepository.ts
import { PrismaClient } from '@prisma/client';
import { 
  ParticipationDepartement, 
  CreateParticipationDTO, 
  UpdateParticipationDTO 
} from '@/types/participation';

const prisma = new PrismaClient();

export class ParticipationRepository {
  async getByDepartment(departmentCode: number): Promise<ParticipationDepartement | null> {
    return prisma.participationDepartement.findUnique({
      where: { code_departement: departmentCode },
    });
  }

  async createOrUpdate(
    data: CreateParticipationDTO | UpdateParticipationDTO, 
    departmentCode: number
  ): Promise<ParticipationDepartement> {
    return prisma.participationDepartement.upsert({
      where: { code_departement: departmentCode },
      update: data,
      create: { 
        ...data, 
        code_departement: departmentCode,
        // Set defaults for required fields if not provided in create
        nombre_enveloppe_bulletins_differents: data.nombre_enveloppe_bulletins_differents ?? 0,
        nombre_bulletin_electeur_identifiable: data.nombre_bulletin_electeur_identifiable ?? 0,
        nombre_bulletin_enveloppes_signes: data.nombre_bulletin_enveloppes_signes ?? 0,
        nombre_enveloppe_non_elecam: data.nombre_enveloppe_non_elecam ?? 0,
        nombre_bulletin_non_elecam: data.nombre_bulletin_non_elecam ?? 0,
        nombre_bulletin_sans_enveloppe: data.nombre_bulletin_sans_enveloppe ?? 0,
        nombre_enveloppe_vide: data.nombre_enveloppe_vide ?? 0,
      } as CreateParticipationDTO,
    });
  }

  async deleteByDepartment(departmentCode: number): Promise<ParticipationDepartement> {
    return prisma.participationDepartement.delete({
      where: { code_departement: departmentCode },
    });
  }

  async isUserAssignedToDepartment(userId: number, departmentCode: number): Promise<boolean> {
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