import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  
  // Kiểm tra token (middleware chỉ đọc được cookie, không đọc localStorage)
  // -> Cần chuyển token sang cookie (xem bước 2)
  const token = request.cookies.get('access_token')?.value;

  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname); // lưu trang muốn vào
    return NextResponse.redirect(loginUrl);
  }

  // Đã login rồi mà vào /login -> về trang chủ
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
