'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunes } from '@/hooks';

export default function CommunesPage() {
  const { data, isLoading } = useCommunes(1, 100);
  const [searchQuery, setSearchQuery] = useState('');

  const communes = data?.data ?? [];

  const filtered = communes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.department?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communes</h1>
          <p className="text-muted-foreground">Les 77 communes du Bénin</p>
        </div>
        {data && (
          <Badge variant="outline" className="text-base px-3 py-1">
            {data.meta.total} commune(s)
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par commune ou département…"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Code département</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Aucune commune trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((commune) => (
                    <TableRow key={commune.id}>
                      <TableCell className="font-medium">{commune.name}</TableCell>
                      <TableCell>{commune.department?.name ?? '—'}</TableCell>
                      <TableCell>
                        {commune.department?.code ? (
                          <Badge variant="outline">{commune.department.code}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(commune.createdAt).toLocaleDateString('fr-FR')}
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
