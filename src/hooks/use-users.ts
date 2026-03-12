import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiUser, PaginatedResponse } from '@/types';

export function useUsers(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => api.get<PaginatedResponse<ApiUser>>(`/users?page=${page}&limit=${limit}`),
  });
}
