import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiFormation, ApiModule, ApiContent, PaginatedResponse, FormationLevel, ContentType } from '@/types';

const QUERY_KEY = 'formations';

// ─── Formations ───────────────────────────────────────────────────────────────
export function useFormations(page = 1, limit = 50) {
  return useQuery({
    queryKey: [QUERY_KEY, page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiFormation>>(`/formations?page=${page}&limit=${limit}`),
  });
}

export function useFormation(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<ApiFormation>(`/formations/${id}`),
    enabled: !!id,
  });
}

/**
 * Fetches each formation by ID (in parallel) to get the `evaluation` field,
 * which is absent from the list endpoint GET /formations.
 */
export function useFormationsWithEvaluations(page = 1, limit = 100) {
  const listQuery = useQuery({
    queryKey: [QUERY_KEY, page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiFormation>>(`/formations?page=${page}&limit=${limit}`),
  });

  const ids = listQuery.data?.data.map((f) => f.id) ?? [];

  const detailQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: [QUERY_KEY, id],
      queryFn: () => api.get<ApiFormation>(`/formations/${id}`),
      enabled: ids.length > 0,
    })),
  });

  const isLoading = listQuery.isLoading || detailQueries.some((q) => q.isLoading);
  const formations = detailQueries
    .map((q) => q.data)
    .filter((f): f is ApiFormation => !!f);

  return { formations, isLoading, meta: listQuery.data?.meta };
}

export function useCreateFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      shortDescription?: string;
      fullDescription?: string;
      level?: FormationLevel;
      duration?: number;
      image?: string | null;
      categoryId?: string;
    }) => api.post<ApiFormation>('/formations', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; shortDescription?: string; image?: string | null }) =>
      api.patch<ApiFormation>(`/formations/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/formations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

// ─── Modules ──────────────────────────────────────────────────────────────────
export function useModules(formationId: string) {
  return useQuery({
    queryKey: ['modules', formationId],
    queryFn: () => api.get<ApiModule[]>(`/formations/${formationId}/modules`),
    enabled: !!formationId,
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; order: number; formationId: string }) =>
      api.post<ApiModule>('/modules', body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['modules', vars.formationId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formationId, ...body }: { id: string; formationId: string; title?: string; description?: string; order?: number }) =>
      api.patch<ApiModule>(`/modules/${id}`, body),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['modules', vars.formationId] }),
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formationId }: { id: string; formationId: string }) =>
      api.delete<{ message: string }>(`/modules/${id}`),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['modules', vars.formationId] }),
  });
}

// ─── Contenus ─────────────────────────────────────────────────────────────────
export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { type: ContentType; title: string; url?: string; textBody?: string; order: number; moduleId: string; formationId: string }) => {
      const { formationId, textBody, ...rest } = vars;
      const payload = { ...rest, body: textBody };
      return api.post<ApiContent>('/contents', payload).then((res) => ({ ...res, formationId }));
    },
    onSuccess: (data: ApiContent & { formationId: string }) =>
      qc.invalidateQueries({ queryKey: ['modules', data.formationId] }),
  });
}

export function useDeleteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formationId }: { id: string; formationId: string }) =>
      api.delete<{ message: string }>(`/contents/${id}`),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['modules', vars.formationId] }),
  });
}
