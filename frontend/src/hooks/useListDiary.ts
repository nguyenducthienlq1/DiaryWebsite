import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as diaryApi from '../api/diaryApi';
import type { ApiErrorResponse } from '../types/api';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.error?.message;
    if (message) return message;
    if (!error.response) {
      return 'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.';
    }
  }

  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}

export function useDiary(page = 1, limit = 6) {
  const queryClient = useQueryClient();
  const entriesQuery = useQuery({
    queryKey: ['diaryEntries', page, limit],
    queryFn: () => diaryApi.getDiaryEntries(page, limit),
    placeholderData: (previousData) => previousData,
  });
  const createMutation = useMutation({
    mutationFn: diaryApi.createDiaryEntry,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['diaryEntries'] }),
  });

  return {
    entries: entriesQuery.data?.entries ?? [],
    meta: entriesQuery.data?.meta,
    isLoading: entriesQuery.isLoading,
    isFetching: entriesQuery.isFetching,
    loadError: entriesQuery.error ? getErrorMessage(entriesQuery.error) : null,
    reload: entriesQuery.refetch,
    createDiaryEntry: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? getErrorMessage(createMutation.error)
      : null,
  };
}
