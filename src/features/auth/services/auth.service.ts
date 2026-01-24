// src/features/auth/services/auth.service.ts
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import axios from '@/lib/api/axios';
import {
  AuthTokens,
  ChangePasswordData,
  ForgotPasswordData,
  LoginData,
  RegisterData,
  ResetPasswordData,
} from '../types/auth.type';
import { User } from '@/features/users/types/user.types';

class AuthService {
  async login(username: string, password: string): Promise<{ user: User }> {
    const response = await axios.post('/api/auth/login', { username, password });
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User }> {
    // Call the backend API to register the user
    await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);

    // After successful registration, log the user in to create a session
    return this.login(data.email, data.password);
  }

  async logout(): Promise<void> {
    await axios.post('/api/auth/logout');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get<{ user: User }>('/api/auth/session');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }
}

export const authService = new AuthService();
