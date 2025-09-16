// app/departments/[code]/results/page.tsx
import { useAuth } from '@/contexts/AuthContext';
import { ResultatService } from '@/services/resultatService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const service = new ResultatService();

const resultSchema = z.object({
  code_parti: z.number(),
  nombre_vote: z.number().min(0),
  pourcentage: z.number().optional(),
});

export default function ResultsPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof resultSchema>>({
    resolver: zodResolver(resultSchema),
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [resData, partyData] = await Promise.all([
          service.getResults(Number(departmentCode), user.id),
          service.getParties(),
        ]);
        setResults(resData);
        setParties(partyData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, departmentCode]);

  const onSubmit = async (data: z.infer<typeof resultSchema>) => {
    if (!user) return;
    try {
      await service.createResult(data, user.id, Number(departmentCode));
      const updated = await service.getResults(Number(departmentCode), user.id);
      setResults(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Department Results</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Result</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Result</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code_parti">Party</Label>
              <Select onValueChange={(value) => form.setValue('code_parti', Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select party" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party.code} value={party.code.toString()}>{party.designation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nombre_vote">Votes</Label>
              <Input type="number" id="nombre_vote" {...form.register('nombre_vote', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="pourcentage">Percentage</Label>
              <Input type="number" id="pourcentage" {...form.register('pourcentage', { valueAsNumber: true })} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Party</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.code}>
              <TableCell>{result.parti.designation}</TableCell>
              <TableCell>{result.nombre_vote}</TableCell>
              <TableCell>{result.pourcentage}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => {/* Edit */}}>Edit</Button>
                <Button variant="destructive" onClick={() => service.deleteResult(result.code, user!.id, Number(departmentCode))}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}