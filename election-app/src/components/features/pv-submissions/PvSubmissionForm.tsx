// components/features/pv-submissions/PvSubmissionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';

interface PvSubmissionFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  arrondissements: any[];
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
        id="code_arrondissement"
        type="select"
        options={arrondissements.map((arr) => ({ value: arr.code, label: arr.libelle }))}
        onChange={(value) => form.setValue('code_arrondissement', Number(value))}
        error={form.formState.errors.code_arrondissement}
      />
      <FormField
        label="PV URL"
        id="url_pv"
        register={form.register('url_pv')}
        error={form.formState.errors.url_pv}
      />
      <FormField
        label="File Hash"
        id="hash_file"
        register={form.register('hash_file')}
        error={form.formState.errors.hash_file}
      />
      <FormField
        label="Label"
        id="libelle"
        register={form.register('libelle')}
        error={form.formState.errors.libelle}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}