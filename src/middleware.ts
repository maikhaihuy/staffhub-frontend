import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildReturnUrl } from '@/lib/utils/returnUrl';
import { decodeJwt, isTokenExpired } from '@/lib/utils/jwt';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const CHANGE_PASSWORD_PATH = '/change-password';

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

  // Flagged user: confined to /change-password until they replace it,
  // regardless of how they reached this request (direct URL, bookmark,
  // reload) - none of which run the client-side login redirect.
  //
  // Only checked against a currently-valid (unexpired) access token - a
  // merely-recoverable session (expired access token, valid refresh token)
  // defers to the client-side axios interceptor's reactive
  // auth:password-change-required fallback once it actually refreshes and
  // makes a guarded API call, rather than decoding a stale token here.
  const isCurrentlyValid = !!token && !isTokenExpired(token);
  const claims = isCurrentlyValid
    ? decodeJwt<{ mustChangePassword?: boolean }>(token)
    : null;

  if (
    isCurrentlyValid &&
    claims?.mustChangePassword === true &&
    !pathname.startsWith(CHANGE_PASSWORD_PATH)
  ) {
    const changePasswordUrl = new URL(CHANGE_PASSWORD_PATH, request.url);
    changePasswordUrl.searchParams.set('returnUrl', buildReturnUrl(pathname, search));
    return NextResponse.redirect(changePasswordUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
