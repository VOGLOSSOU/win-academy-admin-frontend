'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const formationSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caracteres'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caracteres'),
  categoryId: z.string().min(1, 'Selectionner une categorie'),
  duration: z.number().min(1, 'La duree doit etre d au moins 1 heure'),
});

type FormationFormValues = z.infer<typeof formationSchema>;

interface Formation {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  duration: number;
  isPublished: boolean;
}

const mockFormations: Formation[] = [
  { id: '1', title: 'Developpement Web', description: 'Cours complet de developpement web', categoryId: '1', categoryName: 'Programmation', duration: 40, isPublished: true },
  { id: '2', title: 'Design UI/UX', description: 'Apprendre les principes du design UI/UX', categoryId: '2', categoryName: 'Design', duration: 30, isPublished: true },
  { id: '3', title: 'Marketing Digital', description: 'Maitriser le marketing digital', categoryId: '3', categoryName: 'Marketing', duration: 20, isPublished: false },
];

const categories = [
  { id: '1', name: 'Programmation' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Marketing' },
];

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>(mockFormations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      duration: 0,
    },
  });

  const filteredFormations = formations.filter((formation) =>
    formation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: FormationFormValues) => {
    const category = categories.find(c => c.id === data.categoryId);
    if (editingFormation) {
      setFormations((prev) =>
        prev.map((f) => f.id === editingFormation.id ? { ...f, ...data, categoryName: category?.name || '' } : f)
      );
      toast.success('Formation modifiee avec succes');
    } else {
      const newFormation: Formation = {
        id: Date.now().toString(),
        ...data,
        categoryName: category?.name || '',
        isPublished: false,
      };
      setFormations((prev) => [...prev, newFormation]);
      toast.success('Formation creee avec succes');
    }
    reset();
    setEditingFormation(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (formation: Formation) => {
    setEditingFormation(formation);
    setValue('title', formation.title);
    setValue('description', formation.description);
    setValue('categoryId', formation.categoryId);
    setValue('duration', formation.duration);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setFormations((prev) => prev.filter((f) => f.id !== id));
    toast.success('Formation supprimee avec succes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formations</h1>
          <p className="text-muted-foreground">Gerer les formations avec leurs modules et contenus</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingFormation(null); reset(); }}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFormation ? 'Modifier la formation' : 'Creer une formation'}</DialogTitle>
              <DialogDescription>
                {editingFormation ? 'Mettre a jour les informations de la formation' : 'Remplir les details pour creer une nouvelle formation'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categorie</Label>
                  <Select onValueChange={(value) => setValue('categoryId', value)} defaultValue={editingFormation?.categoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner une categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duree (heures)</Label>
                  <Input id="duration" type="number" {...register('duration', { valueAsNumber: true })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit">{editingFormation ? 'Modifier' : 'Creer'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher des formations..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Duree</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormations.map((formation) => (
                <TableRow key={formation.id}>
                  <TableCell className="font-medium">{formation.title}</TableCell>
                  <TableCell>{formation.categoryName}</TableCell>
                  <TableCell>{formation.duration}h</TableCell>
                  <TableCell>
                    <Badge variant={formation.isPublished ? 'default' : 'secondary'}>
                      {formation.isPublished ? 'Publie' : 'Brouillon'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Voir les modules</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(formation)}>Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(formation.id)} className="text-destructive">Supprimer</DropdownMenuItem>
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
