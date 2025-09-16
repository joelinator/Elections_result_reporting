// src/components/features/committee/CommitteeMemberForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CommitteeMemberFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  functions: any[];
}

const memberSchema = z.object({
  nom: z.string().min(1, 'Name required'),
  code_fonction: z.number(),
  contact: z.string().optional(),
  email: z.string().email().optional(),
  est_membre_secretariat: z.boolean().optional(),
});

export function CommitteeMemberForm({ onSubmit, defaultValues, functions }: CommitteeMemberFormProps) {
  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: defaultValues || { est_membre_secretariat: false },
  });

  const handleSubmit = async (data: z.infer<typeof memberSchema>) => {
    try {
      await onSubmit(data);
      toast.success('Member saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save member');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormField
        label="Name"
        id="nom"
        register={form.register('nom')}
        error={form.formState.errors.nom}
      />
      <FormField
        label="Function"
        id="code_fonction"
        type="select"
        options={functions.map((f) => ({ value: f.code, label: f.libelle }))}
        onSelectChange={(value) => form.setValue('code_fonction', Number(value))}
        error={form.formState.errors.code_fonction}
      />
      <FormField
        label="Contact"
        id="contact"
        register={form.register('contact')}
        error={form.formState.errors.contact}
      />
      <FormField
        label="Email"
        id="email"
        register={form.register('email')}
        error={form.formState.errors.email}
      />
      <div className="flex items-center space-x-2">
        <Checkbox
          id="est_membre_secretariat"
          {...form.register('est_membre_secretariat')}
          checked={form.watch('est_membre_secretariat')}
          onCheckedChange={(checked: boolean) => form.setValue('est_membre_secretariat', checked)}
        />
        <Label htmlFor="est_membre_secretariat">Secretariat Member</Label>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}