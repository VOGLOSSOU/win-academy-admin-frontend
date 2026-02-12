'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Evaluation {
  id: string;
  title: string;
  formationTitle: string;
  duration: number;
  passingScore: number;
  questionsCount: number;
  isActive: boolean;
}

const mockEvaluations: Evaluation[] = [
  { id: '1', title: 'Web Dev Final Exam', formationTitle: 'Web Development', duration: 60, passingScore: 70, questionsCount: 20, isActive: true },
  { id: '2', title: 'UI/UX Quiz 1', formationTitle: 'UI/UX Design', duration: 30, passingScore: 60, questionsCount: 10, isActive: true },
  { id: '3', title: 'Marketing Assessment', formationTitle: 'Digital Marketing', duration: 45, passingScore: 65, questionsCount: 15, isActive: false },
];

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);

  const filteredEvaluations = evaluations.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== id));
    toast.success('Evaluation deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluations</h1>
          <p className="text-muted-foreground">Manage questions and answers for formations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" /> Add Evaluation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Evaluation</DialogTitle>
              <DialogDescription>Create a new evaluation with questions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Evaluation Title</Label>
                <Input placeholder="Enter title" />
              </div>
              <div className="space-y-2">
                <Label>Formation</Label>
                <Input placeholder="Select formation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input type="number" placeholder="70" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Questions</Label>
                <Textarea placeholder="Add your questions here (one per line)" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsDialogOpen(false); toast.success('Evaluation created'); }}>Create</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search evaluations..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.map((evalItem) => (
                <TableRow key={evalItem.id}>
                  <TableCell className="font-medium">{evalItem.title}</TableCell>
                  <TableCell>{evalItem.formationTitle}</TableCell>
                  <TableCell>{evalItem.duration}min</TableCell>
                  <TableCell>{evalItem.questionsCount}</TableCell>
                  <TableCell>
                    <Badge variant={evalItem.isActive ? 'default' : 'secondary'}>
                      {evalItem.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => setIsAddingQuestions(true)}>Manage Questions</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(evalItem)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(evalItem.id)} className="text-destructive">Delete</DropdownMenuItem>
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

function handleEdit(evalItem: Evaluation) {
  // Handle edit
}
