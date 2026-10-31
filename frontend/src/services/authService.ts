import axios from 'axios';
import * as authApi from '../api/authApi';
import {
  clearAccessToken,
  setAccessToken,
} from '../utils/tokenStorage';
import {
  LoginError,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
} from '../types/auth';

function getLoginError(error: unknown): LoginError {
  if (!axios.isAxiosError(error)) {
    return new LoginError(
      'UNKNOWN_ERROR',
      'Không thể đăng nhập lúc này. Vui lòng thử lại.',
    );
  }

  if (!error.response) {
    return new LoginError(
      'NETWORK_ERROR',
      'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
    );
  }

  const responseData = error.response.data as {
    error?: {
      code?: string;
      message?: string;
    };
  };
  const backendCode = responseData.error?.code;
  const backendMessage = responseData.error?.message;

  if (backendCode === 'GOOGLE_ACCOUNT_PASSWORD_LOGIN') {
    return new LoginError(
      'GOOGLE_ACCOUNT_PASSWORD_LOGIN',
      backendMessage ??
        'Tài khoản này đã được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.',
    );
  }

  switch (error.response.status) {
    case 401:
      return new LoginError(
        'INVALID_CREDENTIALS',
        'Email hoặc mật khẩu không đúng.',
      );
    case 403:
      return new LoginError(
        'ACCOUNT_UNAVAILABLE',
        'Không thể đăng nhập bằng tài khoản này. Vui lòng liên hệ hỗ trợ.',
      );
    case 400:
      return new LoginError(
        'VALIDATION_ERROR',
        'Email hoặc mật khẩu chưa đúng định dạng.',
      );
    case 429:
      return new LoginError(
        'TOO_MANY_REQUESTS',
        'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ rồi thử lại.',
      );
    default:
      return new LoginError(
        'UNKNOWN_ERROR',
        'Máy chủ chưa thể xử lý đăng nhập. Vui lòng thử lại sau.',
      );
  }
}

function getRegisterError(error: unknown): LoginError {
  if (!axios.isAxiosError(error)) {
    return new LoginError(
      'UNKNOWN_ERROR',
      'Không thể đăng ký lúc này. Vui lòng thử lại.',
    );
  }
  if (!error.response) {
    return new LoginError(
      'NETWORK_ERROR',
      'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
    );
  }
  switch (error.response.status) {
    case 400:
      return new LoginError(
        'VALIDATION_ERROR',
        'Thông tin đăng ký chưa đúng định dạng.',
      );
    case 409:
      return new LoginError(
        'ACCOUNT_UNAVAILABLE',
        'Email đã được sử dụng. Vui lòng thử email khác.',
      );
    case 429:
      return new LoginError(
        'TOO_MANY_REQUESTS',
        'Bạn đã thử đăng ký quá nhiều lần. Vui lòng chờ rồi thử lại.',
      );
    default:
      return new LoginError(
        'UNKNOWN_ERROR',
        'Máy chủ chưa thể xử lý đăng ký. Vui lòng thử lại sau.',
      );
  }
}

function getGoogleLoginError(error: unknown): LoginError {
  if (!axios.isAxiosError(error)) {
    return new LoginError(
      'UNKNOWN_ERROR',
      'Không thể đăng nhập bằng Google lúc này. Vui lòng thử lại.',
    );
  }
  if (!error.response) {
    return new LoginError(
      'NETWORK_ERROR',
      'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
    );
  }

  switch (error.response.status) {
    case 400:
      return new LoginError(
        'VALIDATION_ERROR',
        'Thông tin đăng nhập bằng Google chưa đúng định dạng.',
      );
    case 401:
      return new LoginError(
        'INVALID_CREDENTIALS',
        'Thông tin đăng nhập bằng Google không hợp lệ.',
      );
    case 403:
      return new LoginError(
        'ACCOUNT_UNAVAILABLE',
        'Không thể đăng nhập bằng tài khoản Google này. Vui lòng liên hệ hỗ trợ.',
      );
    case 429:
      return new LoginError(
        'TOO_MANY_REQUESTS',
        'Bạn đã thử đăng nhập bằng Google quá nhiều lần. Vui lòng chờ rồi thử lại.',
      );
    default:
      return new LoginError(
        'UNKNOWN_ERROR',
        'Máy chủ chưa thể xử lý đăng nhập bằng Google. Vui lòng thử lại sau.',
      );
  }
}

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  try {
    return await authApi.login(request);
  } catch (error) {
    throw getLoginError(error);
  } 
}

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  try {
    return await authApi.register(request);
  } catch (error) {
    throw getRegisterError(error);
  }
}

export async function sendOtp(email: string): Promise<void> {
  try {
    await authApi.sendOtp(email);
  } catch (error) {
    throw getRegisterError(error);
  }
}


export async function googleLogin(idToken: string): Promise<LoginResponse> {
  try {
    return await authApi.googleLogin(idToken);
  } catch (error) {
    throw getGoogleLoginError(error);
  }
}

let restorePromise: Promise<LoginResponse['user']> | null = null;

export function restoreSession(): Promise<LoginResponse['user']> {
  if (!restorePromise) {
    restorePromise = (async () => {
      const refreshed = await authApi.refreshToken();
      setAccessToken(refreshed.accessToken);

      try {
        return await authApi.getCurrentUser();
      } catch (error) {
        clearAccessToken();
        throw error;
      }
    })().finally(() => {
      restorePromise = null;
    });
  }

  return restorePromise;
}

export async function logout(): Promise<void> {
  await authApi.logout();
}
