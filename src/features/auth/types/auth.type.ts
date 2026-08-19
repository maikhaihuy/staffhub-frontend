import { z } from 'zod';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

/**
 * Login Data
 */
export type LoginData = z.infer<typeof loginSchema>;

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
 * Auth Tokens Response from Backend (TokenDto - POST /auth/login, /auth/refresh)
 * NOTE: the backend does not return a user object alongside the tokens.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Claims present in the decoded access token JWT payload.
 * `role`/`branches`/`empId` are only present once the user has an employee
 * record linked - don't assume they're always set.
 */
export interface AccessTokenClaims {
  sub: number;
  phone: string;
  role?: string;
  branches?: number[];
  empId?: number;
  iat: number;
  exp: number;
}

/**
 * Current-user identity derived from the access token (there is no
 * `/auth/me` endpoint on the backend).
 */
export interface AuthUser {
  id: number;
  phone: string;
  role?: string;
  branches?: number[];
  employeeId?: number;
}

/**
 * Auth State
 */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth Context Type
 */
export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}
