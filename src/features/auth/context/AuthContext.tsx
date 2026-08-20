'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/features/auth/services/auth.service';
import { tokenManager } from '@/lib/api/axios';
import {
  AuthContextType,
  AuthUser,
  LoginData,
  RegisterData,
} from '@/features/auth/types/auth.type';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount from whatever was persisted at login/refresh time
  // (there's no /auth/me endpoint to re-fetch the user from).
  useEffect(() => {
    const token = tokenManager.getAccessToken();

    if (token) {
      setUser(authService.getStoredUser());
      setAccessToken(token);
      setRefreshToken(tokenManager.getRefreshToken());
    }

    setIsLoading(false);
  }, []);

  // Forced logout signaled by the axios interceptor when a 401 can't be
  // recovered from (no refresh token, or the refresh call itself fails).
  // Tokens are already cleared by the interceptor by the time this fires.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      router.push('/login');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [router]);

  // Trong AuthProvider
  const searchParams = useSearchParams(); // thêm vào

  const login = async (credentials: LoginData) => {
    try {
      const { tokens, user } = await authService.login(credentials.username, credentials.password);

      setUser(user);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);

      toast.success('Login successful!');
      // Redirect về trang trước đó nếu có
      const returnUrl = searchParams.get('returnUrl') || '/';
      router.push(returnUrl);

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);

      setAccessToken(response.tokens.accessToken);
      setRefreshToken(response.tokens.refreshToken);

      toast.success('Registration successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();

      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
      throw error;
    }
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const { tokens, user } = await authService.refreshToken();

      setUser(user);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);

      return tokens.accessToken;
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
