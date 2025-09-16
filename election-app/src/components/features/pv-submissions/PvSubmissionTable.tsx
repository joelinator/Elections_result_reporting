// components/features/pv-submissions/PvSubmissionTable.tsx
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface PvSubmissionTableProps {
  pvs: any[];
  onEdit: (pv: any) => void;
  onDelete: (pv: any) => void;
}

export function PvSubmissionTable({ pvs, onEdit, onDelete }: PvSubmissionTableProps) {
  const columns: ColumnDef<any>[] = [
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