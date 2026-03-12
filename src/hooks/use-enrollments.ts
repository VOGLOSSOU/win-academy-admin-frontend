import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiEnrollment, PaginatedResponse } from '@/types';

export function useEnrollments(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['enrollments', page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiEnrollment>>(`/enrollments?page=${page}&limit=${limit}`),
  });
}
