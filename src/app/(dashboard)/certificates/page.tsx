'use client';

import { useState } from 'react';
import { Search, FileCheck, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificats</h1>
          <p className="text-muted-foreground">Gérer et délivrer les certificats</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Fonctionnalité à venir</AlertTitle>
        <AlertDescription>
          Les endpoints API pour les certificats ne sont pas encore documentés.
          Cette page sera connectée dès que les routes seront disponibles.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher des certificats…"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificat #</TableHead>
                <TableHead>Apprenant</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Délivré le</TableHead>
                <TableHead>Vérification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileCheck className="h-8 w-8 text-muted-foreground/50" />
                    <p>Aucun certificat disponible pour le moment</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
