import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppHeader from '../components/AppHeader';
import { useDiary } from '../hooks/useListDiary';
import type { CreateDiaryEntryRequest } from '../types/diary_entry';
import EntryDetail from '../components/EntryDetail';

function getTodayDate(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
}

export default function CreateEntryPage() {
    const navigate = useNavigate();
    const { createDiaryEntry, isCreating, createError } = useDiary();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [entryDate, setEntryDate] = useState(getTodayDate);
    const [validationError, setValidationError] = useState('');
    const isPending = isCreating;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setValidationError('');

        if (!title.trim() || !content.trim()) {
            setValidationError('Vui lòng nhập tiêu đề và nội dung nhật ký.');
            return;
        }

        const entry: CreateDiaryEntryRequest = {
            title: title.trim(),
            content,
            entryDate,
            tags: [],
        };

        createDiaryEntry(entry, {
            onSuccess: () => {
                toast.success('Đã tạo nhật ký thành công!');
                navigate('/entry', { replace: true });
            },
        });
    }

    return (
        <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6">
            <AppHeader />
            <section>
                <Link
                    className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    to="/entry"
                >
                    ← Quay lại danh sách
                </Link>
                <h1 className="mt-4 text-2xl font-semibold text-stone-900">
                    Tạo nhật ký mới
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                    Ghi lại những điều bạn muốn lưu giữ.
                </p>

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
                    {(validationError || createError) && (
                        <p className="text-sm text-red-700" role="alert">
                            {validationError || createError}
                        </p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" type="button" onClick={() => navigate('/entry')} disabled={isPending}>
                            Hủy
                        </button>
                        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" type="submit" disabled={isPending}>
                            {isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}