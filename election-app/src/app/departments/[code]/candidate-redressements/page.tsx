// app/departments/[code]/candidate-redressements/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RedressementCandidatService } from '@/services/redressementCandidatService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedFormField } from '@/components/shared/EnhancedFormField';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, FileEdit } from 'lucide-react';
import { toast } from 'sonner';

const service = new RedressementCandidatService();

const redressementSchema = z.object({
  code_bureau_vote: z.number().min(1, 'Bureau vote is required'),
  code_parti: z.number().min(1, 'Party is required'),
  nombre_vote_initial: z.number().min(0, 'Initial votes must be at least 0'),
  nombre_vote_redresse: z.number().min(0, 'Redressed votes must be at least 0'),
  raison_redressement: z.string().optional(),
});

type RedressementFormData = z.infer<typeof redressementSchema>;

export default function CandidateRedressementsPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [redressements, setRedressements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<RedressementFormData>({
    resolver: zodResolver(redressementSchema),
    defaultValues: {
      nombre_vote_initial: 0,
      nombre_vote_redresse: 0,
      raison_redressement: '',
    }
  });

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, departmentCode]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const redData = await service.getRedressements(Number(departmentCode), user.id);
      setRedressements(redData);
    } catch (err: any) {
      setError(err.message);
      toast.error(t('common.error') || 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RedressementFormData) => {
    if (!user) return;
    try {
      await service.createRedressement(data, user.id, Number(departmentCode));
      await fetchData();
      setIsDialogOpen(false);
      form.reset();
      toast.success(t('redressements.created') || 'Redressement created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create redressement');
      console.error(err);
    }
  };

  const handleDelete = async (redressementCode: number) => {
    if (!user || !confirm(t('common.confirmDelete') || 'Are you sure you want to delete this item?')) return;
    
    try {
      await service.deleteRedressement(redressementCode, user.id, Number(departmentCode));
      await fetchData();
      toast.success(t('redressements.deleted') || 'Redressement deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete redressement');
    }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
  
  if (error) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('redressements.title') || 'Candidate Redressements'}
          description={t('redressements.description') || `Manage vote corrections for Department ${departmentCode}`}
          icon={FileEdit}
          breadcrumbs={[
            { label: t('navigation.departments'), href: '/departments' },
            { label: `${t('departments.department')} ${departmentCode}`, href: `/departments/${departmentCode}` },
            { label: t('redressements.title') || 'Redressements' },
          ]}
          actions={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>{t('redressements.add') || 'Add Redressement'}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('redressements.addNew') || 'Add New Redressement'}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EnhancedFormField
                      label={t('fields.bureauVote') || 'Voting Bureau'}
                      id="code_bureau_vote"
                      error={form.formState.errors.code_bureau_vote}
                      required
                      foreignKey={{
                        entityType: 'bureauVote',
                        value: form.watch('code_bureau_vote'),
                        onChange: (value) => form.setValue('code_bureau_vote', Number(value)),
                        departmentCode: Number(departmentCode)
                      }}
                      helpText={t('fields.bureauVote.help') || 'Select the voting bureau for this redressement'}
                    />
                    
                    <EnhancedFormField
                      label={t('fields.party') || 'Political Party'}
                      id="code_parti"
                      error={form.formState.errors.code_parti}
                      required
                      foreignKey={{
                        entityType: 'party',
                        value: form.watch('code_parti'),
                        onChange: (value) => form.setValue('code_parti', Number(value))
                      }}
                      helpText={t('fields.party.help') || 'Select the political party'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EnhancedFormField
                      label={t('fields.initialVotes') || 'Initial Votes'}
                      id="nombre_vote_initial"
                      type="number"
                      register={form.register('nombre_vote_initial', { valueAsNumber: true })}
                      error={form.formState.errors.nombre_vote_initial}
                      required
                      helpText={t('fields.initialVotes.help') || 'Original number of votes before correction'}
                    />
                    
                    <EnhancedFormField
                      label={t('fields.redressedVotes') || 'Redressed Votes'}
                      id="nombre_vote_redresse"
                      type="number"
                      register={form.register('nombre_vote_redresse', { valueAsNumber: true })}
                      error={form.formState.errors.nombre_vote_redresse}
                      required
                      helpText={t('fields.redressedVotes.help') || 'Corrected number of votes'}
                    />
                  </div>
                  
                  <EnhancedFormField
                    label={t('fields.reason') || 'Reason for Redressement'}
                    id="raison_redressement"
                    register={form.register('raison_redressement')}
                    error={form.formState.errors.raison_redressement}
                    placeholder={t('fields.reason.placeholder') || 'Explain the reason for this correction...'}
                    helpText={t('fields.reason.help') || 'Provide a detailed explanation for the vote correction'}
                  />
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {form.formState.isSubmitting 
                        ? t('common.saving') || 'Saving...' 
                        : t('common.save')
                      }
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>{t('table.bureau') || 'Bureau'}</TableHead>
                <TableHead>{t('table.party') || 'Party'}</TableHead>
                <TableHead>{t('table.initialVotes') || 'Initial Votes'}</TableHead>
                <TableHead>{t('table.redressedVotes') || 'Redressed Votes'}</TableHead>
                <TableHead>{t('table.difference') || 'Difference'}</TableHead>
                <TableHead>{t('table.reason') || 'Reason'}</TableHead>
                <TableHead>{t('table.date') || 'Date'}</TableHead>
                <TableHead className="text-center">{t('table.actions') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redressements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {t('redressements.noData') || 'No redressements found for this department'}
                  </TableCell>
                </TableRow>
              ) : (
                redressements.map((red) => (
                  <TableRow key={red.code} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {red.bureauVote?.designation || `Bureau ${red.code_bureau_vote}`}
                    </TableCell>
                    <TableCell>
                      {red.parti?.designation || `Party ${red.code_parti}`}
                    </TableCell>
                    <TableCell>{red.nombre_vote_initial}</TableCell>
                    <TableCell>{red.nombre_vote_redresse}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        red.nombre_vote_redresse > red.nombre_vote_initial 
                          ? 'text-green-600' 
                          : red.nombre_vote_redresse < red.nombre_vote_initial 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`}>
                        {red.nombre_vote_redresse > red.nombre_vote_initial ? '+' : ''}
                        {red.nombre_vote_redresse - red.nombre_vote_initial}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {red.raison_redressement || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(red.date_redressement).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/* Edit functionality */}}
                          className="p-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(red.code)}
                          className="p-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}