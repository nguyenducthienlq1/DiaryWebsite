import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDiaryEntryById, updateDiaryEntry } from '../services/diaryService';
import type { CreateDiaryEntryRequest } from '../types/diary_entry';

export function useDiaryEntry(id: string) {
    return useQuery({
        queryKey: ['entries', id],
        queryFn: () => getDiaryEntryById(id),
        enabled: Boolean(id),
    });
}

export function useUpdateDiaryEntry(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateDiaryEntryRequest) => updateDiaryEntry(id, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['entries'] });
        },
    });
}