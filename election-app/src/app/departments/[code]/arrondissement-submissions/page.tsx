// app/departments/[code]/arrondissement-submissions/page.tsx
import { useAuth } from '@/contexts/AuthContext';
import { PvArrondissementService } from '@/services/pvArrondissementService';
import { PvSubmissionTable } from '@/components/features/pv-submissions/PvSubmissionTable';
import { PvSubmissionForm } from '@/components/features/pv-submissions/PvSubmissionForm';
import { CrudDialog } from '@/components/shared/CrudDialog';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const service = new PvArrondissementService();

export default function ArrondissementSubmissionsPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [pvs, setPvs] = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPv, setEditingPv] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [pvData, arrData] = await Promise.all([
          service.getPvs(Number(departmentCode), user.id),
          service.getArrondissements(Number(departmentCode)),
        ]);
        setPvs(pvData);
        setArrondissements(arrData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, departmentCode]);

  const handleSubmit = async (data: any) => {
    if (!user) return;
    try {
      if (editingPv) {
        await service.updatePv(editingPv.code, data, user.id, Number(departmentCode));
      } else {
        await service.createPv(data, user.id, Number(departmentCode));
      }
      const updated = await service.getPvs(Number(departmentCode), user.id);
      setPvs(updated);
      setIsDialogOpen(false);
      setEditingPv(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (pv: any) => {
    setEditingPv(pv);
    setIsDialogOpen(true);
  };

  const handleDelete = async (pv: any) => {
    if (!user) return;
    try {
      await service.deletePv(pv.code, user.id, Number(departmentCode));
      const updated = await service.getPvs(Number(departmentCode), user.id);
      setPvs(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Arrondissement Submissions</h1>
      <CrudDialog
        title={editingPv ? 'Edit Submission' : 'Add Submission'}
        triggerText={editingPv ? 'Edit Submission' : 'Add Submission'}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
      >
        <PvSubmissionForm
          onSubmit={handleSubmit}
          defaultValues={editingPv}
          arrondissements={arrondissements}
        />
      </CrudDialog>
      <PvSubmissionTable
        pvs={pvs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}