'use client';

import { useAuth } from '@/features/auth/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
