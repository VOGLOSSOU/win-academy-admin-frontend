'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  useEvaluations, useEvaluation, useCreateEvaluation,
  useCreateQuestion, useUpdateQuestion, useDeleteQuestion,
} from '@/hooks';
import { useFormations } from '@/hooks/use-formations';
import { ApiEvaluation } from '@/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const evalSchema = z.object({
  formationId: z.string().min(1, 'Sélectionner une formation'),
  passingScore: z.number().min(0).max(100),
  maxAttempts: z.number().optional(),
  timeLimit: z.number().optional(),
});

const questionSchema = z.object({
  questionText: z.string().min(5, 'Au moins 5 caractères'),
  answers: z.array(z.object({
    answerText: z.string().min(1, 'Requis'),
    isCorrect: z.boolean(),
  })).min(2, 'Au moins 2 réponses').refine(
    (answers) => answers.some((a) => a.isCorrect),
    { message: 'Au moins une réponse correcte' }
  ),
});

type EvalFormValues = z.infer<typeof evalSchema>;
type QuestionFormValues = z.infer<typeof questionSchema>;

// ─── Sous-composant : Détail d'une évaluation ─────────────────────────────────
function EvaluationDetail({ evalId, evaluation }: { evalId: string; evaluation: ApiEvaluation }) {
  const { data: freshEval, isLoading } = useEvaluation(evalId);
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [questionDialog, setQuestionDialog] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: '',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'answers' });

  const openAddQuestion = () => {
    reset({
      questionText: '',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
      ],
    });
    setQuestionDialog(true);
  };

  const onSubmitQuestion = async (data: QuestionFormValues) => {
    try {
      await createQuestion.mutateAsync({ evaluationId: evalId, ...data });
      toast.success('Question ajoutée');
      setQuestionDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  // Use freshEval when available, fall back to list data
  const evalData = freshEval ?? evaluation;
  const questions = evalData.questions ?? [];

  return (
    <div className="border-t bg-muted/30 p-4 space-y-3">
      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
        <div className="text-center">
          <p className="text-muted-foreground">Score de passage</p>
          <p className="font-bold text-lg">{evalData.passingScore}%</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Tentatives max</p>
          <p className="font-bold text-lg">{evalData.maxAttempts ?? '∞'}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Durée limite</p>
          <p className="font-bold text-lg">{evalData.timeLimit ? `${evalData.timeLimit} min` : '—'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {isLoading ? '…' : questions.length} question(s)
        </p>
        <Button size="sm" variant="outline" onClick={openAddQuestion}>
          <Plus className="h-3 w-3 mr-1" /> Question
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        questions.map((q, qIdx) => (
          <div key={q.id} className="rounded-md border bg-background p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{qIdx + 1}. {q.questionText}</p>
              <Button
                size="sm" variant="ghost" className="text-destructive shrink-0"
                onClick={async () => {
                  try {
                    await deleteQuestion.mutateAsync({ id: q.id, evaluationId: evalId });
                    toast.success('Question supprimée');
                  } catch (err) { toast.error(err instanceof Error ? err.message : 'Erreur'); }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="pl-3 space-y-1">
              {(q.answers ?? []).map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-sm">
                  <span className={a.isCorrect ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {a.isCorrect ? '✓' : '○'} {a.answerText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Dialog ajout question */}
      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une question</DialogTitle>
            <DialogDescription>Au moins une réponse doit être correcte</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input {...register('questionText')} placeholder="Quelle est la question ?" />
              {errors.questionText && (
                <p className="text-sm text-destructive">{errors.questionText.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Réponses</Label>
                <Button type="button" size="sm" variant="ghost"
                  onClick={() => append({ answerText: '', isCorrect: false })}>
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`answers.${index}.isCorrect`}
                    render={({ field: f }) => (
                      <Checkbox
                        checked={f.value}
                        onCheckedChange={f.onChange}
                      />
                    )}
                  />
                  <Input
                    {...register(`answers.${index}.answerText`)}
                    placeholder={`Réponse ${index + 1}`}
                    className="flex-1"
                  />
                  {fields.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.answers && (
                <p className="text-sm text-destructive">
                  {typeof errors.answers.message === 'string' ? errors.answers.message : 'Vérifiez les réponses'}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQuestionDialog(false)}>Annuler</Button>
              <Button type="submit" disabled={createQuestion.isPending}>
                {createQuestion.isPending ? 'Enregistrement…' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function EvaluationsPage() {
  const { data: evaluationsData, isLoading: loadingEvals } = useEvaluations(1, 100);
  const { data: formationsData, isLoading: loadingFormations } = useFormations(1, 200);
  const createEvaluation = useCreateEvaluation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EvalFormValues>({
    resolver: zodResolver(evalSchema),
    defaultValues: { passingScore: 70 },
  });

  const evaluations = evaluationsData?.data ?? [];
  const formations = formationsData?.data ?? [];

  // Formations that don't already have an evaluation
  const evaluatedFormationIds = new Set(evaluations.map((e) => e.formationId));
  const formationsWithoutEval = formations.filter((f) => !evaluatedFormationIds.has(f.id));

  const filtered = evaluations.filter((e) =>
    (e.formation?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: EvalFormValues) => {
    try {
      await createEvaluation.mutateAsync(data);
      toast.success('Évaluation créée');
      setIsDialogOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const isLoading = loadingEvals || loadingFormations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Évaluations</h1>
          <p className="text-muted-foreground">Gérer les quiz et questions par formation</p>
        </div>
        <Button onClick={() => { reset({ passingScore: 70 }); setIsDialogOpen(true); }}
          disabled={isLoading || formationsWithoutEval.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Créer une évaluation
        </Button>
      </div>

      {/* Dialog création évaluation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une évaluation</DialogTitle>
            <DialogDescription>Associer une évaluation à une formation (1 seule par formation)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Formation</Label>
              <Select onValueChange={(v) => setValue('formationId', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une formation" /></SelectTrigger>
                <SelectContent>
                  {formationsWithoutEval.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.formationId && <p className="text-sm text-destructive">{errors.formationId.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Score de passage (%)</Label>
                <Input type="number" {...register('passingScore', { valueAsNumber: true })} />
                {errors.passingScore && <p className="text-sm text-destructive">{errors.passingScore.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tentatives max</Label>
                <Input type="number" {...register('maxAttempts', { valueAsNumber: true })} placeholder="∞" />
              </div>
              <div className="space-y-2">
                <Label>Durée (min)</Label>
                <Input type="number" {...register('timeLimit', { valueAsNumber: true })} placeholder="—" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createEvaluation.isPending}>
                {createEvaluation.isPending ? 'Enregistrement…' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par formation…"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingEvals ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Formation</TableHead>
                  <TableHead>Score de passage</TableHead>
                  <TableHead>Tentatives</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Questions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune évaluation — cliquez sur &quot;Créer une évaluation&quot;
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((evaluation) => {
                    const isOpen = expanded === evaluation.id;
                    return (
                      <React.Fragment key={evaluation.id}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => setExpanded(isOpen ? null : evaluation.id)}
                        >
                          <TableCell>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium">{evaluation.formation?.title ?? evaluation.formationId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{evaluation.passingScore}%</Badge>
                          </TableCell>
                          <TableCell>{evaluation.maxAttempts ?? '∞'}</TableCell>
                          <TableCell>{evaluation.timeLimit ? `${evaluation.timeLimit} min` : '—'}</TableCell>
                          <TableCell>{(evaluation.questions ?? []).length}</TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow>
                            <TableCell colSpan={6} className="p-0">
                              <EvaluationDetail evalId={evaluation.id} evaluation={evaluation} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
