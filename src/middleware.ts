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
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // access_token hết hạn nhưng còn refresh_token hợp lệ -> phiên vẫn có thể
  // khôi phục, để axios interceptor tự làm mới ngầm ở lần gọi API đầu tiên
  // trên trang thay vì bắt logout ngay khi điều hướng.
  const isRecoverable =
    !!token && isTokenExpired(token) && !!refreshToken && !isTokenExpired(refreshToken);
  const isSessionValid = (!!token && !isTokenExpired(token)) || isRecoverable;

  if (!isPublicPath && !isSessionValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', buildReturnUrl(pathname, search)); // lưu trang muốn vào
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete('access_token');
    return response;
  }

  // Đã login rồi mà vào /login -> về trang chủ
  if (isPublicPath && isSessionValid) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
