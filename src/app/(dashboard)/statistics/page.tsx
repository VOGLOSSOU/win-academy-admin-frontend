'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useFormations } from '@/hooks/use-formations';
import { useCategories } from '@/hooks/use-categories';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A855F7', '#EC4899'];

export default function StatisticsPage() {
  const { data: formationsData, isLoading: loadingFormations } = useFormations(1, 200);
  const { data: categoriesData, isLoading: loadingCategories } = useCategories(1, 100);

  const formations = formationsData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const isLoading = loadingFormations || loadingCategories;

  // Formations par catégorie
  const categoryData = categories
    .map((cat, i) => ({
      name: cat.name,
      value: formations.filter((f) => f.categoryId === cat.id).length,
      color: COLORS[i % COLORS.length],
    }))
    .filter((c) => c.value > 0);

  // Formations par niveau
  const levelData = [
    { level: 'Débutant', count: formations.filter((f) => f.level === 'DEBUTANT').length },
    { level: 'Intermédiaire', count: formations.filter((f) => f.level === 'INTERMEDIAIRE').length },
    { level: 'Avancé', count: formations.filter((f) => f.level === 'AVANCE').length },
  ].filter((d) => d.count > 0);

  // Formations créées par mois (6 derniers mois)
  const now = new Date();
  const monthlyCreations = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString('fr-FR', { month: 'short' });
    const count = formations.filter((f) => {
      const created = new Date(f.createdAt);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    }).length;
    return { month: label, formations: count };
  });

  // KPIs dérivés
  const totalEnrollments = formations.reduce((s, f) => s + (f._count?.enrollments ?? 0), 0);
  const formationsWithEval = formations.filter((f) => f.evaluation).length;
  const evalRate = formations.length > 0 ? Math.round((formationsWithEval / formations.length) * 100) : 0;
  const avgEnrollmentsPerFormation = formations.length > 0
    ? Math.round(totalEnrollments / formations.length)
    : 0;

  const kpis = [
    { title: 'Total formations', value: formationsData?.meta?.total ?? 0 },
    { title: 'Total inscriptions', value: totalEnrollments },
    { title: 'Moy. inscrits / formation', value: avgEnrollmentsPerFormation },
    { title: 'Formations avec évaluation', value: `${evalRate}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">Analytiques détaillées de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{kpi.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Formations créées par mois */}
        <Card>
          <CardHeader>
            <CardTitle>Formations créées (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCreations}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="formations" name="Formations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formations par niveau */}
        <Card>
          <CardHeader>
            <CardTitle>Formations par niveau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : levelData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" allowDecimals={false} className="text-xs" />
                    <YAxis type="category" dataKey="level" className="text-xs" width={90} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Formations" fill="#00C49F" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Formations par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Formations par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inscriptions par formation (top 5) */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 formations par inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : formations.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {[...formations]
                    .sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0))
                    .slice(0, 5)
                    .map((f, i) => {
                      const max = formations[0]?._count?.enrollments ?? 1;
                      const count = f._count?.enrollments ?? 0;
                      const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                      return (
                        <div key={f.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium truncate max-w-[200px]">{f.title}</span>
                            <span className="text-sm text-muted-foreground shrink-0 ml-2">{count} inscrit(s)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
