import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes EXCEPT public auth pages (/admin/login and /admin/register)
  const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/register";

  if (pathname.startsWith("/admin") && !isPublicAdminRoute) {
    const token = request.cookies.get("hhe_admin_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
