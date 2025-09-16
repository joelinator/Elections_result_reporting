// app/departments/[code]/candidate-redressements/page.tsx
import { useAuth } from '@/contexts/AuthContext';
import { RedressementCandidatService } from '@/services/redressementCandidatService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const service = new RedressementCandidatService();

const redressementSchema = z.object({
  code_bureau_vote: z.number(),
  code_parti: z.number(),
  nombre_vote_initial: z.number().min(0),
  nombre_vote_redresse: z.number().min(0),
  raison_redressement: z.string().optional(),
});

export default function CandidateRedressementsPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [redressements, setRedressements] = useState<any[]>([]);
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof redressementSchema>>({
    resolver: zodResolver(redressementSchema),
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [redData, burData, parData] = await Promise.all([
          service.getRedressements(Number(departmentCode), user.id),
          service.getBureauVotes(Number(departmentCode)),
          service.getParties(),
        ]);
        setRedressements(redData);
        setBureaus(burData);
        setParties(parData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, departmentCode]);

  const onSubmit = async (data: z.infer<typeof redressementSchema>) => {
    if (!user) return;
    try {
      await service.createRedressement(data, user.id, Number(departmentCode));
      const updated = await service.getRedressements(Number(departmentCode), user.id);
      setRedressements(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Candidate Redressements</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Redressement</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Redressement</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code_bureau_vote">Bureau Vote</Label>
              <Select onValueChange={(value) => form.setValue('code_bureau_vote', Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bureau" />
                </SelectTrigger>
                <SelectContent>
                  {bureaus.map((bur) => (
                    <SelectItem key={bur.code} value={bur.code.toString()}>{bur.designation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="nombre_vote_initial">Initial Votes</Label>
              <Input type="number" id="nombre_vote_initial" {...form.register('nombre_vote_initial', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="nombre_vote_redresse">Redressed Votes</Label>
              <Input type="number" id="nombre_vote_redresse" {...form.register('nombre_vote_redresse', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="raison_redressement">Reason</Label>
              <Textarea id="raison_redressement" {...form.register('raison_redressement')} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bureau</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Initial Votes</TableHead>
            <TableHead>Redressed Votes</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redressements.map((red) => (
            <TableRow key={red.code}>
              <TableCell>{red.bureauVote.designation}</TableCell>
              <TableCell>{red.parti.designation}</TableCell>
              <TableCell>{red.nombre_vote_initial}</TableCell>
              <TableCell>{red.nombre_vote_redresse}</TableCell>
              <TableCell>{red.raison_redressement}</TableCell>
              <TableCell>{red.date_redressement}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => {/* Edit */}}>Edit</Button>
                <Button variant="destructive" onClick={() => service.deleteRedressement(red.code, user!.id, Number(departmentCode))}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}