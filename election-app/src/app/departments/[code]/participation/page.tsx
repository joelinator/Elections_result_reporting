// src/app/departments/[code]/participation/page.tsx
import { useAuth } from '@/contexts/AuthContext';
import { ParticipationService } from '@/services/participationService';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const service = new ParticipationService();

// Updated Participation interface to match the Prisma model exactly.
// Note: Fields are no longer optional if they are non-nullable in Prisma.
// The `field` properties are removed as they are not in the Prisma model.
interface Participation {
  code?: number;
  code_departement: number;
  nombre_bureau_vote: number;
  nombre_inscrit: number;
  nombre_enveloppe_urnes: number;
  nombre_enveloppe_bulletins_differents: number;
  nombre_bulletin_electeur_identifiable: number;
  nombre_bulletin_enveloppes_signes: number;
  nombre_enveloppe_non_elecam: number;
  nombre_bulletin_non_elecam: number;
  nombre_bulletin_sans_enveloppe: number;
  nombre_enveloppe_vide: number;
  nombre_suffrages_valable: number;
  nombre_votant: number;
  bulletin_nul: number;
  suffrage_exprime?: number | null;
  taux_participation?: number | null;
  date_creation?: string | null;
}

// Updated zod schema to match the Prisma model exactly.
const participationSchema = z.object({
  code: z.number().optional(),
  code_departement: z.number().optional(), // Make optional for form
  nombre_bureau_vote: z.number().min(0, 'Must be at least 0'),
  nombre_inscrit: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_urnes: z.number().min(0, 'Must be at least 0'),
  nombre_enveloppe_bulletins_differents: z.number().min(0, 'Must be at least 0').default(0),
  nombre_bulletin_electeur_identifiable: z.number().min(0, 'Must be at least 0').default(0),
  nombre_bulletin_enveloppes_signes: z.number().min(0, 'Must be at least 0').default(0),
  nombre_enveloppe_non_elecam: z.number().min(0, 'Must be at least 0').default(0),
  nombre_bulletin_non_elecam: z.number().min(0, 'Must be at least 0').default(0),
  nombre_bulletin_sans_enveloppe: z.number().min(0, 'Must be at least 0').default(0),
  nombre_enveloppe_vide: z.number().min(0, 'Must be at least 0').default(0),
  nombre_suffrages_valable: z.number().min(0, 'Must be at least 0'),
  nombre_votant: z.number().min(0, 'Must be at least 0'),
  bulletin_nul: z.number().min(0, 'Must be at least 0'),
  suffrage_exprime: z.number().min(0, 'Must be at least 0').optional().nullable(),
  taux_participation: z.number().min(0, 'Must be at least 0').optional().nullable(),
  date_creation: z.string().nullable().optional(),
});


