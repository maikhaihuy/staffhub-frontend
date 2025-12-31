// ============================================
// features/auth/hooks/useLogin.ts
// ============================================
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types/auth.type';

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  });
};
