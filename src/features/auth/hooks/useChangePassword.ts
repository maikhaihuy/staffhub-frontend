import { useAppMutation, FormErrorSetter } from '@/lib/hooks/common/useAppMutation';
import { authService } from '../services/auth.service';
import { ChangePasswordData } from '../types/auth.type';

export const useChangePassword = (form?: FormErrorSetter) =>
  useAppMutation<void, ChangePasswordData>(
    (data) => authService.changePassword(data),
    {
      successMessage: 'Đổi mật khẩu thành công',
      form,
    }
  );
