'use client';

import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <RegisterForm />
    </div>
  );
}
