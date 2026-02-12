'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const communeSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  departmentId: z.string().min(1, 'Selectionner un departement'),
});

type CommuneFormValues = z.infer<typeof communeSchema>;

interface Commune {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  isActive: boolean;
}

const mockCommunes: Commune[] = [
  { id: '1', name: 'Cotonou', departmentId: '1', departmentName: 'Littoral', isActive: true },
  { id: '2', name: 'Porto-Novo', departmentId: '2', departmentName: 'Oueme', isActive: true },
  { id: '3', name: 'Parakou', departmentId: '3', departmentName: 'Borgou', isActive: false },
];

const departments = [
  { id: '1', name: 'Littoral' },
  { id: '2', name: 'Oueme' },
  { id: '3', name: 'Borgou' },
];

export default function CommunesPage() {
  const [communes, setCommunes] = useState<Commune[]>(mockCommunes);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommune, setEditingCommune] = useState<Commune | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CommuneFormValues>({
    resolver: zodResolver(communeSchema),
  });

  const filteredCommunes = communes.filter((commune) =>
    commune.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: CommuneFormValues) => {
    const dept = departments.find(d => d.id === data.departmentId);
    if (editingCommune) {
      setCommunes((prev) =>
        prev.map((c) => c.id === editingCommune.id ? { ...c, ...data, departmentName: dept?.name || '' } : c)
      );
      toast.success('Commune modifiee avec succes');
    } else {
      const newCommune: Commune = {
        id: Date.now().toString(),
        ...data,
        departmentName: dept?.name || '',
        isActive: true,
      };
      setCommunes((prev) => [...prev, newCommune]);
      toast.success('Commune creee avec succes');
    }
    reset();
    setEditingCommune(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (commune: Commune) => {
    setEditingCommune(commune);
    setValue('name', commune.name);
    setValue('departmentId', commune.departmentId);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCommunes((prev) => prev.filter((c) => c.id !== id));
    toast.success('Commune supprimee avec succes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communes</h1>
          <p className="text-muted-foreground">Gerer les communes et leurs departements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCommune(null); reset(); }}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une commune
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCommune ? 'Modifier la commune' : 'Creer une commune'}</DialogTitle>
              <DialogDescription>
                {editingCommune ? 'Mettre a jour les informations de la commune' : 'Remplir les details'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departement</Label>
                <Select onValueChange={(value) => setValue('departmentId', value)} defaultValue={editingCommune?.departmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un departement" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-sm text-destructive">{errors.departmentId.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit">{editingCommune ? 'Modifier' : 'Creer'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher des communes..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Departement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommunes.map((commune) => (
                <TableRow key={commune.id}>
                  <TableCell className="font-medium">{commune.name}</TableCell>
                  <TableCell>{commune.departmentName}</TableCell>
                  <TableCell>
                    <Badge variant={commune.isActive ? 'default' : 'secondary'}>
                      {commune.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(commune)}>Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(commune.id)} className="text-destructive">Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
