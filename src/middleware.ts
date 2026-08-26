import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildReturnUrl } from '@/lib/utils/returnUrl';
import { isTokenExpired } from '@/lib/utils/jwt';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Bỏ qua các route public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // Kiểm tra token (middleware chỉ đọc được cookie, không đọc localStorage)
  // -> Cần chuyển token sang cookie (xem bước 2)
  const token = request.cookies.get('access_token')?.value;

  if (!isPublicPath && (!token || isTokenExpired(token))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', buildReturnUrl(pathname, search)); // lưu trang muốn vào
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete('access_token');
    return response;
  }

  // Đã login rồi mà vào /login -> về trang chủ
  if (isPublicPath && token && !isTokenExpired(token)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
