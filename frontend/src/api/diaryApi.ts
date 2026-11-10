import { apiClient } from "./client";
import type { DiaryEntry, CreateDiaryEntryRequest } from "../types/diary_entry";
import type { ApiSuccessResponse } from "../types/api";

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
    const response = await apiClient.get<ApiSuccessResponse<DiaryEntry[]>>('/entries');
    return response.data.data;
}

export async function createDiaryEntry(entry: CreateDiaryEntryRequest): Promise<DiaryEntry> {
    const response = await apiClient.post<ApiSuccessResponse<DiaryEntry>>('/entries', entry);
    return response.data.data;
}
