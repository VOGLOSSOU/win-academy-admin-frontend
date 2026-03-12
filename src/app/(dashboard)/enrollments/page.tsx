'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EnrollmentStatus } from '@/types';
import { useEnrollments } from '@/hooks';

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
};

const STATUS_COLOR: Record<EnrollmentStatus, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function EnrollmentsPage() {
  const { data, isLoading } = useEnrollments(1, 100);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const enrollments = data?.data ?? [];

  const filtered = enrollments.filter((e) => {
    const userName = `${e.user?.firstName ?? ''} ${e.user?.lastName ?? ''}`.toLowerCase();
    const formationTitle = (e.formation?.title ?? '').toLowerCase();
    const matchesSearch = userName.includes(searchQuery.toLowerCase()) || formationTitle.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inscriptions</h1>
          <p className="text-muted-foreground">Suivi des inscriptions aux formations</p>
        </div>
        {data && (
          <Badge variant="outline" className="text-base px-3 py-1">
            {data.meta.total} inscription(s)
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par apprenant ou formation…"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apprenant</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune inscription trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        {enrollment.user ? (
                          <div>
                            <div className="font-medium">
                              {enrollment.user.firstName} {enrollment.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{enrollment.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">{enrollment.userId}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {enrollment.formation ? (
                          <div>
                            <div className="font-medium">{enrollment.formation.title}</div>
                            {enrollment.formation.level && (
                              <div className="text-sm text-muted-foreground">{enrollment.formation.level}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">{enrollment.formationId}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm shrink-0">{enrollment.progressPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLOR[enrollment.status]}>
                          {STATUS_LABEL[enrollment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(enrollment.enrolledAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
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
