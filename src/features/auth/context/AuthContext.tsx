'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
  ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { authService } from '@/features/auth/services/auth.service';
import { tokenManager } from '@/lib/api/axios';
import { buildReturnUrl, resolveReturnUrl } from '@/lib/utils/returnUrl';
import {
  AuthContextType,
  AuthUser,
  LoginData,
  RegisterData,
} from '@/features/auth/types/auth.type';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// useSearchParams() opts a route out of static prerendering unless it sits
// inside a Suspense boundary. AuthProvider wraps the whole app (see
// providers.tsx), so the hook is isolated here rather than called directly
// in AuthProvider - this keeps every other page statically prerenderable.
function ReturnUrlSync({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onChange(searchParams);
  }, [searchParams, onChange]);

  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount by re-deriving the user from the access token cookie
  // (there's no /auth/me endpoint, and the user is never persisted in localStorage).
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

      // Already on /login - don't wrap it in its own returnUrl.
      if (window.location.pathname.startsWith('/login')) {
        router.push('/login');
        return;
      }

      const returnUrl = buildReturnUrl(
        window.location.pathname,
        window.location.search,
        window.location.hash
      );
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [router]);

  // Signaled by the axios interceptor when the backend rejects a request
  // because this session is flagged mustChangePassword. The session itself
  // is still valid (unlike session-expired) - just confined to
  // /change-password until the user clears the flag there.
  useEffect(() => {
    const handlePasswordChangeRequired = () => {
      if (window.location.pathname.startsWith('/change-password')) {
        return;
      }

      const returnUrl = buildReturnUrl(
        window.location.pathname,
        window.location.search,
        window.location.hash
      );
      router.push(`/change-password?returnUrl=${encodeURIComponent(returnUrl)}`);
    };

    window.addEventListener('auth:password-change-required', handlePasswordChangeRequired);
    return () =>
      window.removeEventListener('auth:password-change-required', handlePasswordChangeRequired);
  }, [router]);

  const searchParamsRef = useRef<URLSearchParams>(new URLSearchParams());
  const handleSearchParamsChange = useCallback((params: URLSearchParams) => {
    searchParamsRef.current = params;
  }, []);

  const login = async (credentials: LoginData) => {
    try {
      const { tokens, user } = await authService.login(credentials.username, credentials.password);

      setUser(user);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);

      toast.success('Login successful!');
      // Redirect về trang trước đó nếu có (chỉ khi an toàn, cùng origin)
      const returnUrl = resolveReturnUrl(searchParamsRef.current.get('returnUrl'), '/');
      router.push(returnUrl);

    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Login error:', axiosError);
      toast.error(axiosError.response?.data?.message || 'Login failed');
      throw axiosError;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);

      setAccessToken(response.tokens.accessToken);
      setRefreshToken(response.tokens.refreshToken);

      toast.success('Registration successful!');
      router.push('/');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Registration failed');
      throw axiosError;
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
      <Suspense fallback={null}>
        <ReturnUrlSync onChange={handleSearchParamsChange} />
      </Suspense>
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
