'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useFormations } from '@/hooks/use-formations';
import { useCategories } from '@/hooks/use-categories';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A855F7', '#EC4899'];

export default function DashboardPage() {
  const { data: formationsData, isLoading: loadingFormations } = useFormations(1, 100);
  const { data: categoriesData, isLoading: loadingCategories } = useCategories(1, 100);

  const formations = formationsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const totalFormations = formationsData?.meta?.total ?? 0;
  const totalCategories = categoriesData?.meta?.total ?? 0;
  const totalEnrollments = formations.reduce((sum, f) => sum + (f._count?.enrollments ?? 0), 0);
  const totalModules = formations.reduce((sum, f) => sum + (f.modules?.length ?? 0), 0);

  // Formations par catégorie pour le camembert
  const formationsByCategory = categories
    .map((cat, i) => ({
      name: cat.name,
      value: formations.filter((f) => f.categoryId === cat.id).length,
      color: COLORS[i % COLORS.length],
    }))
    .filter((c) => c.value > 0);

  // Formations par niveau pour le bar chart
  const levelData = [
    { level: 'Débutant', count: formations.filter((f) => f.level === 'DEBUTANT').length },
    { level: 'Intermédiaire', count: formations.filter((f) => f.level === 'INTERMEDIAIRE').length },
    { level: 'Avancé', count: formations.filter((f) => f.level === 'AVANCE').length },
  ].filter((d) => d.count > 0);

  const isLoading = loadingFormations || loadingCategories;

  const stats = [
    { title: 'Total Formations', value: totalFormations, icon: GraduationCap, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Catégories', value: totalCategories, icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Inscriptions totales', value: totalEnrollments, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Modules créés', value: totalModules, icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de Win Academy</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Bar chart — formations par niveau */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Formations par niveau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : levelData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="level" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Formations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie chart — formations par catégorie */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Formations par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : formationsByCategory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie data={formationsByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                        {formationsByCategory.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3">
                    {formationsByCategory.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dernières formations */}
      {!isLoading && formations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dernières formations ajoutées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...formations]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.category?.name ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{f._count?.enrollments ?? 0} inscrit(s)</p>
                      <p className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
