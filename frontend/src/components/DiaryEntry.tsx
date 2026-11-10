import type { DiaryEntry } from '../types/diary_entry';
import * as formatDate from '../utils/formatDate';

interface DiaryEntryProps {
    entry: DiaryEntry;
}

export default function DiaryEntryCard({ entry }: DiaryEntryProps) {
    return (
        <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-medium text-stone-500">{formatDate.formatEntryDate(entry.entryDate)}</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">{entry.title}</h2>
            {entry.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </article>
    );
}
