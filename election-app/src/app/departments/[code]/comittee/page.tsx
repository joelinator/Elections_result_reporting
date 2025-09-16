// app/departments/[code]/comittee/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CommissionService } from '@/services/commissionService';
import { CommitteeMemberTable } from '@/components/features/committee/CommitteeMemberTable';
import { CommitteeMemberForm } from '@/components/features/committee/CommitteeMemberForm';
import { CrudDialog } from '@/components/shared/CrudDialog';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const service = new CommissionService();

export default function CommitteePage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [mems, funcs] = await Promise.all([
          service.getMembers(Number(departmentCode)),
          service.getFunctions(),
        ]);
        setMembers(mems);
        setFunctions(funcs);
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
      if (editingMember) {
        await CommissionService.updateMember(editingMember.code, data);
      } else {
        await CommissionService.createMember({ ...data, code_commission: Number(departmentCode) });
      }
      const updated = await service.getMembers(Number(departmentCode));
      setMembers(updated);
      setIsDialogOpen(false);
      setEditingMember(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = async (member: any) => {
    if (!user) return;
    try {
      await service.deleteMember(member.code);
      const updated = await service.getMembers(Number(departmentCode));
      setMembers(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Departmental Electoral Committee - Department {departmentCode}</h1>
      <CrudDialog
        title={editingMember ? 'Edit Member' : 'Add Member'}
        triggerText={editingMember ? 'Edit Member' : 'Add Member'}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
      >
        <CommitteeMemberForm
          onSubmit={handleSubmit}
          defaultValues={editingMember}
          functions={functions}
          commissionCode={Number(departmentCode)}
        />
      </CrudDialog>
      <CommitteeMemberTable
        members={members}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}