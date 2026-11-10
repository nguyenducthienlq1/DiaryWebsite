import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppHeader from '../components/AppHeader';
import { useDiary } from '../hooks/useDiary';
import type { CreateDiaryEntryRequest } from '../types/diary_entry';

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
                    className="mt-6 space-y-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label
                            className="mb-1.5 block text-sm font-medium text-stone-700"
                            htmlFor="entry-title"
                        >
                            Tiêu đề
                        </label>
                        <input
                            autoFocus
                            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-stone-50"
                            disabled={isCreating}
                            id="entry-title"
                            maxLength={255}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Ví dụ: Một ngày bình yên"
                            required
                            value={title}
                        />
                    </div>
                    <div>
                        <label
                            className="mb-1.5 block text-sm font-medium text-stone-700"
                            htmlFor="entry-date"
                        >
                            Ngày viết
                        </label>
                        <input
                            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-stone-50"
                            disabled={isCreating}
                            id="entry-date"
                            onChange={(event) => setEntryDate(event.target.value)}
                            required
                            type="date"
                            value={entryDate}
                        />
                    </div>
                    <div>
                        <label
                            className="mb-1.5 block text-sm font-medium text-stone-700"
                            htmlFor="entry-content"
                        >
                            Nội dung
                        </label>
                        <textarea
                            className="min-h-40 w-full resize-y rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-stone-50"
                            disabled={isCreating}
                            id="entry-content"
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Hôm nay của bạn thế nào?"
                            required
                            value={content}
                        />
                    </div>

                    {(validationError || createError) && (
                        <p className="text-sm text-red-700" role="alert">
                            {validationError || createError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                            disabled={isCreating}
                            onClick={() => navigate('/entry')}
                            type="button"
                        >
                            Hủy
                        </button>
                        <button
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                            disabled={isCreating}
                            type="submit"
                        >
                            {isCreating ? 'Đang lưu…' : 'Lưu nhật ký'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}