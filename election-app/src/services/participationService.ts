// services/participationService.ts
import { ParticipationRepository } from '@/repositories/participationRepository';
import { ParticipationCalculations } from '@/utils/calculations';
import { businessValidationRules, ValidationResult } from '@/utils/validation';
import { 
  ParticipationDepartement, 
  CreateParticipationDTO, 
  UpdateParticipationDTO,
  ParticipationFormData 
} from '@/types/participation';

const repo = new ParticipationRepository();

export class ParticipationService {
  async getParticipation(departmentCode: number, userId: number): Promise<ParticipationDepartement | null> {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized: User not assigned to this department');
    return repo.getByDepartment(departmentCode);
  }

  async validateParticipationData(data: ParticipationFormData): Promise<ValidationResult> {
    return businessValidationRules.validateParticipationData(data);
  }

  async updateParticipation(
    data: ParticipationFormData, 
    departmentCode: number, 
    userId: number,
    forceUpdate: boolean = false
  ): Promise<ParticipationDepartement> {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized: User not assigned to this department');
    
    // Only validate if not forcing update
    if (!forceUpdate) {
      const validation = await this.validateParticipationData(data);
      if (!validation.isValid || validation.warnings.length > 0) {
        // Return validation result to let the UI handle it
        throw new ValidationError('Data validation required', validation);
      }
    }
    
    // Business logic: Calculate derived fields
    const processedData = this.calculateDerivedFields(data, departmentCode);
    
    return repo.createOrUpdate(processedData, departmentCode);
  }

  async deleteParticipation(departmentCode: number, userId: number): Promise<ParticipationDepartement> {
    const isAssigned = await repo.isUserAssignedToDepartment(userId, departmentCode);
    if (!isAssigned) throw new Error('Unauthorized: User not assigned to this department');
    return repo.deleteByDepartment(departmentCode);
  }

  private calculateDerivedFields(data: ParticipationFormData, departmentCode: number): CreateParticipationDTO {
    // Calculate derived fields using utility
    const derivedFields = ParticipationCalculations.calculateDerivedFields(data);
    
    const processedData: CreateParticipationDTO = {
      code_departement: departmentCode,
      nombre_bureau_vote: data.nombre_bureau_vote,
      nombre_inscrit: data.nombre_inscrit,
      nombre_enveloppe_urnes: data.nombre_enveloppe_urnes,
      nombre_enveloppe_bulletins_differents: data.nombre_enveloppe_bulletins_differents,
      nombre_bulletin_electeur_identifiable: data.nombre_bulletin_electeur_identifiable,
      nombre_bulletin_enveloppes_signes: data.nombre_bulletin_enveloppes_signes,
      nombre_enveloppe_non_elecam: data.nombre_enveloppe_non_elecam,
      nombre_bulletin_non_elecam: data.nombre_bulletin_non_elecam,
      nombre_bulletin_sans_enveloppe: data.nombre_bulletin_sans_enveloppe,
      nombre_enveloppe_vide: data.nombre_enveloppe_vide,
      nombre_suffrages_valable: data.nombre_suffrages_valable,
      nombre_votant: data.nombre_votant,
      bulletin_nul: data.bulletin_nul,
      suffrage_exprime: derivedFields.suffrage_exprime ?? data.suffrage_exprime,
      taux_participation: derivedFields.taux_participation,
    };

    return processedData;
  }
}

export class ValidationError extends Error {
  constructor(message: string, public validationResult: ValidationResult) {
    super(message);
    this.name = 'ValidationError';
  }
}