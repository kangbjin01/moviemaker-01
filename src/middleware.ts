import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 보호된 경로 목록
const protectedRoutes = ["/projects", "/call-sheet"];

// 인증 페이지 (로그인한 사용자가 접근하면 리다이렉트)
const authRoutes = ["/login", "/register"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 인증된 사용자가 로그인/회원가입 페이지 접근 시 프로젝트로 리다이렉트
    if (token && authRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/projects", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // 보호된 경로가 아니면 항상 허용
        if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // 보호된 경로는 토큰이 있어야 허용
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};

