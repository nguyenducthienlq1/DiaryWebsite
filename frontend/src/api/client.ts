import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type {
  ApiSuccessResponse,
  RefreshTokenResponse,
} from '../types/auth';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../utils/tokenStorage';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    authRetry?: boolean;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim();

export const SESSION_EXPIRED_EVENT = 'diary:session-expired';

export const apiClient = axios.create({
  baseURL: baseURL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

function isAuthenticationEndpoint(url: string | undefined): boolean {
  if (!url) return false;

  const pathname = url.split('?')[0];
  return [
    '/auth/login',
    '/auth/google-login',
    '/auth/refresh',
    '/auth/logout',
  ].some((path) =>
    pathname.endsWith(path),
  );
}

function notifySessionExpired(): void {
  clearAccessToken();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<ApiSuccessResponse<RefreshTokenResponse>>('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        return data.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token && !isAuthenticationEndpoint(config.url)) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers.delete('Authorization');
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      isAuthenticationEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (originalRequest.authRetry) {
      notifySessionExpired();
      return Promise.reject(error);
    }

    originalRequest.authRetry = true;

    try {
      await refreshAccessToken();
      return await apiClient(originalRequest);
    } catch (refreshError) {
      notifySessionExpired();
      return Promise.reject(refreshError);
    }
  },
);
