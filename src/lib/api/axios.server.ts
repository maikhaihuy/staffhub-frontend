// src/lib/api/axios.server.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, setSession } from '@/lib/session';
import { API_ENDPOINTS } from './endpoints';
import { AuthTokens } from '@/features/auth/types/auth.type';

const serverInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

serverInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (session?.tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${session.tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

serverInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const session = await getSession();

      if (session?.tokens?.refreshToken) {
        try {
          const response = await axios.post<AuthTokens>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken: session.tokens.refreshToken }
          );

          const { accessToken, refreshToken } = response.data;
          await setSession({ accessToken, refreshToken });

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return serverInstance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default serverInstance;
