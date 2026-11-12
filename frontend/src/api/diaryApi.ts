import { apiClient } from "./client";
import type { DiaryEntry, CreateDiaryEntryRequest } from "../types/diary_entry";
import type { ApiPaginatedSuccessResponse, ApiSuccessResponse, PaginationMeta } from "../types/api";

export async function getDiaryEntries(
    page = 1,
    limit = 6,
): Promise<{ entries: DiaryEntry[]; meta: PaginationMeta }> {
    const response = await apiClient.get<ApiPaginatedSuccessResponse<DiaryEntry>>('/entries', {
        params: { page, limit },
    });
    return { entries: response.data.data, meta: response.data.meta };
}

export async function createDiaryEntry(entry: CreateDiaryEntryRequest): Promise<DiaryEntry> {
    const response = await apiClient.post<ApiSuccessResponse<DiaryEntry>>('/entries', entry);
    return response.data.data;
}

export async function getDiaryEntryById(id: string): Promise<DiaryEntry> {
    const response = await apiClient.get<ApiSuccessResponse<DiaryEntry>>(`/entries/${id}`);
    return response.data.data;
}

export async function updateDiaryEntry(id: string, entry: Partial<CreateDiaryEntryRequest>): Promise<DiaryEntry> {
    const response = await apiClient.put<ApiSuccessResponse<DiaryEntry>>(`/entries/${id}`, entry);
    return response.data.data;
}

export async function deleteDiaryEntry(id: string): Promise<void> {
    await apiClient.delete(`/entries/${id}`);
}
