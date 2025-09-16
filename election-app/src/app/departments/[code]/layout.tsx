// app/departments/[code]/layout.tsx
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();

  if (!user) return <div>Unauthorized</div>;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Department {code}</h2>
        <nav className="space-y-2">
          <Link href={`/departments/${code}/committee`}>
            <Button variant="ghost" className="w-full justify-start">Committee Members</Button>
          </Link>
          <Link href={`/departments/${code}/arrondissement-submissions`}>
            <Button variant="ghost" className="w-full justify-start">Arrondissement Submissions</Button>
          </Link>
          <Link href={`/departments/${code}/participation`}>
            <Button variant="ghost" className="w-full justify-start">Participation Details</Button>
          </Link>
          <Link href={`/departments/${code}/results`}>
            <Button variant="ghost" className="w-full justify-start">Department Results</Button>
          </Link>
          <Link href={`/departments/${code}/candidate-redressements`}>
            <Button variant="ghost" className="w-full justify-start">Candidate Redressements</Button>
          </Link>
          <Link href={`/departments/${code}/bureau-redressements`}>
            <Button variant="ghost" className="w-full justify-start">Bureau Redressements</Button>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Card className="p-6">{children}</Card>
      </main>
    </div>
  );
}