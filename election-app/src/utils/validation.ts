// utils/validation.ts
import * as z from 'zod';

export const participationValidationSchema = z.object({
  code: z.number().optional(),
  code_departement: z.number().optional(),
  nombre_bureau_vote: z.number().min(0, 'Must be at least 0'),
  nombre_inscrit: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_urnes: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_bulletins_differents: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_electeur_identifiable: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_enveloppes_signes: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_non_elecam: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_non_elecam: z.number().min(0, 'Must be at least 0'),
  nombre_bulletin_sans_enveloppe: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_vide: z.number().min(0, 'Must be at least 0'),
  nombre_suffrages_valable: z.number().min(0, 'Must be at least 0'),
  nombre_votant: z.number().min(0, 'Must be at least 0'),
  bulletin_nul: z.number().min(0, 'Must be at least 0'),
  suffrage_exprime: z.number().min(0, 'Must be at least 0').nullable().optional(),
  taux_participation: z.number().min(0, 'Must be at least 0').nullable().optional(),
  date_creation: z.string().nullable().optional(),
});

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

// Business validation rules
export const businessValidationRules = {
  validateParticipationData: (data: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Critical errors (should strongly discourage but not block)
    if (data.nombre_votant > data.nombre_inscrit) {
      errors.push('Number of voters exceeds registered voters - this is mathematically impossible');
    }
    
    if (data.bulletin_nul > data.nombre_votant) {
      errors.push('Invalid ballots exceed total voters - this cannot be correct');
    }
    
    // Logical warnings (common discrepancies in PVs)
    if (data.nombre_enveloppe_urnes !== data.nombre_votant) {
      warnings.push(`Envelopes in ballot boxes (${data.nombre_enveloppe_urnes}) doesn't match voters (${data.nombre_votant})`);
    }
    
    const calculatedSuffrageExprime = data.nombre_votant - data.bulletin_nul;
    if (data.suffrage_exprime && Math.abs(data.suffrage_exprime - calculatedSuffrageExprime) > 0) {
      warnings.push(`Expressed votes (${data.suffrage_exprime}) doesn't match calculated value (${calculatedSuffrageExprime})`);
    }
    
    if (data.nombre_inscrit > 0) {
      const calculatedTauxParticipation = (data.nombre_votant / data.nombre_inscrit) * 100;
      if (data.taux_participation && Math.abs(data.taux_participation - calculatedTauxParticipation) > 0.1) {
        warnings.push(`Participation rate (${data.taux_participation}%) doesn't match calculated rate (${calculatedTauxParticipation.toFixed(2)}%)`);
      }
    }
    
    // Check for suspicious values
    if (data.nombre_inscrit > 0 && (data.nombre_votant / data.nombre_inscrit) > 1.05) {
      warnings.push('Participation rate exceeds 105% - please verify the numbers');
    }
    
    if (data.nombre_votant > 0 && (data.bulletin_nul / data.nombre_votant) > 0.1) {
      warnings.push('Invalid ballots exceed 10% of total votes - this seems unusually high');
    }
    
    // Check for missing key values
    if (!data.nombre_inscrit || data.nombre_inscrit === 0) {
      warnings.push('Number of registered voters is not specified');
    }
    
    if (!data.nombre_votant || data.nombre_votant === 0) {
      warnings.push('Number of voters is not specified');
    }
    
    // Check irregular ballot irregularities sum
    const irregularBallots = data.nombre_enveloppe_bulletins_differents + 
                           data.nombre_bulletin_electeur_identifiable + 
                           data.nombre_bulletin_enveloppes_signes + 
                           data.nombre_enveloppe_non_elecam + 
                           data.nombre_bulletin_non_elecam + 
                           data.nombre_bulletin_sans_enveloppe + 
                           data.nombre_enveloppe_vide;
    
    if (irregularBallots > data.nombre_votant) {
      warnings.push('Sum of irregular ballots exceeds total voters - please verify the breakdown');
    }
    
    return {
      errors,
      warnings,
      isValid: errors.length === 0
    };
  }
};

export type ValidationErrors = string[];