// utils/calculations.ts
import { ParticipationFormData } from '@/types/participation';

export class ParticipationCalculations {
  /**
   * Calculate participation rate as percentage
   */
  static calculateTauxParticipation(nombreVotant: number, nombreInscrit: number): number | null {
    if (nombreInscrit === 0) return null;
    return (nombreVotant / nombreInscrit) * 100;
  }

  /**
   * Calculate expressed votes (suffrage exprime)
   */
  static calculateSuffrageExprime(nombreVotant: number, bulletinNul: number): number {
    return nombreVotant - bulletinNul;
  }

  /**
   * Validate data consistency
   */
  static validateConsistency(data: ParticipationFormData): string[] {
    const errors: string[] = [];
    
    // Check if voters don't exceed registered voters
    if (data.nombre_votant > data.nombre_inscrit) {
      errors.push('Number of voters cannot exceed registered voters');
    }
    
    // Check if envelopes match voters
    if (data.nombre_enveloppe_urnes > data.nombre_votant) {
      errors.push('Envelopes in ballot boxes cannot exceed number of voters');
    }
    
    // Check if null ballots don't exceed total voters
    if (data.bulletin_nul > data.nombre_votant) {
      errors.push('Invalid ballots cannot exceed total voters');
    }
    
    return errors;
  }

  /**
   * Calculate all derived fields
   */
  static calculateDerivedFields(data: ParticipationFormData): Partial<ParticipationFormData> {
    const derived: Partial<ParticipationFormData> = {};
    
    // Calculate participation rate
    derived.taux_participation = this.calculateTauxParticipation(
      data.nombre_votant, 
      data.nombre_inscrit
    );
    
    // Calculate expressed votes if not provided
    if (!data.suffrage_exprime) {
      derived.suffrage_exprime = this.calculateSuffrageExprime(
        data.nombre_votant, 
        data.bulletin_nul
      );
    }
    
    return derived;
  }
}