export default function ParticipationPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof participationSchema>>({
    resolver: zodResolver(participationSchema),
    // CORRECTED: Ensure all fields from the schema are present in defaultValues.
    defaultValues: {
      nombre_bureau_vote: 0,
      nombre_inscrit: 0,
      nombre_enveloppe_urnes: 0,
      // Add all new fields from the Prisma schema
      nombre_enveloppe_bulletins_differents: 0,
      nombre_bulletin_electeur_identifiable: 0,
      nombre_bulletin_enveloppes_signes: 0,
      nombre_enveloppe_non_elecam: 0,
      nombre_bulletin_non_elecam: 0,
      nombre_bulletin_sans_enveloppe: 0,
      nombre_enveloppe_vide: 0,
      nombre_suffrages_valable: 0,
      nombre_votant: 0,
      bulletin_nul: 0,
      suffrage_exprime: 0,
      taux_participation: 0,
    },
  });

  useEffect(() => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = await service.getParticipation(Number(departmentCode), user.id);
        // data will be of type 'Participation | null' from the service.
        setParticipation(data);
        if (data) {
          form.reset(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load participation data');
        toast.error(err.message || 'Failed to load participation data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, departmentCode, form]);

  const handleSubmit = async (data: z.infer<typeof participationSchema>) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    try {
      const updated = await service.updateParticipation(data, Number(departmentCode), user.id);
      setParticipation(updated);
      toast.success('Participation data saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save participation data');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    try {
      await service.deleteParticipation(Number(departmentCode), user.id);
      setParticipation(null);
      form.reset();
      toast.success('Participation data deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete participation data');
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Department Participation - Department {departmentCode}</h1>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-2 gap-4">
        <FormField
          label="Number of Bureau Votes"
          id="nombre_bureau_vote"
          type="number"
          register={form.register('nombre_bureau_vote', { valueAsNumber: true })}
          error={form.formState.errors.nombre_bureau_vote}
        />
        <FormField
          label="Registered Voters"
          id="nombre_inscrit"
          type="number"
          register={form.register('nombre_inscrit', { valueAsNumber: true })}
          error={form.formState.errors.nombre_inscrit}
        />
        <FormField
          label="Envelopes in Ballot Boxes"
          id="nombre_enveloppe_urnes"
          type="number"
          register={form.register('nombre_enveloppe_urnes', { valueAsNumber: true })}
          error={form.formState.errors.nombre_enveloppe_urnes}
        />
        <FormField
          label="Number of Voters"
          id="nombre_votant"
          type="number"
          register={form.register('nombre_votant', { valueAsNumber: true })}
          error={form.formState.errors.nombre_votant}
        />
        <FormField
          label="Invalid Ballots"
          id="bulletin_nul"
          type="number"
          register={form.register('bulletin_nul', { valueAsNumber: true })}
          error={form.formState.errors.bulletin_nul}
        />
        <FormField
          label="Expressed Votes"
          id="suffrage_exprime"
          type="number"
          register={form.register('suffrage_exprime', { valueAsNumber: true })}
          error={form.formState.errors.suffrage_exprime}
        />
        <FormField
          label="Participation Rate (%)"
          id="taux_participation"
          type="number"
          register={form.register('taux_participation', { valueAsNumber: true })}
          error={form.formState.errors.taux_participation}
        />
        <FormField
          label="Valid Suffrages"
          id="nombre_suffrages_valable"
          type="number"
          register={form.register('nombre_suffrages_valable', { valueAsNumber: true })}
          error={form.formState.errors.nombre_suffrages_valable}
        />
        {/* Add new fields from Prisma schema */}
        <FormField
          label="Envelopes w/ Different Ballots"
          id="nombre_enveloppe_bulletins_differents"
          type="number"
          register={form.register('nombre_enveloppe_bulletins_differents', { valueAsNumber: true })}
          error={form.formState.errors.nombre_enveloppe_bulletins_differents}
        />
        <FormField
          label="Ballots w/ Identifiable Voters"
          id="nombre_bulletin_electeur_identifiable"
          type="number"
          register={form.register('nombre_bulletin_electeur_identifiable', { valueAsNumber: true })}
          error={form.formState.errors.nombre_bulletin_electeur_identifiable}
        />
        <FormField
          label="Signed Envelopes"
          id="nombre_bulletin_enveloppes_signes"
          type="number"
          register={form.register('nombre_bulletin_enveloppes_signes', { valueAsNumber: true })}
          error={form.formState.errors.nombre_bulletin_enveloppes_signes}
        />
        <FormField
          label="Non-Elecam Envelopes"
          id="nombre_enveloppe_non_elecam"
          type="number"
          register={form.register('nombre_enveloppe_non_elecam', { valueAsNumber: true })}
          error={form.formState.errors.nombre_enveloppe_non_elecam}
        />
        <FormField
          label="Non-Elecam Ballots"
          id="nombre_bulletin_non_elecam"
          type="number"
          register={form.register('nombre_bulletin_non_elecam', { valueAsNumber: true })}
          error={form.formState.errors.nombre_bulletin_non_elecam}
        />
        <FormField
          label="Ballots w/o Envelopes"
          id="nombre_bulletin_sans_enveloppe"
          type="number"
          register={form.register('nombre_bulletin_sans_enveloppe', { valueAsNumber: true })}
          error={form.formState.errors.nombre_bulletin_sans_enveloppe}
        />
        <FormField
          label="Empty Envelopes"
          id="nombre_enveloppe_vide"
          type="number"
          register={form.register('nombre_enveloppe_vide', { valueAsNumber: true })}
          error={form.formState.errors.nombre_enveloppe_vide}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
      {participation && (
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={form.formState.isSubmitting}
          className="mt-4"
        >
          Delete
        </Button>
      )}
    </div>
  );
}