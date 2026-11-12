import { useId } from 'react';

interface EntryDetailProps {
    title: string;
    entryDate: string;
    content: string;
    onTitleChange: (value: string) => void;
    onEntryDateChange: (value: string) => void;
    onContentChange: (value: string) => void;
    disabled?: boolean;
}

export default function EntryDetail({
    title,
    entryDate,
    content,
    onTitleChange,
    onEntryDateChange,
    onContentChange,
    disabled = false,
}: EntryDetailProps) {
    const id = useId();

    return (
        <section
            aria-label="Nội dung nhật ký"
            className="overflow-hidden rounded-lg border border-stone-300 bg-[#fffefa] shadow-[0_12px_30px_rgba(41,37,36,0.12)]"
        >
            <div
                aria-hidden="true"
                className="flex h-12 items-center justify-between border-b border-stone-200 bg-stone-100 px-5 sm:px-8"
            >
                {Array.from({ length: 8 }, (_, index) => (
                    <span
                        key={index}
                        className="size-3 rounded-full bg-stone-800 shadow-inner sm:size-4"
                    />
                ))}
            </div>

            <div className="p-5 sm:p-8">
                <label className="sr-only" htmlFor={`${id}-title`}>
                    Tiêu đề
                </label>
                <input
                    autoComplete="off"
                    className="w-full border-0 bg-transparent p-0 text-2xl font-semibold text-stone-900 outline-none placeholder:text-stone-400 focus:ring-0 disabled:opacity-70 sm:text-3xl"
                    disabled={disabled}
                    id={`${id}-title`}
                    maxLength={255}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="Tiêu đề nhật ký"
                    value={title}
                />
                <div className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                    <label htmlFor={`${id}-date`}>Ngày viết</label>
                    <input
                        className="rounded-md border-0 bg-transparent px-1 py-1 text-sm text-stone-600 outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-70"
                        disabled={disabled}
                        id={`${id}-date`}
                        onChange={(event) => onEntryDateChange(event.target.value)}
                        type="date"
                        value={entryDate}
                    />
                </div>
                <div className="pt-5">
                    <label className="sr-only" htmlFor={`${id}-content`}>
                        Nội dung
                    </label>
                    <textarea
                        className="entry-detail-lines min-h-72 w-full resize-y border-0 bg-transparent p-0 text-base leading-8 text-stone-800 outline-none placeholder:text-stone-400 focus:ring-0 disabled:opacity-70"
                        disabled={disabled}
                        id={`${id}-content`}
                        onChange={(event) => onContentChange(event.target.value)}
                        placeholder="Hôm nay của bạn thế nào?"
                        value={content}
                    />
                </div>
            </div>
        </section>
    );
}
