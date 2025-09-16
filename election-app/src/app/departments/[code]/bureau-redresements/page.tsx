// app/departments/[code]/bureau-redressements/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RedressementBureauService } from '@/services/redressementBureauService';
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

const service = new RedressementBureauService();

const redressementSchema = z.object({
  code_bureau_vote: z.number(),
  nombre_inscrit_initial: z.number().optional(),
  nombre_inscrit_redresse: z.number().optional(),
  // Add all fields...
  raison_redressement: z.string().optional(),
});

export default function BureauRedressementsPage() {
  const { code: departmentCode } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [redressements, setRedressements] = useState<any[]>([]);
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof redressementSchema>>({
    resolver: zodResolver(redressementSchema),
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [redData, burData] = await Promise.all([
          service.getRedressements(Number(departmentCode), user.id),
          service.getBureauVotes(Number(departmentCode)),
        ]);
        setRedressements(redData);
        setBureaus(burData);
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
      <h1 className="text-2xl font-bold mb-4">Bureau Redressements</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Redressement</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Bureau Redressement</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="nombre_inscrit_initial">Initial Registered</Label>
              <Input type="number" id="nombre_inscrit_initial" {...form.register('nombre_inscrit_initial', { valueAsNumber: true })} />
            </div>
            {/* Add all other fields: nombre_votant_initial, taux_participation_initial, etc. Use Textarea for erreurs_materielles, raison */}
            <div className="col-span-2">
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
            <TableHead>Initial Registered</TableHead>
            <TableHead>Redressed Registered</TableHead>
            {/* Add headers for all fields */}
            <TableHead>Reason</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redressements.map((red) => (
            <TableRow key={red.code}>
              <TableCell>{red.bureauVote.designation}</TableCell>
              <TableCell>{red.nombre_inscrit_initial}</TableCell>
              <TableCell>{red.nombre_inscrit_redresse}</TableCell>
              {/* Add cells */}
              <TableCell>{red.raison_redressement}</TableCell>
              <TableCell>{red.date_redressement}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => {/* Edit with large form */}}>Edit</Button>
                <Button variant="destructive" onClick={() => service.deleteRedressement(red.code, user!.id, Number(departmentCode))}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}