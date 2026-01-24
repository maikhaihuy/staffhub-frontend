// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import serverInstance from '@/lib/api/axios.server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { User } from '@/features/users/types/user.types';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const response = await serverInstance.get<User>(API_ENDPOINTS.AUTH.ME);

    return NextResponse.json({ user: response.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
