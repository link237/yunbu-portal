import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";

const PUBLIC_PREFIX = ["/", "/login", "/register", "/api/auth", "/favicon.ico", "/logo.svg", "/_next"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIX.some((p) => pathname === p || pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get("token")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const payload = verifyJWT(token);
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin 路由保护
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!payload.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // 把用户上下文注入到后续 handler 可读的请求头
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-team-id", payload.teamId);
  requestHeaders.set("x-is-admin", payload.isAdmin ? "true" : "false");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/apps/:path*",
    "/admin/:path*",
    "/api/:path*"
  ]
};
