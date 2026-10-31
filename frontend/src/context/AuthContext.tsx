import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { SESSION_EXPIRED_EVENT } from '../api/client';
import * as authService from '../services/authService';
import type { User } from '../types/auth';
import { clearAccessToken, setAccessToken } from '../utils/tokenStorage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initializationError: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  const initializeAuth = useCallback(async () => {
    setIsInitializing(true);
    setInitializationError(null);

    try {
      const currentUser = await authService.restoreSession();
      setUser(currentUser);
    } catch (error) {
      clearAccessToken();
      setUser(null);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setInitializationError(null);
      } else {
        setInitializationError(
          'Không thể kiểm tra phiên đăng nhập. Kiểm tra kết nối rồi thử lại.',
        );
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = useCallback(
    (nextUser: User, accessToken: string) => {
      setAccessToken(accessToken);
      setUser(nextUser);
      setInitializationError(null);
      queryClient.clear();
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearAccessToken();
    setUser(null);
    setInitializationError(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    function handleSessionExpired() {
      clearAccessToken();
      setUser(null);
      queryClient.clear();
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      initializationError,
      login,
      logout,
      initializeAuth,
    }),
    [
      user,
      isInitializing,
      initializationError,
      login,
      logout,
      initializeAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
