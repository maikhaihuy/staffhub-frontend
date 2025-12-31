import { z } from 'zod';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

/**
 * Login Credentials
 */
export type LoginCredentials = z.infer<typeof loginSchema>;

/**
 * Register Data
 */
export type RegisterData = z.infer<typeof registerSchema>;

/**
 * Change Password Data
 */
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

/**
 * Forgot Password Data
 */
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Data
 */
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

/**
 * Auth Tokens Response from Backend
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth State
 */
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth Context Type
 */
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}
