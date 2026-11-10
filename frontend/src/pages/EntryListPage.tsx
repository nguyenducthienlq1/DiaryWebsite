import AppHeader from '../components/AppHeader';
import Entry from '../components/DiaryEntry';
import { Link } from 'react-router-dom';
import { useDiary } from '../hooks/useDiary';

export default function EntryListPage() {
  const { entries, isLoading, loadError, reload } = useDiary();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6">
      <AppHeader />
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Nhật ký của tôi</h1>
            <p className="mt-1 text-sm text-stone-500">
              Ghi lại những điều bạn muốn lưu giữ.
            </p>
          </div>
          <Link
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            to="/entry/create"
          >
            ＋ Tạo nhật ký
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-500" role="status">Đang tải nhật ký…</p>
        ) : loadError ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700" role="alert">{loadError}</p>
            <button
              className="mt-3 text-sm font-medium text-red-800 underline"
              onClick={() => void reload()}
              type="button"
            >
              Thử tải lại
            </button>
          </div>
        ) : entries.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            Chưa có bài viết nào. Hãy tạo nhật ký đầu tiên của bạn.
          </p>
        ) : (
          <section aria-label="Danh sách nhật ký" className="mt-6 grid grid-cols-1 gap-4">
            {entries.map((entry) => (
              <Entry entry={entry} key={entry.id} />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
