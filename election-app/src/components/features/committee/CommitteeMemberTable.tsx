// components/features/committee/CommitteeMemberTable.tsx
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface CommitteeMemberTableProps {
  members: any[];
  onEdit: (member: any) => void;
  onDelete: (member: any) => void;
}

export function CommitteeMemberTable({ members, onEdit, onDelete }: CommitteeMemberTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nom',
      header: 'Name',
    },
    {
      accessorKey: 'fonction.libelle',
      header: 'Function',
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'est_membre_secretariat',
      header: 'Secretariat',
      cell: ({ row }) => (row.original.est_membre_secretariat ? 'Yes' : 'No'),
    },
  ];

  return <DataTable columns={columns} data={members} onEdit={onEdit} onDelete={onDelete} />;
}