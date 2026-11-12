import axios from "axios";
import { getDiaryEntries as fetchDiaryEntries, 
    getDiaryEntryById as fetchDiaryEntryById, 
    createDiaryEntry as fetchCreateDiaryEntry, 
    updateDiaryEntry as fetchUpdateDiaryEntry, 
    deleteDiaryEntry as fetchDeleteDiaryEntry
} from "../api/diaryApi";
import type { CreateDiaryEntryRequest, DiaryEntry } from "../types/diary_entry";

function getDiaryError(error: unknown): Error {
    if (!axios.isAxiosError(error)) {
        return new Error(
            'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
        );
    }
    if (!error.response) {
        return new Error(
            'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
        );
    }
    return new Error(
        error.response.data.message || 'Đã xảy ra lỗi không xác định.',
    );
}

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
    try {
        const { entries } = await fetchDiaryEntries();
        return entries;
    } catch (error) {
        throw getDiaryError(error);
    }
}

export async function createDiaryEntry(entry: CreateDiaryEntryRequest): Promise<DiaryEntry> {
    try {
        return await fetchCreateDiaryEntry(entry);
    } catch (error) {
        throw getDiaryError(error);
    }
}

export async function getDiaryEntryById(id: string): Promise<DiaryEntry> {
    try {
        return await fetchDiaryEntryById(id);
    }
    catch (error) {
        throw getDiaryError(error);
    }
}

export async function updateDiaryEntry(id: string, entry: Partial<CreateDiaryEntryRequest>): Promise<DiaryEntry> {
    try {
        return await fetchUpdateDiaryEntry(id, entry);
    }
    catch (error) {
        throw getDiaryError(error);
    }
}

export async function deleteDiaryEntry(id: string): Promise<void> {
    try {
        return await fetchDeleteDiaryEntry(id);
    }
    catch (error) {
        throw getDiaryError(error);
    }
}
