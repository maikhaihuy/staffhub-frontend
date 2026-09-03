// ============================================
// features/auth/hooks/useChangePassword.ts
// ============================================
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordData } from '../types/auth.type';

export const useChangePassword = () => {
  const { changePassword } = useAuth();

  return useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data),
  });
};
