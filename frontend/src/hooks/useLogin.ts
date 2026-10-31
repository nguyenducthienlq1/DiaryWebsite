import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../types/auth';
import { useAuth } from './useAuth';
import * as authService from '../services/authService';

interface LoginLocationState {
  from: string;
}

function isLoginLocationState(state: unknown): state is LoginLocationState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
  );
}

function getRedirectPath(state: unknown): string {
  if (!isLoginLocationState(state)) {
    return '/entry';
  }

  const path = state.from;
  return path.startsWith('/') && !path.startsWith('//') ? path : '/entry';
}

export function useLogin() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
    onSuccess: (session) => {
      login(session.user, session.accessToken);
      navigate(getRedirectPath(location.state), { replace: true });
    },
  });

  function submit(request: LoginRequest): void {
    setErrorMessage(null);
    mutation.mutate(request, {
      onError: (error) => setErrorMessage(error.message),
      onSettled: () => mutation.reset(),
    });
  }

  return {
    submit,
    isPending: mutation.isPending,
    errorMessage,
  };
}
