import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildReturnUrl } from '@/lib/utils/returnUrl';
import { decodeJwt } from '@/lib/utils/jwt';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const CHANGE_PASSWORD_PATH = '/change-password';

interface MiddlewareTokenClaims {
  exp?: number;
  mustChangePassword?: boolean;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Bỏ qua các route public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // Kiểm tra token (middleware chỉ đọc được cookie, không đọc localStorage)
  // -> Cần chuyển token sang cookie (xem bước 2)
  const token = request.cookies.get('access_token')?.value;

  // Decoded once and reused below - an undecodable/expired token fails the
  // session closed (redirect to /login), but a decodable token missing the
  // optional mustChangePassword claim fails that check open (not gated) -
  // it just means the backend hasn't started sending the claim yet.
  const claims = token ? decodeJwt<MiddlewareTokenClaims>(token) : null;
  const isExpired = !claims?.exp || claims.exp * 1000 <= Date.now();

  if (!isPublicPath && (!token || isExpired)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', buildReturnUrl(pathname, search)); // lưu trang muốn vào
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete('access_token');
    return response;
  }

  // Đã login rồi mà vào /login -> về trang chủ
  if (isPublicPath && token && !isExpired) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Flagged user: confined to /change-password until they replace it,
  // regardless of how they reached this request (direct URL, bookmark,
  // reload) - none of which run the client-side login redirect.
  if (
    token &&
    !isExpired &&
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
