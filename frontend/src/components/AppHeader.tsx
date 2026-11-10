import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setError('');
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setError('Không thể đăng xuất do lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="flex items-center justify-between mb-6 rounded-lg border-b border-stone-200 pb-4">
      <div>
        <p className="font-semibold text-stone-900">Personal Diary</p>
        {user && (
          <p className="text-sm text-stone-600">
            {user.displayName || user.email}
          </p>
        )}
      </div>
      <button
        className="bg-red-500 text-white rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
        disabled={isLoggingOut}
        onClick={handleLogout}
        type="button"
      >
        {isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
      {error && (
        <p className="w-full text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </header>
  );
}
