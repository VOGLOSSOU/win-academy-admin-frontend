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
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
});

type FormationFormValues = z.infer<typeof formationSchema>;

interface Formation {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  duration: number;
  maxStudents: number;
  isPublished: boolean;
}

const mockFormations: Formation[] = [
  { id: '1', title: 'Web Development', description: 'Complete web development course', categoryId: '1', categoryName: 'Programming', price: 299, duration: 40, maxStudents: 30, isPublished: true },
  { id: '2', title: 'UI/UX Design', description: 'Learn UI/UX design principles', categoryId: '2', categoryName: 'Design', price: 249, duration: 30, maxStudents: 25, isPublished: true },
  { id: '3', title: 'Digital Marketing', description: 'Master digital marketing', categoryId: '3', categoryName: 'Marketing', price: 199, duration: 20, maxStudents: 40, isPublished: false },
];

const categories = [
  { id: '1', name: 'Programming' },
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
      price: 0,
      duration: 0,
      maxStudents: 0,
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
      toast.success('Formation updated successfully');
    } else {
      const newFormation: Formation = {
        id: Date.now().toString(),
        ...data,
        categoryName: category?.name || '',
        isPublished: false,
      };
      setFormations((prev) => [...prev, newFormation]);
      toast.success('Formation created successfully');
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
    setValue('price', formation.price);
    setValue('duration', formation.duration);
    setValue('maxStudents', formation.maxStudents);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setFormations((prev) => prev.filter((f) => f.id !== id));
    toast.success('Formation deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formations</h1>
          <p className="text-muted-foreground">Manage formations with modules and contents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingFormation(null); reset(); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFormation ? 'Edit Formation' : 'Create Formation'}</DialogTitle>
              <DialogDescription>
                {editingFormation ? 'Update formation information' : 'Fill in the details to create a new formation'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
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
                  <Label htmlFor="categoryId">Category</Label>
                  <Select onValueChange={(value) => setValue('categoryId', value)} defaultValue={editingFormation?.categoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input id="duration" type="number" {...register('duration', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input id="maxStudents" type="number" {...register('maxStudents', { valueAsNumber: true })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingFormation ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search formations..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormations.map((formation) => (
                <TableRow key={formation.id}>
                  <TableCell className="font-medium">{formation.title}</TableCell>
                  <TableCell>{formation.categoryName}</TableCell>
                  <TableCell>${formation.price}</TableCell>
                  <TableCell>{formation.duration}h</TableCell>
                  <TableCell>
                    <Badge variant={formation.isPublished ? 'default' : 'secondary'}>
                      {formation.isPublished ? 'Published' : 'Draft'}
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
                        <DropdownMenuItem>View Modules</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(formation)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(formation.id)} className="text-destructive">Delete</DropdownMenuItem>
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
