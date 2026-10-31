export interface User {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  otp: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  displayName?: string | null;
}

export type LoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'GOOGLE_ACCOUNT_PASSWORD_LOGIN'
  | 'ACCOUNT_UNAVAILABLE'
  | 'VALIDATION_ERROR'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export class LoginError extends Error {
  readonly code: LoginErrorCode;

  constructor(code: LoginErrorCode, message: string) {
    super(message);
    this.name = 'LoginError';
    this.code = code;
  }
}
