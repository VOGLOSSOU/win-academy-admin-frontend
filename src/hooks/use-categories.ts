import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiCategory, PaginatedResponse } from '@/types';

const QUERY_KEY = 'categories';

export function useCategories(page = 1, limit = 50) {
  return useQuery({
    queryKey: [QUERY_KEY, page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiCategory>>(`/categories?page=${page}&limit=${limit}`),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; ageMin: number; ageMax: number; image?: string | null }) =>
      api.post<ApiCategory>('/categories', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; description?: string; ageMin?: number; ageMax?: number }) =>
      api.patch<ApiCategory>(`/categories/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
