// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import axios from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuthTokens } from '@/features/auth/types/auth.type';
import { User } from '@/features/users/types/user.types';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const response = await axios.post<{ user: User; accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      { username, password }
    );

    const { user, accessToken, refreshToken } = response.data;
    const tokens: AuthTokens = { accessToken, refreshToken };

    // Set session cookie
    await setSession(tokens);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Login failed';
    return NextResponse.json({ message }, { status });
  }
}
