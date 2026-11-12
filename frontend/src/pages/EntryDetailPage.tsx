import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppHeader from '../components/AppHeader';
import EntryDetail from '../components/EntryDetail';
import { useDiaryEntry, useUpdateDiaryEntry } from '../hooks/useUpdateDiary';
import type { DiaryEntry } from '../types/diary_entry';

function toInputDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.slice(0, 10);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

export default function EntryDetailPage() {
    const { id = '' } = useParams<{ id: string }>();
    const { data: entry, isLoading, isError } = useDiaryEntry(id);

    // Trang danh sách gửi kèm địa chỉ cần quay về (ví dụ "/entry?page=3").
    // Mở thẳng link chi tiết thì không có state, quay về danh sách trang 1.
    const location = useLocation();
    const backTo = (location.state as { backTo?: string } | null)?.backTo ?? '/entry';

    return (
        <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6">
            <AppHeader />
            <Link to={backTo} className="text-sm font-medium text-blue-600 hover:underline">
                ← Quay lại danh sách
            </Link>

            {isLoading ? (
                <p className="mt-6 text-sm text-stone-500" role="status">Đang tải nhật ký…</p>
            ) : isError || !entry ? (
                <p className="mt-6 text-sm text-red-700" role="alert">
                    Không tìm thấy bài viết hoặc đã có lỗi xảy ra.
                </p>
            ) : (
                <EntryEditForm key={entry.id} entry={entry} backTo={backTo} />
            )}
        </main>
    );
}

function EntryEditForm({ entry, backTo }: { entry: DiaryEntry; backTo: string }) {
    const navigate = useNavigate();
    const { mutate, isPending, error } = useUpdateDiaryEntry(String(entry.id));

    const [title, setTitle] = useState(entry.title);
    const [content, setContent] = useState(entry.content);
    const [entryDate, setEntryDate] = useState(toInputDate(entry.entryDate));

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        mutate(
            { title: title.trim(), content, entryDate, tags: entry.tags },
            {
                onSuccess: () => {
                    toast.success('Đã cập nhật nhật ký');
                    navigate(backTo);
                },
            },
        );
    }

    return (
        <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
        >
            <EntryDetail
                content={content}
                disabled={isPending}
                entryDate={entryDate}
                onContentChange={setContent}
                onEntryDateChange={setEntryDate}
                onTitleChange={setTitle}
                title={title}
            />
            {error && <p className="text-sm text-red-700" role="alert">{error.message}</p>}
            <div className="flex justify-end gap-3">
                <button className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" type="button" onClick={() => navigate(backTo)} disabled={isPending}>
                    Hủy
                </button>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" type="submit" disabled={isPending}>
                    {isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
}