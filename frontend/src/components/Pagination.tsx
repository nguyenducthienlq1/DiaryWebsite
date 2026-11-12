interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

type PageItem = number | 'gap-start' | 'gap-end';

function getPageItems(current: number, total: number): PageItem[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }
    if (current <= 4) {
        return [1, 2, 3, 4, 5, 'gap-end', total];
    }
    if (current >= total - 3) {
        return [1, 'gap-start', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', total];
}

const buttonBase =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40';

export default function Pagination({
    page,
    totalPages,
    onPageChange,
    disabled = false,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <nav
            aria-label="Phân trang"
            className="mt-8 flex items-center justify-between gap-2 sm:justify-center sm:gap-3"
        >
            <button
                type="button"
                className={`${buttonBase} text-stone-600 hover:bg-stone-100`}
                disabled={disabled || page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ‹ Trước
            </button>

            {/* Màn hình nhỏ: không đủ chỗ cho dãy số nên chỉ hiện "Trang x / y" */}
            <p className="text-sm text-stone-500 sm:hidden" role="status">
                Trang {page} / {totalPages}
            </p>

            <ul className="hidden items-center gap-1 sm:flex">
                {getPageItems(page, totalPages).map((item) =>
                    typeof item === 'number' ? (
                        <li key={item}>
                            <button
                                type="button"
                                aria-label={`Trang ${item}`}
                                aria-current={item === page ? 'page' : undefined}
                                className={
                                    item === page
                                        ? `${buttonBase} bg-blue-600 text-white`
                                        : `${buttonBase} text-stone-600 hover:bg-stone-100`
                                }
                                disabled={disabled}
                                onClick={() => {
                                    if (item !== page) onPageChange(item);
                                }}
                            >
                                {item}
                            </button>
                        </li>
                    ) : (
                        <li key={item} aria-hidden="true" className="select-none px-1 text-stone-400">
                            …
                        </li>
                    ),
                )}
            </ul>

            <button
                type="button"
                className={`${buttonBase} text-stone-600 hover:bg-stone-100`}
                disabled={disabled || page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Sau ›
            </button>
        </nav>
    );
}