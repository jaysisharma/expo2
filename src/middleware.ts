import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { detectCrawler } from "@/lib/crawlers";
import { logCrawlerHit } from "@/lib/crawlerLog";
import { ADMIN_COOKIE, STAFF_COOKIE, verifySession } from "@/lib/session";

// APIs that need an admin login for every method
const ADMIN_ONLY_APIS = ["/api/admin/bulk-email", "/api/admin/traffic-insights", "/api/admin/short-links", "/api/news/scrape"];
// APIs whose GET is public (the website reads them) but whose writes need an admin login
const ADMIN_WRITE_APIS = [
  "/api/about",
  "/api/expo-journey",
  "/api/partners/current",
  "/api/badge-template",
  "/api/floor-plan/save",
  "/api/gallery",
  "/api/members",
  "/api/videos",
];
// /api/admin/data, /api/upload, /api/send-pass and /api/track check access themselves,
// because parts of them are intentionally public.

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdmin(request: NextRequest) {
  return verifySession(request.cookies.get(ADMIN_COOKIE)?.value, "admin");
}

async function isStaffOrAdmin(request: NextRequest) {
  return (await verifySession(request.cookies.get(STAFF_COOKIE)?.value, "staff")) || (await isAdmin(request));
}

function redirectToLogin(request: NextRequest, loginPath: string) {
  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // API protection
  if (pathname.startsWith("/api/")) {
    const needsAdmin =
      matches(pathname, ADMIN_ONLY_APIS) || (matches(pathname, ADMIN_WRITE_APIS) && request.method !== "GET");
    if (needsAdmin && !(await isAdmin(request))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 0. Log web crawler visits (Googlebot, AI crawlers, link previews…) without slowing the response
  const crawler = detectCrawler(request.headers.get("user-agent"));
  if (crawler && request.method === "GET") {
    event.waitUntil(logCrawlerHit(crawler, pathname));
  }

  // Floor plan builder edits the live floor plan — admins only
  if (pathname.startsWith("/floor-plan/builder") && !(await isAdmin(request))) {
    return redirectToLogin(request, "/admin/login");
  }

  // Auth / subdomain handling below only applies to the routes it was written for
  const isLegacyMatchedRoute = pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/staff");
  if (!isLegacyMatchedRoute) {
    return NextResponse.next();
  }
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
  if (pathname.startsWith("/staff") && !isPublicStaffRoute && !(await isStaffOrAdmin(request))) {
    return redirectToLogin(request, "/staff/login");
  }

  // 3. Protect /admin routes EXCEPT the login page
  const isPublicAdminRoute = pathname === "/admin/login";
  if (pathname.startsWith("/admin") && !isPublicAdminRoute && !(await isAdmin(request))) {
    return redirectToLogin(request, "/admin/login");
  }

  return NextResponse.next();
}

export const config = {
  // All page routes (crawler logging + auth) and API routes; Next.js assets and files with extensions are skipped,
  // except the crawler files below so robots, sitemap and llms.txt fetches show up in the crawler stats
  matcher: [
    "/api/:path*",
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/llms-full.txt",
  ],
};
