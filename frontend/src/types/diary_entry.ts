export interface DiaryEntry {
    id: string;
    title: string;
    content: string;
    entryDate: string;
    tags: string[];
}
export interface CreateDiaryEntryRequest {
    title: string;
    content: string;
    entryDate: string;
    tags: string[];
}