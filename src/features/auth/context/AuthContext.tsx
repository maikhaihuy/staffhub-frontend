'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import {
  AuthContextType,
  LoginCredentials,
  RegisterData,
} from '../types/auth.type';
import { toast } from 'sonner';
import { User } from '@/features/users/types/user.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated) {
          // Try to get current user from API
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          const storedUser = authService.getStoredUser();
          setAccessToken(storedUser?.accessToken ?? null);
          setRefreshToken(storedUser?.refreshToken ?? null);
        }
      } catch (_error) {
        // If token is invalid, clear auth state
        await authService.logout();
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials.username, credentials.password);
      
      setUser(response.user);
      setAccessToken(response.tokens.accessToken);
      setRefreshToken(response.tokens.refreshToken);

      toast.success('Login successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      
      setUser(response.user);
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
      const response = await authService.refreshToken();
      
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      return response.accessToken;
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
