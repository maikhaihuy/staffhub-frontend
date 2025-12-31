// ============================================
// features/auth/hooks/useRegister.ts
// ============================================
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types/auth.type';

export const useRegister = () => {
  const { register } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
  });
};
