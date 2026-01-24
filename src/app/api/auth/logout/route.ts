// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearSession, getSession } from '@/lib/session';
import serverInstance from '@/lib/api/axios.server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuthTokens } from '@/features/auth/types/auth.type';

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      const { refreshToken } = (session.tokens as AuthTokens) || {};

      await serverInstance.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        { refreshToken },
      );
    }
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    await clearSession();
  }

  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}
