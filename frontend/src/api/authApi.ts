import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
  RegisterResponse,
  RegisterRequest,
} from '../types/auth';
import type {ApiSuccessResponse} from "../types/api";

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    '/auth/login',
    request,
  );

  return response.data.data;
}

export async function register(request: RegisterRequest,): Promise<RegisterResponse> {
  const response = await apiClient.post<ApiSuccessResponse<{ newUser: RegisterResponse }>
  >('/auth/register', request);

  return response.data.data.newUser;
}

export async function sendOtp(email: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<null>>('/auth/send-otp', { email });
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiSuccessResponse<User>>('/auth/me');

  return response.data.data;
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  const response =
    await apiClient.post<ApiSuccessResponse<RefreshTokenResponse>>(
      '/auth/refresh',
    );

  return response.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post<ApiSuccessResponse<null>>('/auth/logout');
}

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    '/auth/google-login',
    { idToken },
  );
  return response.data.data;
}
