import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Subdomain Handling for Staff Check-in
  // Matches e.g. staff.greenenergyexpo.org.np, checkin.greenenergyexpo.org.np, staff.localhost:3000
  const isStaffSubdomain = host.startsWith("staff.") || host.startsWith("checkin.");

  if (isStaffSubdomain) {
    // If accessing root of staff subdomain, rewrite to /staff
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/staff", request.url));
    }
    // If accessing inner paths without /staff prefix, rewrite to /staff/:path
    if (
      !pathname.startsWith("/staff") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_next") &&
      !pathname.includes(".")
    ) {
      return NextResponse.rewrite(new URL(`/staff${pathname}`, request.url));
    }
  }

  // 2. Protect /staff routes EXCEPT /staff/login
  const isPublicStaffRoute = pathname === "/staff/login";
  if (pathname.startsWith("/staff") && !isPublicStaffRoute) {
    const staffToken = request.cookies.get("hhe_staff_token")?.value;
    const adminToken = request.cookies.get("hhe_admin_token")?.value;

    if (!staffToken && !adminToken) {
      const loginUrl = new URL("/staff/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect /admin routes EXCEPT public auth pages (/admin/login and /admin/register)
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
  matcher: ["/", "/admin/:path*", "/staff/:path*"],
};
