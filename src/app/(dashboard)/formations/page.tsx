'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React from 'react';
import { Plus, Search, MoreHorizontal, ChevronDown, ChevronRight, Layers, FileVideo, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useFormations, useCreateFormation, useDeleteFormation,
  useModules, useCreateModule, useDeleteModule,
  useCreateContent, useDeleteContent,
} from '@/hooks';
import { useCategories } from '@/hooks';
import { ApiFormation, ApiModule, ContentType, FormationLevel } from '@/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const formationSchema = z.object({
  title: z.string().min(2, 'Au moins 2 caractères'),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  level: z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE']).optional(),
  duration: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  categoryId: z.string().optional(),
});

const moduleSchema = z.object({
  title: z.string().min(2, 'Au moins 2 caractères'),
  description: z.string().optional(),
  order: z.number().min(1),
});

const contentSchema = z.object({
  type: z.enum(['VIDEO', 'PDF', 'TEXT', 'IMAGE']),
  title: z.string().min(2, 'Au moins 2 caractères'),
  url: z.string().optional(),
  body: z.string().optional(),
  order: z.number().min(1),
});

type FormationFormValues = z.infer<typeof formationSchema>;
type ModuleFormValues = z.infer<typeof moduleSchema>;
type ContentFormValues = z.infer<typeof contentSchema>;

const LEVEL_LABELS: Record<FormationLevel, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

const CONTENT_ICONS: Record<ContentType, typeof FileVideo> = {
  VIDEO: FileVideo,
  PDF: File,
  TEXT: FileText,
  IMAGE: ImageIcon,
};

