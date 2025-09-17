// components/features/pv-submissions/PvSubmissionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { CreatePvDTO, Arrondissement } from '@/types/pv';

interface PvSubmissionFormProps {
  onSubmit: (data: CreatePvDTO) => void;
  defaultValues?: Partial<CreatePvDTO>;
  arrondissements: Arrondissement[];
}

const pvSchema = z.object({
  code_arrondissement: z.number(),
  url_pv: z.string().optional(),
  hash_file: z.string().optional(),
  libelle: z.string().optional(),
});

export function PvSubmissionForm({ onSubmit, defaultValues, arrondissements }: PvSubmissionFormProps) {
  const form = useForm<z.infer<typeof pvSchema>>({
    resolver: zodResolver(pvSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Arrondissement"
            name="code_arrondissement"
            type="select"
            options={arrondissements.map((arr) => ({ value: arr.code, label: arr.libelle }))}
            onChange={(value) => form.setValue('code_arrondissement', Number(value))}
            error={form.formState.errors.code_arrondissement?.message}
          />
              <FormField
                label="PV URL"
                name="url_pv"
                error={form.formState.errors.url_pv?.message}
              />
              <FormField
                label="File Hash"
                name="hash_file"
                error={form.formState.errors.hash_file?.message}
              />
              <FormField
                label="Label"
                name="libelle"
                error={form.formState.errors.libelle?.message}
              />
              <Button type="submit">Submit</Button>
        </form>
      );
}