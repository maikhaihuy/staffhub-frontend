// lib/axios.ts
import Cookies from 'js-cookie';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { isPasswordChangeRequired } from "./errors";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // if using cookies/session
});

const authCookieOptions = {
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};

// Token management utilities
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get('access_token') ?? null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get('refresh_token') ?? null;
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    Cookies.set('access_token', accessToken, authCookieOptions);
    Cookies.set('refresh_token', refreshToken, authCookieOptions);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    Cookies.remove('access_token', authCookieOptions);
    Cookies.remove('refresh_token', authCookieOptions);
  },
};

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add JWT token
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Reactive fallback: the backend's force-password-change guard rejected
    // this request. The session itself is still valid - don't clear tokens,
    // just let AuthContext redirect to /change-password. This is a
    // fallback for a token minted before the mustChangePassword claim
    // existed; login() and middleware.ts are the primary, proactive gates.
    if (error.response?.status === 403 && isPasswordChangeRequired(error)) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:password-change-required'));
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token - clear tokens and let AuthContext own the logout/redirect
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:session-expired'));
        }
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint. Mark this request as already-retried
        // so that if it 401s (expired/invalid refresh token), the response
        // interceptor rejects it immediately instead of queueing it behind
        // isRefreshing - which would deadlock, since nothing resolves that
        // queue until this very call settles.
        //
        // Backend's refresh-token passport strategy reads `refresh_token`
        // (snake_case) from the body while its validated DTO expects
        // `refreshToken` (camelCase) - send both until that's reconciled
        // (matches auth.service.ts's manual refresh/logout calls).
        const response = await instance.post(
          `/auth/refresh`,
          { refreshToken, refresh_token: refreshToken },
          { _retry: true } as AxiosRequestConfig & { _retry: boolean }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        tokenManager.setTokens(accessToken, newRefreshToken);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed - clear tokens and let AuthContext own the logout/redirect
        processQueue(refreshError as Error, null);
        tokenManager.clearTokens();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:session-expired'));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
