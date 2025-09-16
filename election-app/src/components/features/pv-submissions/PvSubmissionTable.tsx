// components/features/pv-submissions/PvSubmissionTable.tsx
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { PvArrondissement } from '@/types/pv';

interface PvSubmissionTableProps {
  pvs: PvArrondissement[];
  onEdit: (pv: PvArrondissement) => void;
  onDelete: (pv: PvArrondissement) => void;
}

export function PvSubmissionTable({ pvs, onEdit, onDelete }: PvSubmissionTableProps) {
  const columns: ColumnDef<PvArrondissement>[] = [
    {
      accessorKey: 'arrondissement.libelle',
      header: 'Arrondissement',
    },
    {
      accessorKey: 'url_pv',
      header: 'PV URL',
    },
    {
      accessorKey: 'hash_file',
      header: 'Hash',
    },
    {
      accessorKey: 'libelle',
      header: 'Label',
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
    },
  ];

  return <DataTable columns={columns} data={pvs} onEdit={onEdit} onDelete={onDelete} />;
}