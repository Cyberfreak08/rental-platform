import { apiClient } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessId?: string;
}

export interface LoginResponse {
  user: AuthUser;
  expiresAt: string;
}

export interface MeResponse {
  user: AuthUser;
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiClient<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    }),
  me: () => apiClient<MeResponse>('/api/v1/auth/me'),
};
