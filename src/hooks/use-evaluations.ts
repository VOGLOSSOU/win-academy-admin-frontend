import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiEvaluation, ApiQuestion } from '@/types';

const QUERY_KEY = 'evaluations';

export function useEvaluation(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<ApiEvaluation>(`/evaluations/${id}`),
    enabled: !!id,
  });
}

export function useCreateEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { formationId: string; passingScore: number; maxAttempts?: number; timeLimit?: number }) =>
      api.post<ApiEvaluation>('/evaluations', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['formations'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ─── Questions ────────────────────────────────────────────────────────────────
export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      evaluationId: string;
      questionText: string;
      answers: { answerText: string; isCorrect: boolean }[];
    }) => api.post<ApiQuestion>('/questions', body),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: [QUERY_KEY, data.evaluationId] }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, evaluationId, ...body }: { id: string; evaluationId: string; questionText: string }) =>
      api.patch<ApiQuestion>(`/questions/${id}`, body),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [QUERY_KEY, vars.evaluationId] }),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, evaluationId }: { id: string; evaluationId: string }) =>
      api.delete<{ message: string }>(`/questions/${id}`),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [QUERY_KEY, vars.evaluationId] }),
  });
}
