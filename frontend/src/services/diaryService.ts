import axios from "axios";
import { getDiaryEntries as fetchDiaryEntries } from "../api/diaryApi";
import type { DiaryEntry } from "../types/diary_entry";

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
        return await fetchDiaryEntries();
    } catch (error) {
        throw getDiaryError(error);
    }
}
