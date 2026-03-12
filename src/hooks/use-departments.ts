import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiDepartment, PaginatedResponse } from '@/types';

export function useDepartments(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['departments', page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiDepartment>>(`/departments?page=${page}&limit=${limit}`),
  });
}
