import { useAppMutation, FormErrorSetter } from '@/lib/hooks/common/useAppMutation';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordData } from '../types/auth.type';

// Routed through AuthContext.changePassword() (not authService directly) -
// it's the only path that refreshes the session afterward so the stored
// token stops carrying mustChangePassword: true. Skipping that step would
// leave the middleware gate bouncing the user straight back to
// /change-password after a successful change. AuthContext also owns the
// success/refresh-failure toasts and the post-change navigation, so no
// successMessage here - it would double up.
export const useChangePassword = (form?: FormErrorSetter) => {
  const { changePassword } = useAuth();

  return useAppMutation<void, ChangePasswordData>(
    (data) => changePassword(data),
    { form }
  );
};
