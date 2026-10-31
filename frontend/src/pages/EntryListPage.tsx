import AppHeader from '../components/AppHeader';

export default function EntryListPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <AppHeader />
      <h1 className="text-2xl font-semibold mb-4">Nhật ký của tôi</h1>
      <p className="text-gray-500">Danh sách bài viết sẽ hiển thị ở đây.</p>
    </div>
  );
}
