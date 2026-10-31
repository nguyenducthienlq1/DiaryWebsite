import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isInitializing,
    initializationError,
    initializeAuth,
  } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main
        aria-live="polite"
        className="flex min-h-screen items-center justify-center text-stone-700"
      >
        Đang kiểm tra phiên đăng nhập…
      </main>
    );
  }

  if (initializationError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-stone-700" role="alert">
          {initializationError}
        </p>
        <button
          className="rounded-lg bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700"
          onClick={() => void initializeAuth()}
          type="button"
        >
          Thử kiểm tra lại
        </button>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return children;
}
