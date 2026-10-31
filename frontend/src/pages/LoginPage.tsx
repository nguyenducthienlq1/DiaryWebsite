import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';
import PasswordInput from '../components/PasswordInput';
import { useLoginGoogle } from '../hooks/useLoginGoogle';

export default function LoginPage() {
  const { isAuthenticated, isInitializing, initializationError } = useAuth();
  const loginMutation = useLogin();
  const googleLogin = useLoginGoogle();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email !== 'string' || typeof password !== 'string') {
      return;
    }

    loginMutation.submit({
      email: email.trim(),
      password,
    });
  }

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

  if (isAuthenticated) {
    return <Navigate to="/entry" replace />;
  }

  const errorMessage =
    loginMutation.errorMessage ?? initializationError ?? '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10 text-stone-900">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-4">
          <button className="text-left font-medium text-amber-800 underline-offset-4 hover:underline" onClick={() => window.history.back()}>
            Quay lại
          </button>
        </div>
        <div className="mb-8 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-7" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h7.5l4.5 4.5v12a.75.75 0 0 1-.75.75h-11.25a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 .75-.75Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75v4.5h4.5M9 12h6M9 15.75h6" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Personal Diary</h1>
          <p className="mt-2 text-xl font-semibold leading-6 text-stone-600">
            Đăng nhập
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMessage && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-800">
              Email
            </label>
            <input
              autoComplete="email"
              autoFocus
              className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-base outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:bg-stone-100"
              id="email"
              name="email"
              placeholder="ban@example.com"
              required
              type="email"
              disabled={loginMutation.isPending}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-800">
              Mật khẩu
            </label>
            <PasswordInput
              disabled={loginMutation.isPending}
              id="password"
              name="password"
              placeholder="Password"
            />
          </div>
          <div
            ref={googleLogin.containerRef}
            className="flex w-full justify-center overflow-hidden rounded-lg [&>div]:!w-full"
          />
          {googleLogin.errorMessage && (
            <div
              className="flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {googleLogin.errorMessage}
            </div>
          )}
          <button
            className="flex w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            disabled={loginMutation.isPending}
            type="submit"
          >
            {loginMutation.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Mật khẩu được bảo vệ an toàn.{' '}
          <Link className="font-medium text-amber-800 underline-offset-4 hover:underline" to="/register">
            Đăng ký tài khoản
          </Link>
        </p>
      </section>
    </main>
  );
}
