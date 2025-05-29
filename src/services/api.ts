
import { secureStorage } from '@/utils/secureStorage';

const BASE_URL = 'https://will-downloaded-hispanic-walt.trycloudflare.com';

export interface RegisterRequest {
  username: string;
  email: string;
  name: string;
  phone_number: string;
  profile_image?: string;
  password: string;
}

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  name?: string;
  phone_number?: string;
  profile_image?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  uid: string;
  new_password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  profile_image: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

class APIError extends Error {
  constructor(public status: number, public data: any) {
    super(`API Error: ${status}`);
  }
}

const makeRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  const token = secureStorage.getAccessToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token refresh for 401 errors
      if (response.status === 401 && data.code === 'token_not_valid') {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = secureStorage.getAccessToken();
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw new APIError(retryResponse.status, retryData);
          }
          return retryData;
        }
      }
      throw new APIError(response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refresh = secureStorage.getRefreshToken();
    if (!refresh) return false;

    const response = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      secureStorage.updateTokens(data.access, refresh);
      return true;
    }
    
    // If refresh fails, clear storage
    secureStorage.remove();
    return false;
  } catch {
    secureStorage.remove();
    return false;
  }
};

export const authAPI = {
  register: (data: RegisterRequest) =>
    makeRequest('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    makeRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfile: (data: UpdateProfileRequest): Promise<User> =>
    makeRequest('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordRequest) =>
    makeRequest('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  passwordReset: (data: PasswordResetRequest) =>
    makeRequest('/api/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
    makeRequest('/api/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: refreshAccessToken,
};