// ─── Sous-composant : Modules d'une formation ─────────────────────────────────
function FormationModules({ formation }: { formation: ApiFormation }) {
  const { data: modules = [], isLoading } = useModules(formation.id);
  const createModule = useCreateModule();
  const deleteModule = useDeleteModule();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  const [moduleDialog, setModuleDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<string | null>(null); // moduleId

  const { register: regMod, handleSubmit: handleMod, reset: resetMod, formState: { errors: errMod } } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { order: (modules.length ?? 0) + 1 },
  });

  const { register: regCont, handleSubmit: handleCont, reset: resetCont, setValue: setContVal, watch: watchCont, formState: { errors: errCont } } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: { type: 'VIDEO', order: 1 },
  });

  const contentType = watchCont('type');

  const onSubmitModule = async (data: ModuleFormValues) => {
    try {
      await createModule.mutateAsync({ ...data, formationId: formation.id });
      toast.success('Module créé');
      setModuleDialog(false);
      resetMod();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const onSubmitContent = async (data: ContentFormValues) => {
    if (!contentDialog) return;
    try {
      const { body: textBody, ...rest } = data;
      await createContent.mutateAsync({ ...rest, textBody, moduleId: contentDialog, formationId: formation.id });
      toast.success('Contenu ajouté');
      setContentDialog(null);
      resetCont();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (isLoading) return <div className="p-4"><Skeleton className="h-20 w-full" /></div>;

  return (
    <div className="border-t bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {modules.length} module(s)
        </p>
        <Button size="sm" variant="outline" onClick={() => { resetMod({ order: modules.length + 1 }); setModuleDialog(true); }}>
          <Plus className="h-3 w-3 mr-1" /> Module
        </Button>
      </div>

      {modules.map((mod) => (
        <div key={mod.id} className="rounded-md border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {mod.order}. {mod.title}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { resetCont({ type: 'VIDEO', order: (mod.contents?.length ?? 0) + 1 }); setContentDialog(mod.id); }}>
                <Plus className="h-3 w-3 mr-1" /> Contenu
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                try {
                  await deleteModule.mutateAsync({ id: mod.id, formationId: formation.id });
                  toast.success('Module supprimé');
                } catch (err) { toast.error(err instanceof Error ? err.message : 'Erreur'); }
              }}>
                Supprimer
              </Button>
            </div>
          </div>

          {(mod.contents ?? []).map((content) => {
            const Icon = CONTENT_ICONS[content.type];
            return (
              <div key={content.id} className="flex items-center justify-between pl-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{content.order}. {content.title}</span>
                  <Badge variant="outline" className="text-xs">{content.type}</Badge>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive h-6 text-xs" onClick={async () => {
                  try {
                    await deleteContent.mutateAsync({ id: content.id, formationId: formation.id });
                    toast.success('Contenu supprimé');
                  } catch (err) { toast.error(err instanceof Error ? err.message : 'Erreur'); }
                }}>
                  Supprimer
                </Button>
              </div>
            );
          })}
        </div>
      ))}

      {/* Dialog ajout module */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un module</DialogTitle>
            <DialogDescription>Nouveau chapitre pour « {formation.title} »</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMod(onSubmitModule)} className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input {...regMod('title')} />
              {errMod.title && <p className="text-sm text-destructive">{errMod.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...regMod('description')} />
            </div>
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input type="number" {...regMod('order', { valueAsNumber: true })} />
              {errMod.order && <p className="text-sm text-destructive">{errMod.order.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModuleDialog(false)}>Annuler</Button>
              <Button type="submit" disabled={createModule.isPending}>
                {createModule.isPending ? 'Enregistrement…' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog ajout contenu */}
      <Dialog open={!!contentDialog} onOpenChange={(o) => { if (!o) setContentDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un contenu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCont(onSubmitContent)} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select onValueChange={(v) => setContVal('type', v as ContentType)} defaultValue="VIDEO">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Vidéo</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="TEXT">Texte</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input {...regCont('title')} />
              {errCont.title && <p className="text-sm text-destructive">{errCont.title.message}</p>}
            </div>
            {contentType !== 'TEXT' && (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input {...regCont('url')} placeholder="https://…" />
              </div>
            )}
            {contentType === 'TEXT' && (
              <div className="space-y-2">
                <Label>Contenu texte</Label>
                <Textarea {...regCont('body')} rows={4} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input type="number" {...regCont('order', { valueAsNumber: true })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContentDialog(null)}>Annuler</Button>
              <Button type="submit" disabled={createContent.isPending}>
                {createContent.isPending ? 'Enregistrement…' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function FormationsPage() {
  const { data, isLoading } = useFormations();
  const { data: categoriesData } = useCategories();
  const createFormation = useCreateFormation();
  const deleteFormation = useDeleteFormation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
  });

  const formations = data?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const filtered = formations.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: FormationFormValues) => {
    try {
      await createFormation.mutateAsync(data);
      toast.success('Formation créée');
      setIsDialogOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFormation.mutateAsync(id);
      toast.success('Formation supprimée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formations</h1>
          <p className="text-muted-foreground">Gérer les formations, modules et contenus</p>
        </div>
        <Button onClick={() => { reset(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une formation
        </Button>
      </div>

      {/* Dialog création formation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une formation</DialogTitle>
            <DialogDescription>Remplir les détails de la nouvelle formation</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description courte</Label>
              <Input {...register('shortDescription')} />
            </div>
            <div className="space-y-2">
              <Label>Description complète</Label>
              <Textarea {...register('fullDescription')} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select onValueChange={(v) => setValue('level', v as FormationLevel)}>
                  <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBUTANT">Débutant</SelectItem>
                    <SelectItem value="INTERMEDIAIRE">Intermédiaire</SelectItem>
                    <SelectItem value="AVANCE">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (min)</Label>
                <Input type="number" {...register('duration', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Prix (FCFA) — laisser vide ou 0 pour gratuit</Label>
                <Input type="number" min={0} {...register('price', { valueAsNumber: true })} placeholder="0" />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createFormation.isPending}>
                {createFormation.isPending ? 'Enregistrement…' : 'Créer'}
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
              placeholder="Rechercher des formations…"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Inscrits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Aucune formation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((formation) => (
                    <React.Fragment key={formation.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpanded(expanded === formation.id ? null : formation.id)}
                      >
                        <TableCell>
                          {expanded === formation.id
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="font-medium">{formation.title}</TableCell>
                        <TableCell>{formation.category?.name ?? '—'}</TableCell>
                        <TableCell>
                          {formation.level ? (
                            <Badge variant="outline">{LEVEL_LABELS[formation.level]}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{formation.duration ? `${formation.duration} min` : '—'}</TableCell>
                        <TableCell>
                          {formation.price === undefined ? '—' : formation.price === 0 ? (
                            <Badge variant="secondary">Gratuit</Badge>
                          ) : (
                            `${formation.price.toLocaleString('fr-FR')} FCFA`
                          )}
                        </TableCell>
                        <TableCell>{formation._count?.enrollments ?? 0}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setExpanded(formation.id)}>
                                <Layers className="mr-2 h-4 w-4" /> Voir les modules
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(formation.id)}
                                className="text-destructive"
                                disabled={deleteFormation.isPending || (formation._count?.enrollments ?? 0) > 0}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {expanded === formation.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <FormationModules formation={formation} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
