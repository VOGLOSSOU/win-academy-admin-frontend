import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiCommune, PaginatedResponse } from '@/types';

export function useCommunes(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['communes', page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiCommune>>(`/communes?page=${page}&limit=${limit}`),
  });
}
